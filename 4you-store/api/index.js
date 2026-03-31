// server/vercel.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, and, like, desc, asc, sql as sql2, or, gte, lte, gt, lt, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { sql } from "drizzle-orm";
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  zipCode: varchar("zipCode", { length: 20 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  image: text("image"),
  department: mysqlEnum("department", ["women", "men", "kids", "youth", "unisex"]).default("unisex"),
  parentId: int("parentId"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameAr: varchar("nameAr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compareAtPrice", { precision: 10, scale: 2 }),
  brand: varchar("brand", { length: 255 }),
  sku: varchar("sku", { length: 100 }),
  stock: int("stock").default(0).notNull(),
  categoryId: int("categoryId"),
  department: mysqlEnum("department", ["women", "men", "kids", "youth", "unisex"]).default("unisex"),
  featured: boolean("featured").default(false),
  isActive: boolean("isActive").default(true),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var productImages = mysqlTable("product_images", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var productOptions = mysqlTable("product_options", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  priceModifier: decimal("priceModifier", { precision: 10, scale: 2 }).default("0"),
  stock: int("stock").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var cartItems = mysqlTable("cart_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  optionId: int("optionId"),
  quantity: int("quantity").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  shippingName: varchar("shippingName", { length: 255 }),
  shippingEmail: varchar("shippingEmail", { length: 320 }),
  shippingPhone: varchar("shippingPhone", { length: 20 }),
  shippingAddress: text("shippingAddress"),
  shippingCity: varchar("shippingCity", { length: 100 }),
  shippingCountry: varchar("shippingCountry", { length: 100 }),
  shippingZipCode: varchar("shippingZipCode", { length: 20 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded"]).default("unpaid").notNull(),
  couponId: int("couponId"),
  couponCode: varchar("couponCode", { length: 50 }),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
  paymentMethod: varchar("paymentMethod", { length: 50 }).default("cod"),
  transferReference: varchar("transferReference", { length: 255 }),
  hiddenFromAdmin: boolean("hiddenFromAdmin").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  productImage: text("productImage"),
  optionName: varchar("optionName", { length: 100 }),
  optionValue: varchar("optionValue", { length: 255 }),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var storeSettings = mysqlTable("store_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var emailVerifications = mysqlTable("email_verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  usedAt: timestamp("usedAt").default(sql`NULL`),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var productReviews = mysqlTable("product_reviews", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(),
  // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  isVerifiedPurchase: boolean("isVerifiedPurchase").default(false),
  isApproved: boolean("isApproved").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var reviewImages = mysqlTable("review_images", {
  id: int("id").autoincrement().primaryKey(),
  reviewId: int("reviewId").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  type: mysqlEnum("type", ["percentage", "fixed"]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal("minOrderAmount", { precision: 10, scale: 2 }).default("0"),
  maxDiscountAmount: decimal("maxDiscountAmount", { precision: 10, scale: 2 }),
  maxUses: int("maxUses"),
  usedCount: int("usedCount").default(0).notNull(),
  maxUsesPerUser: int("maxUsesPerUser").default(1),
  isActive: boolean("isActive").default(true).notNull(),
  startsAt: timestamp("startsAt").default(sql`NULL`),
  expiresAt: timestamp("expiresAt").default(sql`NULL`),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var couponUsage = mysqlTable("coupon_usage", {
  id: int("id").autoincrement().primaryKey(),
  couponId: int("couponId").notNull(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").default(sql`CURRENT_TIMESTAMP`).notNull(),
  usedAt: timestamp("usedAt").default(sql`NULL`),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
import { nanoid } from "nanoid";
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = { openId: user.openId };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateUserProfile(userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}
async function createLocalUser(data) {
  const db = await getDb();
  if (!db) return void 0;
  const openId = `local_${nanoid()}`;
  const result = await db.insert(users).values({
    openId,
    name: data.name,
    email: data.email,
    passwordHash: data.passwordHash,
    loginMethod: "email",
    role: data.role ?? "user",
    lastSignedIn: /* @__PURE__ */ new Date()
  });
  return { id: result[0].insertId, openId };
}
async function updateUserPassword(userId, passwordHash) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}
async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(asc(categories.sortOrder));
}
async function getCategoryBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}
async function createCategory(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(categories).values(data);
}
async function updateCategory(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(categories).set(data).where(eq(categories.id, id));
}
async function deleteCategory(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(categories).where(eq(categories.id, id));
}
async function getProducts(opts) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const conditions = [];
  if (opts?.isActive !== false) conditions.push(eq(products.isActive, true));
  if (opts?.categoryId) conditions.push(eq(products.categoryId, opts.categoryId));
  if (opts?.brand) conditions.push(eq(products.brand, opts.brand));
  if (opts?.featured) conditions.push(eq(products.featured, true));
  if (opts?.department) conditions.push(eq(products.department, opts.department));
  if (opts?.search) conditions.push(or(like(products.name, `%${opts.search}%`), like(products.nameAr, `%${opts.search}%`), like(products.brand, `%${opts.search}%`)));
  if (opts?.minPrice) conditions.push(gte(products.price, String(opts.minPrice)));
  if (opts?.maxPrice) conditions.push(lte(products.price, String(opts.maxPrice)));
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const [items, countResult] = await Promise.all([
    db.select().from(products).where(where).orderBy(desc(products.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0),
    db.select({ count: sql2`count(*)` }).from(products).where(where)
  ]);
  return { items, total: countResult[0]?.count ?? 0 };
}
async function getProductBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}
async function getProductById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}
async function createProduct(data) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(products).values(data);
  return result[0].insertId;
}
async function updateProduct(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(products).set(data).where(eq(products.id, id));
}
async function deleteProduct(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(productImages).where(eq(productImages.productId, id));
  await db.delete(productOptions).where(eq(productOptions.productId, id));
  await db.delete(products).where(eq(products.id, id));
}
async function getBrands() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.selectDistinct({ brand: products.brand }).from(products).where(and(eq(products.isActive, true), sql2`${products.brand} IS NOT NULL`));
  return result.map((r) => r.brand).filter(Boolean);
}
async function getProductImages(productId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productImages).where(eq(productImages.productId, productId)).orderBy(asc(productImages.sortOrder));
}
async function addProductImage(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(productImages).values(data);
}
async function deleteProductImage(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(productImages).where(eq(productImages.id, id));
}
async function getProductOptions(productId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(productOptions).where(eq(productOptions.productId, productId));
}
async function addProductOption(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(productOptions).values(data);
}
async function deleteProductOption(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(productOptions).where(eq(productOptions.id, id));
}
async function getCartItems(userId) {
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
      option = opts.find((o) => o.id === item.optionId) ?? null;
    }
    enriched.push({ ...item, product, images, option });
  }
  return enriched;
}
async function addToCart(userId, productId, quantity, optionId) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(cartItems).where(
    and(eq(cartItems.userId, userId), eq(cartItems.productId, productId), optionId ? eq(cartItems.optionId, optionId) : sql2`${cartItems.optionId} IS NULL`)
  ).limit(1);
  if (existing.length > 0) {
    await db.update(cartItems).set({ quantity: existing[0].quantity + quantity }).where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ userId, productId, quantity, optionId: optionId ?? null });
  }
}
async function updateCartItemQuantity(id, userId, quantity) {
  const db = await getDb();
  if (!db) return;
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
  } else {
    await db.update(cartItems).set({ quantity }).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
  }
}
async function removeCartItem(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(and(eq(cartItems.id, id), eq(cartItems.userId, userId)));
}
async function clearCart(userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(cartItems).where(eq(cartItems.userId, userId));
}
async function getCartCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: sql2`COALESCE(SUM(${cartItems.quantity}), 0)` }).from(cartItems).where(eq(cartItems.userId, userId));
  return result[0]?.total ?? 0;
}
async function createOrder(data) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(orders).values(data);
  return result[0].insertId;
}
async function addOrderItems(items) {
  const db = await getDb();
  if (!db) return;
  if (items.length === 0) return;
  await db.insert(orderItems).values(items);
}
async function getUserOrders(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
}
async function getOrderById(orderId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result[0];
}
async function getOrderItems(orderId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}
async function getAllOrders(opts) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const conditions = [eq(orders.hiddenFromAdmin, false)];
  if (opts?.status && opts.status !== "all") conditions.push(eq(orders.status, opts.status));
  const where = and(...conditions);
  const [items, countResult] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0),
    db.select({ count: sql2`count(*)` }).from(orders).where(where)
  ]);
  return { items, total: countResult[0]?.count ?? 0 };
}
async function updateOrderStatus(orderId, status) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ status }).where(eq(orders.id, orderId));
}
async function hideOrderFromAdmin(orderId) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ hiddenFromAdmin: true }).where(eq(orders.id, orderId));
}
async function updatePaymentStatus(orderId, paymentStatus) {
  const db = await getDb();
  if (!db) return;
  await db.update(orders).set({ paymentStatus }).where(eq(orders.id, orderId));
}
async function getAdminStats() {
  const db = await getDb();
  if (!db) return { totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0 };
  const [prodCount, orderCount, revenueResult, userCount] = await Promise.all([
    db.select({ count: sql2`count(*)` }).from(products),
    db.select({ count: sql2`count(*)` }).from(orders),
    db.select({ total: sql2`COALESCE(SUM(${orders.totalAmount}), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")),
    db.select({ count: sql2`count(*)` }).from(users)
  ]);
  return {
    totalProducts: prodCount[0]?.count ?? 0,
    totalOrders: orderCount[0]?.count ?? 0,
    totalRevenue: revenueResult[0]?.total ?? 0,
    totalUsers: userCount[0]?.count ?? 0
  };
}
async function getStoreSetting(key) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(storeSettings).where(eq(storeSettings.settingKey, key)).limit(1);
  return result[0]?.settingValue ?? null;
}
async function setStoreSetting(key, value) {
  const db = await getDb();
  if (!db) return;
  await db.insert(storeSettings).values({ settingKey: key, settingValue: value }).onDuplicateKeyUpdate({ set: { settingValue: value } });
}
async function getExchangeRate() {
  const [rateStr, enabledStr] = await Promise.all([
    getStoreSetting("yer_exchange_rate"),
    getStoreSetting("yer_enabled")
  ]);
  return {
    rate: rateStr ? parseFloat(rateStr) : 250,
    enabled: enabledStr === "true"
  };
}
async function setExchangeRate(rate, enabled) {
  await Promise.all([
    setStoreSetting("yer_exchange_rate", String(rate)),
    setStoreSetting("yer_enabled", String(enabled))
  ]);
}
async function getKuraimiSettings() {
  const keys = [
    "kuraimi_enabled",
    "kuraimi_beneficiary_name",
    "kuraimi_account_usd",
    "kuraimi_account_yer",
    "kuraimi_account_sar",
    "kuraimi_instructions",
    "kuraimi_instructions_ar"
  ];
  const values = await Promise.all(keys.map((k) => getStoreSetting(k)));
  return {
    enabled: values[0] === "true",
    beneficiaryName: values[1] ?? "\u0645\u062D\u0645\u062F \u0634\u0627\u0643\u0631 \u0639\u0628\u062F\u0627\u0644\u0644\u0637\u064A\u0641 \u0633\u064A\u0641",
    accountUSD: values[2] ?? "123456789",
    accountYER: values[3] ?? "123456789",
    accountSAR: values[4] ?? "123456789",
    instructions: values[5] ?? "Please transfer the total amount to one of the accounts below and enter the transfer reference number.",
    instructionsAr: values[6] ?? "\u064A\u0631\u062C\u0649 \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0625\u0644\u0649 \u0623\u062D\u062F \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0623\u062F\u0646\u0627\u0647 \u0648\u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u062D\u0648\u0627\u0644\u0629."
  };
}
async function setKuraimiSettings(settings) {
  await Promise.all([
    setStoreSetting("kuraimi_enabled", String(settings.enabled)),
    setStoreSetting("kuraimi_beneficiary_name", settings.beneficiaryName),
    setStoreSetting("kuraimi_account_usd", settings.accountUSD),
    setStoreSetting("kuraimi_account_yer", settings.accountYER),
    setStoreSetting("kuraimi_account_sar", settings.accountSAR),
    setStoreSetting("kuraimi_instructions", settings.instructions),
    setStoreSetting("kuraimi_instructions_ar", settings.instructionsAr)
  ]);
}
async function getContactSettings() {
  const keys = [
    "contact_phone1",
    "contact_phone2",
    "contact_whatsapp",
    "contact_whatsapp2",
    "contact_instagram",
    "contact_tiktok"
  ];
  const values = await Promise.all(keys.map((k) => getStoreSetting(k)));
  return {
    phone1: values[0] ?? "",
    phone2: values[1] ?? "",
    whatsapp: values[2] ?? "",
    whatsapp2: values[3] ?? "",
    instagram: values[4] ?? "4_YOU_U_STORE",
    tiktok: values[5] ?? "4_YOU_U_STORE"
  };
}
async function setContactSettings(settings) {
  await Promise.all([
    setStoreSetting("contact_phone1", settings.phone1),
    setStoreSetting("contact_phone2", settings.phone2),
    setStoreSetting("contact_whatsapp", settings.whatsapp),
    setStoreSetting("contact_whatsapp2", settings.whatsapp2),
    setStoreSetting("contact_instagram", settings.instagram),
    setStoreSetting("contact_tiktok", settings.tiktok)
  ]);
}
async function createEmailVerificationToken(userId, token) {
  const db = await getDb();
  if (!db) return;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
  await db.insert(emailVerifications).values({ userId, token, expiresAt });
}
async function getEmailVerificationByToken(token) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(emailVerifications).where(eq(emailVerifications.token, token)).limit(1);
  return result[0];
}
async function markEmailVerificationUsed(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(emailVerifications).set({ usedAt: /* @__PURE__ */ new Date() }).where(eq(emailVerifications.id, id));
}
async function markUserEmailVerified(userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}
async function getProductReviews(productId) {
  const db = await getDb();
  if (!db) return [];
  const reviews = await db.select().from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true))).orderBy(desc(productReviews.createdAt));
  const enriched = [];
  for (const review of reviews) {
    const user = await getUserById(review.userId);
    const images = await db.select().from(reviewImages).where(eq(reviewImages.reviewId, review.id));
    enriched.push({
      ...review,
      userName: user?.name || "Anonymous",
      userInitial: (user?.name || "A").charAt(0).toUpperCase(),
      images
    });
  }
  return enriched;
}
async function getProductReviewStats(productId) {
  const db = await getDb();
  if (!db) return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const reviews = await db.select({ rating: productReviews.rating }).from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.isApproved, true)));
  const total = reviews.length;
  if (total === 0) return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    distribution[r.rating] = (distribution[r.rating] || 0) + 1;
  });
  return { averageRating: Math.round(sum / total * 10) / 10, totalReviews: total, distribution };
}
async function createReview(data) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.insert(productReviews).values({
    productId: data.productId,
    userId: data.userId,
    rating: data.rating,
    title: data.title || null,
    comment: data.comment || null,
    isVerifiedPurchase: data.isVerifiedPurchase ?? false
  });
  return result[0].insertId;
}
async function addReviewImage(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(reviewImages).values(data);
}
async function deleteReview(reviewId, userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(reviewImages).where(eq(reviewImages.reviewId, reviewId));
  await db.delete(productReviews).where(and(eq(productReviews.id, reviewId), eq(productReviews.userId, userId)));
}
async function hasUserReviewed(productId, userId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: productReviews.id }).from(productReviews).where(and(eq(productReviews.productId, productId), eq(productReviews.userId, userId))).limit(1);
  return result.length > 0;
}
async function hasUserPurchasedProduct(productId, userId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select({ id: orderItems.id }).from(orderItems).innerJoin(orders, eq(orderItems.orderId, orders.id)).where(and(eq(orderItems.productId, productId), eq(orders.userId, userId))).limit(1);
  return result.length > 0;
}
async function createCoupon(data) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.insert(coupons).values(data);
  return result[0].insertId;
}
async function getCouponByCode(code) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
  return result[0];
}
async function listCoupons(opts) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const [items, countResult] = await Promise.all([
    db.select().from(coupons).orderBy(desc(coupons.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0),
    db.select({ count: sql2`count(*)` }).from(coupons)
  ]);
  return { items, total: countResult[0]?.count ?? 0 };
}
async function toggleCoupon(id, isActive) {
  const db = await getDb();
  if (!db) return;
  await db.update(coupons).set({ isActive }).where(eq(coupons.id, id));
}
async function deleteCoupon(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(couponUsage).where(eq(couponUsage.couponId, id));
  await db.delete(coupons).where(eq(coupons.id, id));
}
async function getUserCouponUsageCount(couponId, userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql2`count(*)` }).from(couponUsage).where(and(eq(couponUsage.couponId, couponId), eq(couponUsage.userId, userId)));
  return result[0]?.count ?? 0;
}
async function recordCouponUsage(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(couponUsage).values({
    couponId: data.couponId,
    userId: data.userId,
    orderId: data.orderId ?? null,
    discountAmount: data.discountAmount
  });
  await db.update(coupons).set({ usedCount: sql2`${coupons.usedCount} + 1` }).where(eq(coupons.id, data.couponId));
}
function validateCouponEligibility(coupon, orderTotal, userUsageCount) {
  if (!coupon) return { valid: false, error: "Coupon not found", errorAr: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" };
  if (!coupon.isActive) return { valid: false, error: "Coupon is inactive", errorAr: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0641\u0639\u0644" };
  const now = /* @__PURE__ */ new Date();
  if (coupon.startsAt && new Date(coupon.startsAt) > now) {
    return { valid: false, error: "Coupon is not yet active", errorAr: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0644\u0645 \u064A\u0628\u062F\u0623 \u0628\u0639\u062F" };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
    return { valid: false, error: "Coupon has expired", errorAr: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" };
  }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Coupon usage limit reached", errorAr: "\u062A\u0645 \u0627\u0633\u062A\u0646\u0641\u0627\u062F \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0643\u0648\u0628\u0648\u0646" };
  }
  if (coupon.maxUsesPerUser && userUsageCount >= coupon.maxUsesPerUser) {
    return { valid: false, error: "You have already used this coupon", errorAr: "\u0644\u0642\u062F \u0627\u0633\u062A\u062E\u062F\u0645\u062A \u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0628\u0627\u0644\u0641\u0639\u0644" };
  }
  const minOrder = parseFloat(coupon.minOrderAmount || "0");
  if (orderTotal < minOrder) {
    return { valid: false, error: `Minimum order amount is ${minOrder} SAR`, errorAr: `\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0637\u0644\u0628 \u0647\u0648 ${minOrder} \u0631\u064A\u0627\u0644` };
  }
  return { valid: true };
}
function calculateDiscount(coupon, orderTotal) {
  let discount = 0;
  if (coupon.type === "percentage") {
    discount = orderTotal * (parseFloat(coupon.value) / 100);
    const maxDiscount = coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount) : Infinity;
    discount = Math.min(discount, maxDiscount);
  } else {
    discount = parseFloat(coupon.value);
  }
  return Math.min(Math.round(discount * 100) / 100, orderTotal);
}
async function createPasswordResetToken(userId) {
  const db = await getDb();
  const token = nanoid(64);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
  await db.insert(passwordResetTokens).values({
    userId,
    token,
    expiresAt
  });
  return token;
}
async function getPasswordResetToken(token) {
  const db = await getDb();
  const rows = await db.select().from(passwordResetTokens).where(and(
    eq(passwordResetTokens.token, token),
    isNull(passwordResetTokens.usedAt),
    gt(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
  )).limit(1);
  return rows[0] || null;
}
async function markPasswordResetTokenUsed(tokenId) {
  const db = await getDb();
  await db.update(passwordResetTokens).set({ usedAt: /* @__PURE__ */ new Date() }).where(eq(passwordResetTokens.id, tokenId));
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: isSecureRequest(req) ? "none" : "lax",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// server/storage.ts
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

// server/routers.ts
import { nanoid as nanoid2 } from "nanoid";
import bcrypt from "bcryptjs";

// server/email.ts
import nodemailer from "nodemailer";
function createTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass) {
    console.warn("[Email] GMAIL_USER or GMAIL_APP_PASSWORD not configured. Emails will not be sent.");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });
}
async function sendVerificationEmail(toEmail, toName, verificationUrl) {
  const transporter = createTransporter();
  if (!transporter) return false;
  const fromEmail = process.env.GMAIL_USER;
  try {
    await transporter.sendMail({
      from: `"4 YOU Store" <${fromEmail}>`,
      to: toEmail,
      subject: "\u062A\u0623\u0643\u064A\u062F \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A - 4 YOU Store",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px;text-align:center;">
              <h1 style="color:#d4af37;margin:0;font-size:32px;letter-spacing:4px;font-weight:300;">4 YOU</h1>
              <p style="color:#888;margin:8px 0 0;font-size:13px;letter-spacing:2px;">PREMIUM BEAUTY STORE</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:50px 40px;text-align:center;">
              <div style="width:70px;height:70px;background:#fff8e1;border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:36px;">\u2709\uFE0F</span>
              </div>
              <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:24px;font-weight:600;">\u0645\u0631\u062D\u0628\u0627\u064B ${toName}!</h2>
              <p style="color:#555;font-size:16px;line-height:1.7;margin:0 0 32px;">
                \u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0633\u062C\u064A\u0644\u0643 \u0641\u064A \u0645\u062A\u062C\u0631 <strong>4 YOU</strong>. \u0644\u0625\u062A\u0645\u0627\u0645 \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628\u0643 \u0648\u062A\u0641\u0639\u064A\u0644\u0647\u060C \u064A\u0631\u062C\u0649 \u062A\u0623\u0643\u064A\u062F \u0639\u0646\u0648\u0627\u0646 \u0628\u0631\u064A\u062F\u0643 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0628\u0627\u0644\u0646\u0642\u0631 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631 \u0623\u062F\u0646\u0627\u0647.
              </p>
              <a href="${verificationUrl}" 
                 style="display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a1a;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:1px;box-shadow:0 4px 15px rgba(212,175,55,0.4);">
                \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A
              </a>
              <p style="color:#999;font-size:13px;margin:32px 0 0;line-height:1.6;">
                \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 <strong>24 \u0633\u0627\u0639\u0629</strong> \u0641\u0642\u0637.<br>
                \u0625\u0630\u0627 \u0644\u0645 \u062A\u0642\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u062D\u0633\u0627\u0628\u060C \u064A\u0645\u0643\u0646\u0643 \u062A\u062C\u0627\u0647\u0644 \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0;">
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px;text-align:center;">
              <p style="color:#aaa;font-size:12px;margin:0;line-height:1.6;">
                \xA9 2025 4 YOU Premium Beauty Store. \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.<br>
                \u0625\u0630\u0627 \u0643\u0627\u0646 \u0644\u062F\u064A\u0643 \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u060C \u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627 \u0639\u0644\u0649 
                <a href="mailto:support@4youstore.com" style="color:#d4af37;text-decoration:none;">support@4youstore.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    });
    console.log(`[Email] Verification email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    return false;
  }
}
async function sendWelcomeEmail(toEmail, toName) {
  const transporter = createTransporter();
  if (!transporter) return false;
  const fromEmail = process.env.GMAIL_USER;
  try {
    await transporter.sendMail({
      from: `"4 YOU Store" <${fromEmail}>`,
      to: toEmail,
      subject: "\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 \u0641\u064A 4 YOU Store! \u{1F31F}",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>\u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px;text-align:center;">
              <h1 style="color:#d4af37;margin:0;font-size:32px;letter-spacing:4px;font-weight:300;">4 YOU</h1>
              <p style="color:#888;margin:8px 0 0;font-size:13px;letter-spacing:2px;">PREMIUM BEAUTY STORE</p>
            </td>
          </tr>
          <tr>
            <td style="padding:50px 40px;text-align:center;">
              <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:24px;">\u{1F389} \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643 ${toName}!</h2>
              <p style="color:#555;font-size:16px;line-height:1.7;margin:0 0 24px;">
                \u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u062D\u0633\u0627\u0628\u0643 \u0628\u0646\u062C\u0627\u062D! \u0623\u0646\u062A \u0627\u0644\u0622\u0646 \u0639\u0636\u0648 \u0641\u064A \u0639\u0627\u0626\u0644\u0629 <strong>4 YOU</strong> \u0644\u0644\u062C\u0645\u0627\u0644 \u0627\u0644\u0641\u0627\u062E\u0631.
              </p>
              <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 32px;">
                \u0627\u0633\u062A\u0645\u062A\u0639 \u0628\u062A\u0633\u0648\u0642 \u0623\u0631\u0642\u0649 \u0627\u0644\u0639\u0637\u0648\u0631 \u0648\u0627\u0644\u0645\u0643\u064A\u0627\u062C \u0648\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0646\u0627\u064A\u0629 \u0628\u0627\u0644\u0628\u0634\u0631\u0629 \u0645\u0646 \u0623\u0634\u0647\u0631 \u0627\u0644\u0645\u0627\u0631\u0643\u0627\u062A \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629.
              </p>
              <a href="${process.env.VITE_FRONTEND_URL || "https://for4u.info"}/products" 
                 style="display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a1a;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:700;">
                \u0627\u0628\u062F\u0623 \u0627\u0644\u062A\u0633\u0648\u0642 \u0627\u0644\u0622\u0646
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <p style="color:#aaa;font-size:12px;margin:0;">\xA9 2025 4 YOU Premium Beauty Store</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send welcome email:", error);
    return false;
  }
}
async function sendPasswordResetEmail(toEmail, toName, resetUrl) {
  const transporter = createTransporter();
  if (!transporter) return false;
  const fromEmail = process.env.GMAIL_USER;
  try {
    await transporter.sendMail({
      from: `"4 YOU Store" <${fromEmail}>`,
      to: toEmail,
      subject: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 - 4 YOU Store",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:0;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:6px;font-weight:300;font-family:Georgia,serif;font-style:italic;">4 YOU</h1>
              <div style="width:40px;height:1px;background:rgba(255,255,255,0.2);margin:12px auto 0;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:50px 40px;text-align:center;">
              <div style="width:60px;height:60px;border:1px solid #e0e0e0;border-radius:50%;margin:0 auto 24px;line-height:60px;">
                <span style="font-size:28px;">\u{1F510}</span>
              </div>
              <h2 style="color:#000;margin:0 0 12px;font-size:22px;font-weight:400;font-family:Georgia,serif;">\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</h2>
              <p style="color:#666;font-size:14px;line-height:1.8;margin:0 0 32px;font-family:Arial,sans-serif;">
                \u0645\u0631\u062D\u0628\u0627\u064B <strong>${toName}</strong>\u060C<br>
                \u0644\u0642\u062F \u062A\u0644\u0642\u064A\u0646\u0627 \u0637\u0644\u0628\u0627\u064B \u0644\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u062D\u0633\u0627\u0628\u0643 \u0641\u064A <strong>4 YOU</strong>.<br>
                \u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631 \u0623\u062F\u0646\u0627\u0647 \u0644\u0625\u0646\u0634\u0627\u0621 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062C\u062F\u064A\u062F\u0629.
              </p>
              <a href="${resetUrl}" 
                 style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:14px 48px;font-size:12px;font-weight:400;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">
                \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631
              </a>
              <p style="color:#999;font-size:12px;margin:32px 0 0;line-height:1.7;font-family:Arial,sans-serif;">
                \u0647\u0630\u0627 \u0627\u0644\u0631\u0627\u0628\u0637 \u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 <strong>\u0633\u0627\u0639\u0629 \u0648\u0627\u062D\u062F\u0629</strong> \u0641\u0642\u0637.<br>
                \u0625\u0630\u0627 \u0644\u0645 \u062A\u0637\u0644\u0628 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u060C \u064A\u0645\u0643\u0646\u0643 \u062A\u062C\u0627\u0647\u0644 \u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0628\u0623\u0645\u0627\u0646.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0;">
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px;text-align:center;">
              <p style="color:#bbb;font-size:11px;margin:0;line-height:1.6;font-family:Arial,sans-serif;">
                &copy; 2025 4 YOU. \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    });
    console.log(`[Email] Password reset email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error);
    return false;
  }
}

// server/security.ts
import rateLimit from "express-rate-limit";
import helmet from "helmet";
var generalLimiter = rateLimit({
  windowMs: 60 * 1e3,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." }
});
var uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many uploads. Please try again later." }
});
function setupSecurityHeaders(app2) {
  app2.use(
    helmet({
      contentSecurityPolicy: false,
      // Disabled for SPA compatibility
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app2.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });
}
function sanitizeHtml(input) {
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<[^>]*>/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").trim();
}
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid protocol");
    }
    return parsed.toString();
  } catch {
    return "";
  }
}
function isAllowedImageType(contentType) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
  return allowed.includes(contentType.toLowerCase());
}
var MAX_FILE_SIZE = 5 * 1024 * 1024;
function isWithinSizeLimit(base64, maxBytes = MAX_FILE_SIZE) {
  const estimatedBytes = Math.ceil(base64.length * 3 / 4);
  return estimatedBytes <= maxBytes;
}

// server/routers.ts
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, stripeCustomerId, ...safeUser } = user;
  return safeUser;
}
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => sanitizeUser(opts.ctx.user)),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    register: publicProcedure.input(z2.object({
      name: z2.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").transform(sanitizeHtml),
      email: z2.string().email("Invalid email address").max(320, "Email too long").transform((v) => v.toLowerCase().trim()),
      password: z2.string().min(8, "Password must be at least 8 characters").max(128, "Password too long"),
      origin: z2.string().max(500).optional()
    })).mutation(async ({ ctx, input }) => {
      const existing = await getUserByEmail(input.email);
      if (existing) throw new TRPCError3({ code: "CONFLICT", message: "Email already registered" });
      const passwordHash = await bcrypt.hash(input.password, 12);
      const result = await createLocalUser({ name: input.name, email: input.email, passwordHash });
      if (!result) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create account" });
      const verificationToken = nanoid2(64);
      await createEmailVerificationToken(result.id, verificationToken);
      const origin = input.origin || "https://for4u.info";
      const verificationUrl = `${origin}/verify-email?token=${verificationToken}`;
      await sendVerificationEmail(input.email, input.name, verificationUrl);
      return { success: true, requiresVerification: true };
    }),
    verifyEmail: publicProcedure.input(z2.object({
      token: z2.string()
    })).mutation(async ({ ctx, input }) => {
      const verification = await getEmailVerificationByToken(input.token);
      if (!verification) throw new TRPCError3({ code: "NOT_FOUND", message: "Invalid or expired verification link" });
      if (verification.usedAt) throw new TRPCError3({ code: "BAD_REQUEST", message: "This link has already been used" });
      if (/* @__PURE__ */ new Date() > verification.expiresAt) throw new TRPCError3({ code: "BAD_REQUEST", message: "Verification link has expired. Please register again." });
      await markEmailVerificationUsed(verification.id);
      await markUserEmailVerified(verification.userId);
      const userResult = await getUserById(verification.userId);
      if (!userResult) throw new TRPCError3({ code: "NOT_FOUND", message: "User not found" });
      await sendWelcomeEmail(userResult.email ?? "", userResult.name ?? "");
      const token = await sdk.createSessionToken(userResult.openId, { name: userResult.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1e3 });
      return { success: true };
    }),
    login: publicProcedure.input(z2.object({
      email: z2.string().email("Invalid email address").max(320).transform((v) => v.toLowerCase().trim()),
      password: z2.string().min(1, "Password is required").max(128)
    })).mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(input.email);
      if (!user || !user.passwordHash) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Invalid email or password" });
      const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1e3 });
      await upsertUser({ openId: user.openId, lastSignedIn: /* @__PURE__ */ new Date() });
      return { success: true, role: user.role };
    }),
    changePassword: protectedProcedure.input(z2.object({
      currentPassword: z2.string().min(1).max(128),
      newPassword: z2.string().min(8, "Password must be at least 8 characters").max(128)
    })).mutation(async ({ ctx, input }) => {
      const user = await getUserByEmail(ctx.user.email ?? "");
      if (!user || !user.passwordHash) throw new TRPCError3({ code: "BAD_REQUEST", message: "Cannot change password for OAuth users" });
      const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!valid) throw new TRPCError3({ code: "UNAUTHORIZED", message: "Current password is incorrect" });
      const newHash = await bcrypt.hash(input.newPassword, 12);
      await updateUserPassword(ctx.user.id, newHash);
      return { success: true };
    }),
    forgotPassword: publicProcedure.input(z2.object({
      email: z2.string().email().max(320).transform((v) => v.toLowerCase().trim()),
      origin: z2.string().url()
    })).mutation(async ({ input }) => {
      const user = await getUserByEmail(input.email);
      if (!user || !user.passwordHash) return { success: true };
      const token = await createPasswordResetToken(user.id);
      const resetUrl = `${input.origin}/reset-password?token=${token}`;
      await sendPasswordResetEmail(input.email, user.name || "\u0639\u0645\u064A\u0644\u0646\u0627 \u0627\u0644\u0639\u0632\u064A\u0632", resetUrl);
      return { success: true };
    }),
    resetPassword: publicProcedure.input(z2.object({
      token: z2.string().min(1).max(128),
      newPassword: z2.string().min(8, "Password must be at least 8 characters").max(128)
    })).mutation(async ({ input }) => {
      const tokenRecord = await getPasswordResetToken(input.token);
      if (!tokenRecord) throw new TRPCError3({ code: "BAD_REQUEST", message: "Invalid or expired reset link" });
      const newHash = await bcrypt.hash(input.newPassword, 12);
      await updateUserPassword(tokenRecord.userId, newHash);
      await markPasswordResetTokenUsed(tokenRecord.id);
      return { success: true };
    }),
    updateProfile: protectedProcedure.input(z2.object({
      name: z2.string().max(100).transform(sanitizeHtml).optional(),
      phone: z2.string().max(20).regex(/^[+\d\s()-]*$/, "Invalid phone number").optional(),
      address: z2.string().max(500).transform(sanitizeHtml).optional(),
      city: z2.string().max(100).transform(sanitizeHtml).optional(),
      country: z2.string().max(100).transform(sanitizeHtml).optional(),
      zipCode: z2.string().max(20).optional()
    })).mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    })
  }),
  // ─── Categories ──────────────────────────────────────
  categories: router({
    list: publicProcedure.query(async () => {
      return getCategories();
    }),
    bySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      return getCategoryBySlug(input.slug);
    }),
    create: adminProcedure2.input(z2.object({
      name: z2.string(),
      nameAr: z2.string().optional(),
      slug: z2.string(),
      description: z2.string().optional(),
      descriptionAr: z2.string().optional(),
      image: z2.string().optional(),
      department: z2.enum(["women", "men", "kids", "youth", "unisex"]).optional(),
      parentId: z2.number().optional(),
      sortOrder: z2.number().optional()
    })).mutation(async ({ input }) => {
      await createCategory(input);
      return { success: true };
    }),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      nameAr: z2.string().optional(),
      slug: z2.string().optional(),
      description: z2.string().optional(),
      descriptionAr: z2.string().optional(),
      image: z2.string().optional(),
      department: z2.enum(["women", "men", "kids", "youth", "unisex"]).optional(),
      parentId: z2.number().nullable().optional(),
      sortOrder: z2.number().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateCategory(id, data);
      return { success: true };
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteCategory(input.id);
      return { success: true };
    })
  }),
  // ─── Products ────────────────────────────────────────
  products: router({
    list: publicProcedure.input(z2.object({
      categoryId: z2.number().optional(),
      search: z2.string().optional(),
      brand: z2.string().optional(),
      minPrice: z2.number().optional(),
      maxPrice: z2.number().optional(),
      featured: z2.boolean().optional(),
      department: z2.string().optional(),
      limit: z2.number().optional(),
      offset: z2.number().optional()
    }).optional()).query(async ({ input }) => {
      const result = await getProducts(input ?? {});
      const itemsWithImages = await Promise.all(
        result.items.map(async (p) => {
          const images = await getProductImages(p.id);
          return { ...p, images };
        })
      );
      return { items: itemsWithImages, total: result.total };
    }),
    bySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      const product = await getProductBySlug(input.slug);
      if (!product) throw new TRPCError3({ code: "NOT_FOUND", message: "Product not found" });
      const [images, options] = await Promise.all([
        getProductImages(product.id),
        getProductOptions(product.id)
      ]);
      return { ...product, images, options };
    }),
    brands: publicProcedure.query(async () => {
      return getBrands();
    }),
    create: adminProcedure2.input(z2.object({
      name: z2.string(),
      nameAr: z2.string().optional(),
      slug: z2.string(),
      description: z2.string().optional(),
      descriptionAr: z2.string().optional(),
      price: z2.string(),
      compareAtPrice: z2.string().optional(),
      brand: z2.string().optional(),
      sku: z2.string().optional(),
      stock: z2.number().optional(),
      categoryId: z2.number().optional(),
      department: z2.enum(["women", "men", "kids", "youth", "unisex"]).optional(),
      featured: z2.boolean().optional(),
      tags: z2.string().optional()
    })).mutation(async ({ input }) => {
      const id = await createProduct(input);
      return { success: true, id };
    }),
    update: adminProcedure2.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      nameAr: z2.string().optional(),
      slug: z2.string().optional(),
      description: z2.string().optional(),
      descriptionAr: z2.string().optional(),
      price: z2.string().optional(),
      compareAtPrice: z2.string().nullable().optional(),
      brand: z2.string().optional(),
      sku: z2.string().optional(),
      stock: z2.number().optional(),
      categoryId: z2.number().nullable().optional(),
      department: z2.enum(["women", "men", "kids", "youth", "unisex"]).optional(),
      featured: z2.boolean().optional(),
      isActive: z2.boolean().optional(),
      tags: z2.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateProduct(id, data);
      return { success: true };
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteProduct(input.id);
      return { success: true };
    }),
    addImage: adminProcedure2.input(z2.object({
      productId: z2.number(),
      url: z2.string(),
      alt: z2.string().optional(),
      sortOrder: z2.number().optional()
    })).mutation(async ({ input }) => {
      await addProductImage(input);
      return { success: true };
    }),
    deleteImage: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteProductImage(input.id);
      return { success: true };
    }),
    addOption: adminProcedure2.input(z2.object({
      productId: z2.number(),
      name: z2.string(),
      value: z2.string(),
      priceModifier: z2.string().optional(),
      stock: z2.number().optional()
    })).mutation(async ({ input }) => {
      await addProductOption(input);
      return { success: true };
    }),
    deleteOption: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await deleteProductOption(input.id);
      return { success: true };
    })
  }),
  // ─── Cart ────────────────────────────────────────────
  cart: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getCartItems(ctx.user.id);
    }),
    count: protectedProcedure.query(async ({ ctx }) => {
      return getCartCount(ctx.user.id);
    }),
    add: protectedProcedure.input(z2.object({
      productId: z2.number().int().positive(),
      quantity: z2.number().int().min(1).max(99).default(1),
      optionId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      await addToCart(ctx.user.id, input.productId, input.quantity, input.optionId);
      return { success: true };
    }),
    updateQuantity: protectedProcedure.input(z2.object({
      id: z2.number().int().positive(),
      quantity: z2.number().int().min(0).max(99)
    })).mutation(async ({ ctx, input }) => {
      await updateCartItemQuantity(input.id, ctx.user.id, input.quantity);
      return { success: true };
    }),
    remove: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await removeCartItem(input.id, ctx.user.id);
      return { success: true };
    }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await clearCart(ctx.user.id);
      return { success: true };
    })
  }),
  // ─── Orders ──────────────────────────────────────────
  orders: router({
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      return getUserOrders(ctx.user.id);
    }),
    byId: protectedProcedure.input(z2.object({ id: z2.number() })).query(async ({ ctx, input }) => {
      const order = await getOrderById(input.id);
      if (!order) throw new TRPCError3({ code: "NOT_FOUND" });
      if (order.userId !== ctx.user.id && ctx.user.role !== "admin") throw new TRPCError3({ code: "FORBIDDEN" });
      const items = await getOrderItems(order.id);
      return { ...order, items };
    }),
    create: protectedProcedure.input(z2.object({
      shippingName: z2.string().min(2).max(100).transform(sanitizeHtml),
      shippingEmail: z2.string().email().max(320).transform((v) => v.toLowerCase().trim()),
      shippingPhone: z2.string().min(5).max(20).regex(/^[+\d\s()-]*$/, "Invalid phone"),
      shippingAddress: z2.string().max(500).transform(sanitizeHtml).optional().default(""),
      shippingCity: z2.string().min(2).max(100).transform(sanitizeHtml),
      shippingCountry: z2.string().min(2).max(100).transform(sanitizeHtml),
      shippingZipCode: z2.string().max(20).optional(),
      notes: z2.string().max(1e3).transform(sanitizeHtml).optional(),
      couponCode: z2.string().max(50).optional(),
      paymentMethod: z2.enum(["cod", "kuraimi"]).default("cod"),
      transferReference: z2.string().max(255).transform(sanitizeHtml).optional()
    })).mutation(async ({ ctx, input }) => {
      const cartItemsList = await getCartItems(ctx.user.id);
      if (cartItemsList.length === 0) throw new TRPCError3({ code: "BAD_REQUEST", message: "Cart is empty" });
      let totalAmount = 0;
      const orderItemsData = [];
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
          totalPrice: itemTotal.toFixed(2)
        });
      }
      let discountAmount = 0;
      let couponId;
      if (input.couponCode) {
        const coupon = await getCouponByCode(input.couponCode);
        if (coupon) {
          const userUsage = await getUserCouponUsageCount(coupon.id, ctx.user.id);
          const eligibility = validateCouponEligibility(coupon, totalAmount, userUsage);
          if (eligibility.valid) {
            discountAmount = calculateDiscount(coupon, totalAmount);
            couponId = coupon.id;
          }
        }
      }
      const finalTotal = Math.max(totalAmount - discountAmount, 0);
      const orderId = await createOrder({
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
        transferReference: input.transferReference
      });
      if (orderId) {
        await addOrderItems(orderItemsData.map((i) => ({ ...i, orderId })));
        if (couponId && discountAmount > 0) {
          await recordCouponUsage({ couponId, userId: ctx.user.id, orderId, discountAmount: discountAmount.toFixed(2) });
        }
        await clearCart(ctx.user.id);
      }
      return { success: true, orderId, discountAmount };
    })
  }),
  // ─── Coupons ─────────────────────────────────────────
  coupons: router({
    validate: protectedProcedure.input(z2.object({
      code: z2.string().min(1).max(50),
      orderTotal: z2.number().min(0)
    })).mutation(async ({ ctx, input }) => {
      const coupon = await getCouponByCode(input.code);
      if (!coupon) throw new TRPCError3({ code: "NOT_FOUND", message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F / Coupon not found" });
      const userUsage = await getUserCouponUsageCount(coupon.id, ctx.user.id);
      const eligibility = validateCouponEligibility(coupon, input.orderTotal, userUsage);
      if (!eligibility.valid) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: eligibility.errorAr || eligibility.error || "Invalid coupon" });
      }
      const discount = calculateDiscount(coupon, input.orderTotal);
      return {
        valid: true,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: discount.toFixed(2),
        description: coupon.description,
        descriptionAr: coupon.descriptionAr
      };
    })
  }),
  // ─── Admin ───────────────────────────────────────────
  admin: router({
    stats: adminProcedure2.query(async () => {
      return getAdminStats();
    }),
    orders: adminProcedure2.input(z2.object({
      status: z2.string().optional(),
      limit: z2.number().optional(),
      offset: z2.number().optional()
    }).optional()).query(async ({ input }) => {
      return getAllOrders(input ?? {});
    }),
    updateOrderStatus: adminProcedure2.input(z2.object({
      orderId: z2.number(),
      status: z2.string()
    })).mutation(async ({ input }) => {
      await updateOrderStatus(input.orderId, input.status);
      return { success: true };
    }),
    updatePaymentStatus: adminProcedure2.input(z2.object({
      orderId: z2.number(),
      paymentStatus: z2.enum(["paid", "unpaid"])
    })).mutation(async ({ input }) => {
      await updatePaymentStatus(input.orderId, input.paymentStatus);
      return { success: true };
    }),
    deleteOrder: adminProcedure2.input(z2.object({
      orderId: z2.number()
    })).mutation(async ({ input }) => {
      await hideOrderFromAdmin(input.orderId);
      return { success: true };
    }),
    users: adminProcedure2.query(async () => {
      return getAllUsers();
    }),
    // Coupon management
    listCoupons: adminProcedure2.input(z2.object({
      limit: z2.number().optional(),
      offset: z2.number().optional()
    }).optional()).query(async ({ input }) => {
      return listCoupons(input ?? {});
    }),
    createCoupon: adminProcedure2.input(z2.object({
      code: z2.string().min(2).max(50).transform((v) => v.toUpperCase().trim()),
      description: z2.string().max(500).optional(),
      descriptionAr: z2.string().max(500).optional(),
      type: z2.enum(["percentage", "fixed"]),
      value: z2.string(),
      minOrderAmount: z2.string().optional(),
      maxDiscountAmount: z2.string().nullable().optional(),
      maxUses: z2.number().int().positive().nullable().optional(),
      maxUsesPerUser: z2.number().int().positive().optional().default(1),
      startsAt: z2.string().nullable().optional(),
      expiresAt: z2.string().nullable().optional()
    })).mutation(async ({ input }) => {
      const existing = await getCouponByCode(input.code);
      if (existing) throw new TRPCError3({ code: "CONFLICT", message: "Coupon code already exists" });
      const id = await createCoupon({
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
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null
      });
      return { success: true, id };
    }),
    toggleCoupon: adminProcedure2.input(z2.object({
      id: z2.number(),
      isActive: z2.boolean()
    })).mutation(async ({ input }) => {
      await toggleCoupon(input.id, input.isActive);
      return { success: true };
    }),
    deleteCoupon: adminProcedure2.input(z2.object({
      id: z2.number()
    })).mutation(async ({ input }) => {
      await deleteCoupon(input.id);
      return { success: true };
    })
  }),
  // ─── Settings (Exchange Rate + Kuraimi) ────────────────────────
  settings: router({
    getExchangeRate: publicProcedure.query(async () => {
      return getExchangeRate();
    }),
    updateExchangeRate: adminProcedure2.input(z2.object({
      rate: z2.number().positive("Rate must be positive"),
      enabled: z2.boolean()
    })).mutation(async ({ input }) => {
      await setExchangeRate(input.rate, input.enabled);
      return { success: true };
    }),
    getKuraimiSettings: publicProcedure.query(async () => {
      return getKuraimiSettings();
    }),
    updateKuraimiSettings: adminProcedure2.input(z2.object({
      enabled: z2.boolean(),
      beneficiaryName: z2.string().min(1).max(200),
      accountUSD: z2.string().min(1).max(100),
      accountYER: z2.string().min(1).max(100),
      accountSAR: z2.string().min(1).max(100),
      instructions: z2.string().max(1e3).optional().default(""),
      instructionsAr: z2.string().max(1e3).optional().default("")
    })).mutation(async ({ input }) => {
      await setKuraimiSettings(input);
      return { success: true };
    }),
    getContactSettings: publicProcedure.query(async () => {
      return getContactSettings();
    }),
    updateContactSettings: adminProcedure2.input(z2.object({
      phone1: z2.string().max(30).default(""),
      phone2: z2.string().max(30).default(""),
      whatsapp: z2.string().max(30).default(""),
      whatsapp2: z2.string().max(30).default(""),
      instagram: z2.string().max(100).default(""),
      tiktok: z2.string().max(100).default("")
    })).mutation(async ({ input }) => {
      await setContactSettings(input);
      return { success: true };
    })
  }),
  // ─── Reviews ────────────────────────────────────────
  reviews: router({
    byProduct: publicProcedure.input(z2.object({ productId: z2.number() })).query(async ({ input }) => {
      return getProductReviews(input.productId);
    }),
    stats: publicProcedure.input(z2.object({ productId: z2.number() })).query(async ({ input }) => {
      return getProductReviewStats(input.productId);
    }),
    create: protectedProcedure.input(z2.object({
      productId: z2.number().int().positive(),
      rating: z2.number().int().min(1).max(5),
      title: z2.string().max(200).transform(sanitizeHtml).optional(),
      comment: z2.string().max(2e3).transform(sanitizeHtml).optional(),
      imageUrls: z2.array(z2.string().max(2e3).transform(sanitizeUrl)).max(5).optional()
    })).mutation(async ({ ctx, input }) => {
      const alreadyReviewed = await hasUserReviewed(input.productId, ctx.user.id);
      if (alreadyReviewed) throw new TRPCError3({ code: "CONFLICT", message: "You have already reviewed this product" });
      const hasPurchased = await hasUserPurchasedProduct(input.productId, ctx.user.id);
      const reviewId = await createReview({
        productId: input.productId,
        userId: ctx.user.id,
        rating: input.rating,
        title: input.title,
        comment: input.comment,
        isVerifiedPurchase: hasPurchased
      });
      if (reviewId && input.imageUrls && input.imageUrls.length > 0) {
        for (const url of input.imageUrls) {
          await addReviewImage({ reviewId, url });
        }
      }
      return { success: true, reviewId };
    }),
    delete: protectedProcedure.input(z2.object({ reviewId: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteReview(input.reviewId, ctx.user.id);
      return { success: true };
    }),
    uploadImage: protectedProcedure.input(z2.object({
      base64: z2.string(),
      filename: z2.string().max(255),
      contentType: z2.string().max(100)
    })).mutation(async ({ input }) => {
      if (!isAllowedImageType(input.contentType)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" });
      }
      if (!isWithinSizeLimit(input.base64)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Image too large. Maximum size is 5MB" });
      }
      const buffer = Buffer.from(input.base64, "base64");
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      const key = `reviews/${nanoid2()}-${safeName}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url };
    })
  }),
  // ─── Upload ──────────────────────────────────────────
  upload: router({
    image: adminProcedure2.input(z2.object({
      base64: z2.string(),
      filename: z2.string().max(255),
      contentType: z2.string().max(100)
    })).mutation(async ({ input }) => {
      if (!isAllowedImageType(input.contentType)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" });
      }
      if (!isWithinSizeLimit(input.base64, 10 * 1024 * 1024)) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Image too large. Maximum size is 10MB" });
      }
      const buffer = Buffer.from(input.base64, "base64");
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      const key = `products/${nanoid2()}-${safeName}`;
      const { url } = await storagePut(key, buffer, input.contentType);
      return { url };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/vercel.ts
var app = express();
app.set("trust proxy", 1);
setupSecurityHeaders(app);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/api/trpc", generalLimiter);
app.use("/api/oauth", authLimiter);
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var vercel_default = app;
export {
  vercel_default as default
};
