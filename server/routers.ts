import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { sdk } from "./_core/sdk";
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } from "./email";
import { sanitizeHtml, sanitizeUrl, isAllowedImageType, isWithinSizeLimit, MAX_FILE_SIZE } from "./security";

// Helper to strip sensitive fields from user object
function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, stripeCustomerId, ...safeUser } = user;
  return safeUser;
}

// Admin guard
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => sanitizeUser(opts.ctx.user)),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure.input(z.object({
      name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").transform(sanitizeHtml),
      email: z.string().email("Invalid email address").max(320, "Email too long").transform(v => v.toLowerCase().trim()),
      password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password too long"),
      origin: z.string().max(500).optional(),
    })).mutation(async ({ ctx, input }) => {
      // Check if email already exists
      const existing = await db.getUserByEmail(input.email);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 12);
      // Create user (not verified yet)
      const result = await db.createLocalUser({ name: input.name, email: input.email, passwordHash });
      if (!result) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create account" });
      // Create email verification token
      const verificationToken = nanoid(64);
      await db.createEmailVerificationToken(result.id, verificationToken);
      // Send verification email
      const origin = input.origin || "https://for4u.info";
      const verificationUrl = `${origin}/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(input.email, input.name, verificationUrl);
      // Return success WITHOUT creating session (user must verify email first)
      return { success: true, requiresVerification: true };
    }),
    verifyEmail: publicProcedure.input(z.object({
      token: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const verification = await db.getEmailVerificationByToken(input.token);
      if (!verification) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired verification link" });
      if (verification.usedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "This link has already been used" });
      if (new Date() > verification.expiresAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Verification link has expired. Please register again." });
      // Mark email as verified
      await db.markEmailVerificationUsed(verification.id);
      await db.markUserEmailVerified(verification.userId);
      // Get user and create session
      const userResult = await db.getUserById(verification.userId);
      if (!userResult) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      // Send welcome email
      await sendWelcomeEmail(userResult.email ?? "", userResult.name ?? "");
      // Create session
      const token = await sdk.createSessionToken(userResult.openId, { name: userResult.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
      return { success: true };
    }),
    login: publicProcedure.input(z.object({
      email: z.string().email("Invalid email address").max(320).transform(v => v.toLowerCase().trim()),
      password: z.string().min(1, "Password is required").max(128),
    })).mutation(async ({ ctx, input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      // Create session
      const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
      // Update last signed in
      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
      return { success: true, role: user.role };
    }),
    changePassword: protectedProcedure.input(z.object({
      currentPassword: z.string().min(1).max(128),
      newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
    })).mutation(async ({ ctx, input }) => {
      const user = await db.getUserByEmail(ctx.user.email ?? "");
      if (!user || !user.passwordHash) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change password for OAuth users" });
      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
      const newHash = await bcrypt.hash(input.newPassword, 12);
      await db.updateUserPassword(ctx.user.id, newHash);
      return { success: true };
    }),
    forgotPassword: publicProcedure.input(z.object({
      email: z.string().email().max(320).transform(v => v.toLowerCase().trim()),
      origin: z.string().url(),
    })).mutation(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);
      // Always return success to prevent email enumeration
      if (!user || !user.passwordHash) return { success: true };
      const token = await db.createPasswordResetToken(user.id);
      const resetUrl = `${input.origin}/reset-password?token=${token}`;
      await sendPasswordResetEmail(input.email, user.name || "عميلنا العزيز", resetUrl);
      return { success: true };
    }),
    resetPassword: publicProcedure.input(z.object({
      token: z.string().min(1).max(128),
      newPassword: z.string().min(8, "Password must be at least 8 characters").max(128),
    })).mutation(async ({ input }) => {
      const tokenRecord = await db.getPasswordResetToken(input.token);
      if (!tokenRecord) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset link" });
      const newHash = await bcrypt.hash(input.newPassword, 12);
      await db.updateUserPassword(tokenRecord.userId, newHash);
      await db.markPasswordResetTokenUsed(tokenRecord.id);
      return { success: true };
    }),
    updateProfile: protectedProcedure.input(z.object({
      name: z.string().max(100).transform(sanitizeHtml).optional(),
      phone: z.string().max(20).regex(/^[+\d\s()-]*$/, "Invalid phone number").optional(),
      address: z.string().max(500).transform(sanitizeHtml).optional(),
      city: z.string().max(100).transform(sanitizeHtml).optional(),
      country: z.string().max(100).transform(sanitizeHtml).optional(),
      zipCode: z.string().max(20).optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),
  }),

  // ─── Categories ──────────────────────────────────────
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getCategories();
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      return db.getCategoryBySlug(input.slug);
    }),
    create: adminProcedure.input(z.object({
      name: z.string(), nameAr: z.string().optional(), slug: z.string(),
      description: z.string().optional(), descriptionAr: z.string().optional(),
      image: z.string().optional(), department: z.enum(["women", "men", "kids", "youth", "unisex"]).optional(),
      parentId: z.number().optional(), sortOrder: z.number().optional(),
    })).mutation(async ({ input }) => {
      await db.createCategory(input);
      return { success: true };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), nameAr: z.string().optional(),
      slug: z.string().optional(), description: z.string().optional(),
      descriptionAr: z.string().optional(), image: z.string().optional(),
      department: z.enum(["women", "men", "kids", "youth", "unisex"]).optional(),
      parentId: z.number().nullable().optional(), sortOrder: z.number().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCategory(id, data);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteCategory(input.id);
      return { success: true };
    }),
  }),

  // ─── Products ────────────────────────────────────────
  products: router({
    list: publicProcedure.input(z.object({
      categoryId: z.number().optional(), search: z.string().optional(),
      brand: z.string().optional(), minPrice: z.number().optional(),
      maxPrice: z.number().optional(), featured: z.boolean().optional(),
      department: z.string().optional(),
      limit: z.number().optional(), offset: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      const result = await db.getProducts(input ?? {});
      const itemsWithImages = await Promise.all(
        result.items.map(async (p) => {
          const images = await db.getProductImages(p.id);
          return { ...p, images };
        })
      );
      return { items: itemsWithImages, total: result.total };
    }),
    bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
      const product = await db.getProductBySlug(input.slug);
      if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      const [images, options] = await Promise.all([
        db.getProductImages(product.id),
        db.getProductOptions(product.id),
      ]);
      return { ...product, images, options };
    }),
    brands: publicProcedure.query(async () => {
      return db.getBrands();
    }),
    create: adminProcedure.input(z.object({
      name: z.string(), nameAr: z.string().optional(), slug: z.string(),
      description: z.string().optional(), descriptionAr: z.string().optional(),
      price: z.string(), compareAtPrice: z.string().optional(),
      brand: z.string().optional(), sku: z.string().optional(),
      stock: z.number().optional(), categoryId: z.number().optional(),
      department: z.enum(["women", "men", "kids", "youth", "unisex"]).optional(),
      featured: z.boolean().optional(), tags: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = await db.createProduct(input);
      return { success: true, id };
    }),
    update: adminProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), nameAr: z.string().optional(),
      slug: z.string().optional(), description: z.string().optional(),
      descriptionAr: z.string().optional(), price: z.string().optional(),
      compareAtPrice: z.string().nullable().optional(),
      brand: z.string().optional(), sku: z.string().optional(),
      stock: z.number().optional(), categoryId: z.number().nullable().optional(),
      department: z.enum(["women", "men", "kids", "youth", "unisex"]).optional(),
      featured: z.boolean().optional(), isActive: z.boolean().optional(),
      tags: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateProduct(id, data);
      return { success: true };
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteProduct(input.id);
      return { success: true };
    }),
    addImage: adminProcedure.input(z.object({
      productId: z.number(), url: z.string(), alt: z.string().optional(), sortOrder: z.number().optional(),
    })).mutation(async ({ input }) => {
      await db.addProductImage(input);
      return { success: true };
    }),
    deleteImage: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteProductImage(input.id);
      return { success: true };
    }),
    addOption: adminProcedure.input(z.object({
      productId: z.number(), name: z.string(), value: z.string(),
      priceModifier: z.string().optional(), stock: z.number().optional(),
    })).mutation(async ({ input }) => {
      await db.addProductOption(input);
      return { success: true };
    }),
    deleteOption: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      await db.deleteProductOption(input.id);
      return { success: true };
    }),
  }),

  // ─── Cart ────────────────────────────────────────────
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getCartItems(ctx.user.id);
    }),
    count: protectedProcedure.query(async ({ ctx }) => {
      return db.getCartCount(ctx.user.id);
    }),
    add: protectedProcedure.input(z.object({
      productId: z.number().int().positive(), quantity: z.number().int().min(1).max(99).default(1),
      optionId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.addToCart(ctx.user.id, input.productId, input.quantity, input.optionId);
      return { success: true };
    }),
    updateQuantity: protectedProcedure.input(z.object({
      id: z.number().int().positive(), quantity: z.number().int().min(0).max(99),
    })).mutation(async ({ ctx, input }) => {
      await db.updateCartItemQuantity(input.id, ctx.user.id, input.quantity);
      return { success: true };
    }),
    remove: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.removeCartItem(input.id, ctx.user.id);
      return { success: true };
    }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // ─── Orders ──────────────────────────────────────────
  orders: router({
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user.id);
    }),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
      const order = await db.getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const items = await db.getOrderItems(order.id);
      return { ...order, items };
    }),
    create: protectedProcedure.input(z.object({
      shippingName: z.string().min(2).max(100).transform(sanitizeHtml),
      shippingEmail: z.string().email().max(320).transform(v => v.toLowerCase().trim()),
      shippingPhone: z.string().min(5).max(20).regex(/^[+\d\s()-]*$/, "Invalid phone"),
      shippingAddress: z.string().max(500).transform(sanitizeHtml).optional().default(""),
      shippingCity: z.string().min(2).max(100).transform(sanitizeHtml),
      shippingCountry: z.string().min(2).max(100).transform(sanitizeHtml),
      shippingZipCode: z.string().max(20).optional(),
      notes: z.string().max(1000).transform(sanitizeHtml).optional(),
      couponCode: z.string().max(50).optional(),
      paymentMethod: z.enum(["cod", "kuraimi"]).default("cod"),
      transferReference: z.string().max(255).transform(sanitizeHtml).optional(),
    })).mutation(async ({ ctx, input }) => {
      const cartItemsList = await db.getCartItems(ctx.user.id);
      if (cartItemsList.length === 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Cart is empty" });
      let totalAmount = 0;
      const orderItemsData: any[] = [];
      for (const item of cartItemsList) {
        if (!item.product) continue;
        const unitPrice = parseFloat(item.product.price) + (item.option ? parseFloat(item.option.priceModifier ?? "0") : 0);
        const itemTotal = unitPrice * item.quantity;
        totalAmount += itemTotal;
        orderItemsData.push({
          productId: item.productId,
          productName: item.product.name,
          productImage: item.images?.[0]?.url ?? null,
          optionName: item.option?.name ?? null,
          optionValue: item.option?.value ?? null,
          quantity: item.quantity,
          unitPrice: unitPrice.toFixed(2),
          totalPrice: itemTotal.toFixed(2),
        });
      }
      // Apply coupon if provided
      let discountAmount = 0;
      let couponId: number | undefined;
      if (input.couponCode) {
        const coupon = await db.getCouponByCode(input.couponCode);
        if (coupon) {
          const userUsage = await db.getUserCouponUsageCount(coupon.id, ctx.user.id);
          const eligibility = db.validateCouponEligibility(coupon, totalAmount, userUsage);
          if (eligibility.valid) {
            discountAmount = db.calculateDiscount(coupon, totalAmount);
            couponId = coupon.id;
          }
        }
      }
      const finalTotal = Math.max(totalAmount - discountAmount, 0);
      const orderId = await db.createOrder({
        userId: ctx.user.id,
        totalAmount: finalTotal.toFixed(2),
        couponId: couponId ?? null,
        couponCode: input.couponCode?.toUpperCase() ?? null,
        discountAmount: discountAmount.toFixed(2),
        shippingName: input.shippingName,
        shippingEmail: input.shippingEmail,
        shippingPhone: input.shippingPhone,
        shippingAddress: input.shippingAddress,
        shippingCity: input.shippingCity,
        shippingCountry: input.shippingCountry,
        shippingZipCode: input.shippingZipCode,
        notes: input.notes,
        paymentMethod: input.paymentMethod,
        transferReference: input.transferReference,
      });
      if (orderId) {
        await db.addOrderItems(orderItemsData.map(i => ({ ...i, orderId })));
        // Record coupon usage
        if (couponId && discountAmount > 0) {
          await db.recordCouponUsage({ couponId, userId: ctx.user.id, orderId, discountAmount: discountAmount.toFixed(2) });
        }
        await db.clearCart(ctx.user.id);
      }
      return { success: true, orderId, discountAmount };
    }),
  }),

  // ─── Coupons ─────────────────────────────────────────
  coupons: router({
    validate: protectedProcedure.input(z.object({
      code: z.string().min(1).max(50),
      orderTotal: z.number().min(0),
    })).mutation(async ({ ctx, input }) => {
      const coupon = await db.getCouponByCode(input.code);
      if (!coupon) throw new TRPCError({ code: "NOT_FOUND", message: "الكوبون غير موجود / Coupon not found" });
      const userUsage = await db.getUserCouponUsageCount(coupon.id, ctx.user.id);
      const eligibility = db.validateCouponEligibility(coupon, input.orderTotal, userUsage);
      if (!eligibility.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: eligibility.errorAr || eligibility.error || "Invalid coupon" });
      }
      const discount = db.calculateDiscount(coupon, input.orderTotal);
      return {
        valid: true,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: discount.toFixed(2),
        description: coupon.description,
        descriptionAr: coupon.descriptionAr,
      };
    }),
  }),

  // ─── Admin ───────────────────────────────────────────
  admin: router({
    stats: adminProcedure.query(async () => {
      return db.getAdminStats();
    }),
    orders: adminProcedure.input(z.object({
      status: z.string().optional(), limit: z.number().optional(), offset: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return db.getAllOrders(input ?? {});
    }),
    updateOrderStatus: adminProcedure.input(z.object({
      orderId: z.number(), status: z.string(),
    })).mutation(async ({ input }) => {
      await db.updateOrderStatus(input.orderId, input.status);
      return { success: true };
    }),
    users: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),
    // Coupon management
    listCoupons: adminProcedure.input(z.object({
      limit: z.number().optional(), offset: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return db.listCoupons(input ?? {});
    }),
    createCoupon: adminProcedure.input(z.object({
      code: z.string().min(2).max(50).transform(v => v.toUpperCase().trim()),
      description: z.string().max(500).optional(),
      descriptionAr: z.string().max(500).optional(),
      type: z.enum(["percentage", "fixed"]),
      value: z.string(),
      minOrderAmount: z.string().optional(),
      maxDiscountAmount: z.string().nullable().optional(),
      maxUses: z.number().int().positive().nullable().optional(),
      maxUsesPerUser: z.number().int().positive().optional().default(1),
      startsAt: z.string().nullable().optional(),
      expiresAt: z.string().nullable().optional(),
    })).mutation(async ({ input }) => {
      const existing = await db.getCouponByCode(input.code);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Coupon code already exists" });
      const id = await db.createCoupon({
        code: input.code,
        description: input.description ?? null,
        descriptionAr: input.descriptionAr ?? null,
        type: input.type,
        value: input.value,
        minOrderAmount: input.minOrderAmount ?? "0",
        maxDiscountAmount: input.maxDiscountAmount ?? null,
        maxUses: input.maxUses ?? null,
        maxUsesPerUser: input.maxUsesPerUser,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      });
      return { success: true, id };
    }),
    toggleCoupon: adminProcedure.input(z.object({
      id: z.number(), isActive: z.boolean(),
    })).mutation(async ({ input }) => {
      await db.toggleCoupon(input.id, input.isActive);
      return { success: true };
    }),
    deleteCoupon: adminProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input }) => {
      await db.deleteCoupon(input.id);
      return { success: true };
    }),
  }),

  // ─── Settings (Exchange Rate + Kuraimi) ────────────────────────
  settings: router({
    getExchangeRate: publicProcedure.query(async () => {
      return db.getExchangeRate();
    }),
    updateExchangeRate: adminProcedure.input(z.object({
      rate: z.number().positive("Rate must be positive"),
      enabled: z.boolean(),
    })).mutation(async ({ input }) => {
      await db.setExchangeRate(input.rate, input.enabled);
      return { success: true };
    }),
    getKuraimiSettings: publicProcedure.query(async () => {
      return db.getKuraimiSettings();
    }),
    updateKuraimiSettings: adminProcedure.input(z.object({
      enabled: z.boolean(),
      beneficiaryName: z.string().min(1).max(200),
      accountUSD: z.string().min(1).max(100),
      accountYER: z.string().min(1).max(100),
      accountSAR: z.string().min(1).max(100),
      instructions: z.string().max(1000).optional().default(""),
      instructionsAr: z.string().max(1000).optional().default(""),
    })).mutation(async ({ input }) => {
      await db.setKuraimiSettings(input);
      return { success: true };
    }),
  }),

  // ─── Reviews ────────────────────────────────────────
  reviews: router({
    byProduct: publicProcedure.input(z.object({ productId: z.number() })).query(async ({ input }) => {
      return db.getProductReviews(input.productId);
    }),
    stats: publicProcedure.input(z.object({ productId: z.number() })).query(async ({ input }) => {
      return db.getProductReviewStats(input.productId);
    }),
    create: protectedProcedure.input(z.object({
      productId: z.number().int().positive(),
      rating: z.number().int().min(1).max(5),
      title: z.string().max(200).transform(sanitizeHtml).optional(),
      comment: z.string().max(2000).transform(sanitizeHtml).optional(),
      imageUrls: z.array(z.string().max(2000).transform(sanitizeUrl)).max(5).optional(),
    })).mutation(async ({ ctx, input }) => {
      // Check if user already reviewed
      const alreadyReviewed = await db.hasUserReviewed(input.productId, ctx.user.id);
      if (alreadyReviewed) throw new TRPCError({ code: "CONFLICT", message: "You have already reviewed this product" });
      // Check if verified purchase
      const hasPurchased = await db.hasUserPurchasedProduct(input.productId, ctx.user.id);
      const reviewId = await db.createReview({
        productId: input.productId,
        userId: ctx.user.id,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerifiedPurchase: hasPurchased,
      });
      // Add images if provided
      if (reviewId && input.imageUrls && input.imageUrls.length > 0) {
        for (const url of input.imageUrls) {
          await db.addReviewImage({ reviewId, url });
        }
      }
      return { success: true, reviewId };
    }),
    delete: protectedProcedure.input(z.object({ reviewId: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteReview(input.reviewId, ctx.user.id);
      return { success: true };
    }),
    uploadImage: protectedProcedure.input(z.object({
      base64: z.string(), filename: z.string().max(255), contentType: z.string().max(100),
    })).mutation(async ({ input }) => {
      if (!isAllowedImageType(input.contentType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" });
      }
      if (!isWithinSizeLimit(input.base64)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Image too large. Maximum size is 5MB" });
      }
      const buffer = Buffer.from(input.base64, "base64");
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      const key = `reviews/${nanoid()}-${safeName}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url };
    }),
  }),

  // ─── Upload ──────────────────────────────────────────
  upload: router({
    image: adminProcedure.input(z.object({
      base64: z.string(), filename: z.string().max(255), contentType: z.string().max(100),
    })).mutation(async ({ input }) => {
      if (!isAllowedImageType(input.contentType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" });
      }
      if (!isWithinSizeLimit(input.base64, 10 * 1024 * 1024)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Image too large. Maximum size is 10MB" });
      }
      const buffer = Buffer.from(input.base64, "base64");
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      const key = `products/${nanoid()}-${safeName}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url };
    }),
  }),
});

export type AppRouter = typeof appRouter;
