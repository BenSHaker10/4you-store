import { eq, and, like, desc, asc, sql, inArray, or, gte, lte, gt, lt, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  categories, InsertCategory,
  products, InsertProduct,
  productImages, InsertProductImage,
  productOptions, InsertProductOption,
  cartItems, InsertCartItem,
  orders, InsertOrder,
  orderItems, InsertOrderItem,
  emailVerifications,
  storeSettings,
  coupons, InsertCoupon,
  couponUsage,
  passwordResetTokens,
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { nanoid } from 'nanoid';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; phone?: string; address?: string; city?: string; country?: string; zipCode?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Email/Password Auth ────────────────────────────────
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createLocalUser(data: { name: string; email: string; passwordHash: string; role?: "user" | "admin" }) {
  const db = await getDb();
  if (!db) return undefined;
  const openId = `local_${nanoid()}`;
  const result = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    loginMethod: "email",
    role: data.role ?? "user",
    lastSignedIn: new Date(),
  });
  return { id: result[0].insertId, openId };
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

// ─── Categories ──────────────────────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(categories).values(data);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Products ────────────────────────────────────────────
export async function getProducts(opts?: { categoryId?: number; search?: string; brand?: string; minPrice?: number; maxPrice?: number; featured?: boolean; department?: string; limit?: number; offset?: number; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const conditions = [];
  if (opts?.isActive !== false) conditions.push(eq(products.isActive, true));
  if (opts?.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts?.brand) conditions.push(eq(products.brand, opts.brand));
  if (opts?.featured) conditions.push(eq(products.featured, true));
  if (opts?.department) conditions.push(eq(products.department, opts.department as any));
  if (opts?.search) conditions.push(or(like(products.name, `%${opts.search}%`), like(products.nameAr, `%${opts.search}%`), like(products.brand, `%${opts.search}%`)));
  if (opts?.minPrice) conditions.push(gte(products.price, String(opts.minPrice)));
  if (opts?.maxPrice) conditions.push(lte(products.price, String(opts.maxPrice)));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [items, countResult] = await Promise.all([
    db.select().from(products).where(where).orderBy(desc(products.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ]);
  return { items, total: countResult[0]?.count ?? 0 };
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(products).values(data);
  return result[0].insertId;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(productImages).where(eq(productImages.productId, id));
  await db.delete(productOptions).where(eq(productOptions.productId, id));
  await db.delete(products).where(eq(products.id, id));
}

export async function getBrands() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ brand: products.brand }).from(products).where(and(eq(products.isActive, true), sql`${products.brand} IS NOT NULL`));
  return result.map(r => r.brand).filter(Boolean) as string[];
}

// ─── Product Images ──────────────────────────────────────
export async function getProductImages(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder));
}

export async function addProductImage(data: InsertProductImage) {
  const db = await getDb();
  if (!db) return;
  await db.insert(productImages).values(data);
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(productImages).where(eq(productImages.id, id));
}

// ─── Product Options ─────────────────────────────────────
export async function getProductOptions(productId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productOptions).where(eq(productOptions.productId, productId));
}

export async function addProductOption(data: InsertProductOption) {
  const db = await getDb();
  if (!db) return;
  await db.insert(productOptions).values(data);
}

export async function deleteProductOption(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(productOptions).where(eq(productOptions.id, id));
}

// ─── Cart ────────────────────────────────────────────────
export async function getCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  const enriched = [];
  for (const item of items) {
    const product = await getProductById(item.productId);
    const images = await getProductImages(item.productId);
    let option = null;
    if (item.optionId) {
      const opts = await getProductOptions(item.productId);
      option = opts.find(o => o.id === item.optionId) ?? null;
    }
    enriched.push({ ...item, product, images, option });
  }
  return enriched;
}

export async function addToCart(userId: number, productId: number, quantity: number, optionId?: number) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(cartItems).where(
    and(eq(cartItems.userId, userId), eq(cartItems.productId, productId), optionId ? eq(cartItems.optionId, optionId) : sql`${cartItems.optionId} IS NULL`)
  ).limit(1);
  if (existing.length > 0) {
    await db.update(cartItems).set({ quantity: existing[0].quantity + quantity }).where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity, optionId: optionId ?? null });
  }
}

export async function updateCartItemQuantity(id: number, userId: number, quantity: number) {
  const db = await getDb();
  if (!db) return;
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
  } else {
    await db.update(cartItems).set({ quantity }).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
  }
}

export async function removeCartItem(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}

export async function getCartCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: sql<number>`COALESCE(SUM(${cartItems.quantity}), 0)` }).from(cartItems).where(eq(cartItems.userId, userId));
  return result[0]?.total ?? 0;
}

// ─── Orders ──────────────────────────────────────────────
export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(orders).values(data);
  return result[0].insertId;
}

export async function addOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) return;
  if (items.length === 0) return;
  await db.insert(orderItems).values(items);
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getAllOrders(opts?: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const conditions = [];
  if (opts?.status && opts.status !== "all") conditions.push(eq(orders.status, opts.status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [items, countResult] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(where),
  ]);
  return { items, total: countResult[0]?.count ?? 0 };
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

export async function updateOrderPayment(sessionId: string, paymentIntentId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ paymentStatus: "paid", stripePaymentIntentId: paymentIntentId }).where(eq(orders.stripeSessionId, sessionId));
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0 };
  const [prodCount, orderCount, revenueResult, userCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")),
    db.select({ count: sql<number>`count(*)` }).from(users),
  ]);
  return {
    totalProducts: prodCount[0]?.count ?? 0,
    totalOrders: orderCount[0]?.count ?? 0,
    totalRevenue: revenueResult[0]?.total ?? 0,
    totalUsers: userCount[0]?.count ?? 0,
  };
}

// ─── Store Settings (Exchange Rate) ─────────────────────

export async function getStoreSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(storeSettings).where(eq(storeSettings.settingKey, key)).limit(1);
  return result[0]?.settingValue ?? null;
}

export async function setStoreSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(storeSettings).values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

export async function getExchangeRate(): Promise<{ rate: number; enabled: boolean }> {
  const [rateStr, enabledStr] = await Promise.all([
    getStoreSetting("yer_exchange_rate"),
    getStoreSetting("yer_enabled"),
  ]);
  return {
    rate: rateStr ? parseFloat(rateStr) : 250,
    enabled: enabledStr === "true",
  };
}

export async function setExchangeRate(rate: number, enabled: boolean): Promise<void> {
  await Promise.all([
    setStoreSetting("yer_exchange_rate", String(rate)),
    setStoreSetting("yer_enabled", String(enabled)),
  ]);
}

// ─── Email Verifications ─────────────────────────────────
export async function createEmailVerificationToken(userId: number, token: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await db.insert(emailVerifications).values({ userId, token, expiresAt });
}

export async function getEmailVerificationByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(emailVerifications)
    .where(eq(emailVerifications.token, token))
    .limit(1);
  return result[0];
}

export async function markEmailVerificationUsed(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(emailVerifications).set({ usedAt: new Date() }).where(eq(emailVerifications.id, id));
}

export async function markUserEmailVerified(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ─── Product Reviews ────────────────────────────────────
import { productReviews, reviewImages, InsertProductReview, InsertReviewImage } from "../drizzle/schema";

export async function getProductReviews(productId: number) {
  const db = await getDb();
  if (!db) return [];
  const reviews = await db.select().from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true)))
    .orderBy(desc(productReviews.createdAt));
  // Enrich with user info and images
  const enriched = [];
  for (const review of reviews) {
    const user = await getUserById(review.userId);
    const images = await db.select().from(reviewImages).where(eq(reviewImages.reviewId, review.id));
    enriched.push({
      ...review,
      userName: user?.name || "Anonymous",
      userInitial: (user?.name || "A").charAt(0).toUpperCase(),
      images,
    });
  }
  return enriched;
}

export async function getProductReviewStats(productId: number) {
  const db = await getDb();
  if (!db) return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const reviews = await db.select({ rating: productReviews.rating })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true)));
  const total = reviews.length;
  if (total === 0) return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });
  return { averageRating: Math.round((sum / total) * 10) / 10, totalReviews: total, distribution };
}

export async function createReview(data: { productId: number; userId: number; rating: number; title?: string; comment?: string; isVerifiedPurchase?: boolean }) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(productReviews).values({
    productId: data.productId,
    userId: data.userId,
    rating: data.rating,
    title: data.title || null,
    comment: data.comment || null,
    isVerifiedPurchase: data.isVerifiedPurchase ?? false,
  });
  return result[0].insertId;
}

export async function addReviewImage(data: { reviewId: number; url: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reviewImages).values(data);
}

export async function deleteReview(reviewId: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  // Delete images first
  await db.delete(reviewImages).where(eq(reviewImages.reviewId, reviewId));
  await db.delete(productReviews).where(and(eq(productReviews.id, reviewId), eq(productReviews.userId, userId)));
}

export async function hasUserReviewed(productId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: productReviews.id })
    .from(productReviews)
    .where(and(eq(productReviews.productId, productId), eq(productReviews.userId, userId)))
    .limit(1);
  return result.length > 0;
}

export async function hasUserPurchasedProduct(productId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(eq(orderItems.productId, productId), eq(orders.userId, userId)))
    .limit(1);
  return result.length > 0;
}

// ─── Coupons ────────────────────────────────────────────

export async function createCoupon(data: InsertCoupon) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(coupons).values(data);
  return result[0].insertId;
}

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
  return result[0];
}

export async function getCouponById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
  return result[0];
}

export async function listCoupons(opts?: { limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const [items, countResult] = await Promise.all([
    db.select().from(coupons).orderBy(desc(coupons.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0),
    db.select({ count: sql<number>`count(*)` }).from(coupons),
  ]);
  return { items, total: countResult[0]?.count ?? 0 };
}

export async function toggleCoupon(id: number, isActive: boolean) {
  const db = await getDb();
  if (!db) return;
  await db.update(coupons).set({ isActive }).where(eq(coupons.id, id));
}

export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(couponUsage).where(eq(couponUsage.couponId, id));
  await db.delete(coupons).where(eq(coupons.id, id));
}

export async function getUserCouponUsageCount(couponId: number, userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(couponUsage)
    .where(and(eq(couponUsage.couponId, couponId), eq(couponUsage.userId, userId)));
  return result[0]?.count ?? 0;
}

export async function recordCouponUsage(data: { couponId: number; userId: number; orderId?: number; discountAmount: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(couponUsage).values({
    couponId: data.couponId,
    userId: data.userId,
    orderId: data.orderId ?? null,
    discountAmount: data.discountAmount,
  });
  // Increment usedCount
  await db.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.id, data.couponId));
}

export function validateCouponEligibility(coupon: any, orderTotal: number, userUsageCount: number): { valid: boolean; error?: string; errorAr?: string } {
  if (!coupon) return { valid: false, error: "Coupon not found", errorAr: "الكوبون غير موجود" };
  if (!coupon.isActive) return { valid: false, error: "Coupon is inactive", errorAr: "الكوبون غير مفعل" };
  
  const now = new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return { valid: false, error: "Coupon is not yet active", errorAr: "الكوبون لم يبدأ بعد" };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return { valid: false, error: "Coupon has expired", errorAr: "الكوبون منتهي الصلاحية" };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Coupon usage limit reached", errorAr: "تم استنفاد الحد الأقصى لاستخدام الكوبون" };
  }
  if (coupon.maxUsesPerUser && userUsageCount >= coupon.maxUsesPerUser) {
    return { valid: false, error: "You have already used this coupon", errorAr: "لقد استخدمت هذا الكوبون بالفعل" };
  }
  const minOrder = parseFloat(coupon.minOrderAmount || "0");
  if (orderTotal < minOrder) {
    return { valid: false, error: `Minimum order amount is ${minOrder} SAR`, errorAr: `الحد الأدنى للطلب هو ${minOrder} ريال` };
  }
  return { valid: true };
}

export function calculateDiscount(coupon: any, orderTotal: number): number {
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = orderTotal * (parseFloat(coupon.value) / 100);
    const maxDiscount = coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount) : Infinity;
    discount = Math.min(discount, maxDiscount);
  } else {
    discount = parseFloat(coupon.value);
  }
  // Discount cannot exceed order total
  return Math.min(Math.round(discount * 100) / 100, orderTotal);
}

// ─── Password Reset Tokens ───────────────────────────────
export async function createPasswordResetToken(userId: number): Promise<string> {
  const db = (await getDb())!;
  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing tokens for this user first
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));

  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt,
  });
  return token;
}

export async function getPasswordResetToken(token: string) {
  const db = (await getDb())!;
  const rows = await db.select().from(passwordResetTokens)
    .where(and(
      eq(passwordResetTokens.token, token),
      isNull(passwordResetTokens.usedAt),
      gt(passwordResetTokens.expiresAt, new Date()),
    ))
    .limit(1);
  return rows[0] || null;
}

export async function markPasswordResetTokenUsed(tokenId: number) {
  const db = (await getDb())!;
  await db.update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, tokenId));
}

export async function deleteExpiredPasswordResetTokens() {
  const db = (await getDb())!;
  await db.delete(passwordResetTokens)
    .where(lt(passwordResetTokens.expiresAt, new Date()));
}
