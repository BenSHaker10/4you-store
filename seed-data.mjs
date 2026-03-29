import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

async function seed() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("Connected. Seeding database...");

  // Insert categories
  await conn.execute(`INSERT IGNORE INTO categories (name, nameAr, slug, description, descriptionAr, image, sortOrder) VALUES
    ('Makeup', 'مكياج', 'makeup', 'Lipsticks, foundations, palettes & more', 'أحمر شفاه، كريم أساس، باليتات والمزيد', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/hero-makeup_5e4fa3b5.jpg', 1),
    ('Skincare', 'العناية بالبشرة', 'skincare', 'Serums, moisturizers & treatments', 'سيروم، مرطبات وعلاجات', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/hero-skincare_3680bfa1.jpg', 2),
    ('Perfumes', 'عطور', 'perfumes', 'Luxury fragrances for every occasion', 'عطور فاخرة لكل مناسبة', 'https://d2xsxph8kpxj0f.cloudfront.net/310419663030522584/MmHspuuRpmJpFJcsenBoBv/hero-perfume_00936beb.jpg', 3)`);
  console.log("Categories seeded.");

  // Get category IDs
  const [cats] = await conn.execute("SELECT id, slug FROM categories");
  const catMap = {};
  for (const c of cats) catMap[c.slug] = c.id;

  // Products data
  const products = [
    ["Velvet Matte Lipstick", "أحمر شفاه مخملي مطفي", "velvet-matte-lipstick", "Long-lasting velvet matte lipstick with rich pigmentation. Glides smoothly and stays comfortable all day.", "أحمر شفاه مخملي مطفي يدوم طويلاً بتصبغ غني. ينزلق بسلاسة ويبقى مريحاً طوال اليوم.", "24.99", "34.99", "Charlotte Tilbury", "LIP-001", 150, catMap.makeup, 1, "lipstick,matte,velvet"],
    ["Luminous Silk Foundation", "كريم أساس حريري مضيء", "luminous-silk-foundation", "Award-winning lightweight foundation that delivers a luminous, natural finish. Buildable coverage for a flawless look.", "كريم أساس خفيف حائز على جوائز يمنح لمسة نهائية مضيئة وطبيعية.", "64.00", null, "Giorgio Armani", "FND-001", 80, catMap.makeup, 1, "foundation,luminous,silk"],
    ["Soft Glam Eyeshadow Palette", "باليت ظلال عيون سوفت جلام", "soft-glam-eyeshadow-palette", "14 universally flattering shades in matte, metallic, and shimmer finishes.", "14 درجة لون مناسبة للجميع بلمسات مطفية ومعدنية ولامعة.", "44.00", "54.00", "Anastasia Beverly Hills", "PAL-001", 60, catMap.makeup, 1, "eyeshadow,palette,glam"],
    ["Volumizing Mascara", "ماسكارا مكثفة", "volumizing-mascara", "Dramatic volume and length in one coat. Smudge-proof formula that lasts up to 16 hours.", "حجم وطول مثيران في طبقة واحدة. تركيبة مقاومة للتلطخ تدوم حتى 16 ساعة.", "29.00", null, "Lancôme", "MAS-001", 200, catMap.makeup, 0, "mascara,volume,waterproof"],
    ["Setting Spray Mist", "رذاذ تثبيت المكياج", "setting-spray-mist", "Lightweight setting spray that locks makeup in place for up to 16 hours.", "رذاذ تثبيت خفيف يحافظ على المكياج لمدة تصل إلى 16 ساعة.", "35.00", "42.00", "Urban Decay", "SET-001", 120, catMap.makeup, 0, "setting spray,mist"],
    ["Contour & Highlight Kit", "مجموعة كونتور وهايلايت", "contour-highlight-kit", "Professional contour and highlight duo for sculpted, radiant features.", "ثنائي كونتور وهايلايت احترافي لملامح منحوتة ومشرقة.", "42.00", null, "Fenty Beauty", "CON-001", 90, catMap.makeup, 1, "contour,highlight,sculpt"],
    ["Hyaluronic Acid Serum", "سيروم حمض الهيالورونيك", "hyaluronic-acid-serum", "Intense hydration serum with pure hyaluronic acid. Plumps and smooths skin.", "سيروم ترطيب مكثف بحمض الهيالورونيك النقي. ينفخ ويملس البشرة.", "38.00", "48.00", "The Ordinary", "SER-001", 180, catMap.skincare, 1, "serum,hyaluronic,hydration"],
    ["Vitamin C Brightening Cream", "كريم فيتامين سي المفتح", "vitamin-c-brightening-cream", "Powerful vitamin C moisturizer that brightens and evens skin tone.", "مرطب فيتامين سي قوي يفتح ويوحد لون البشرة.", "52.00", null, "Drunk Elephant", "CRM-001", 100, catMap.skincare, 1, "vitamin c,brightening"],
    ["Retinol Night Treatment", "علاج الريتينول الليلي", "retinol-night-treatment", "Advanced retinol formula that works overnight to reduce fine lines and wrinkles.", "تركيبة ريتينول متقدمة تعمل أثناء الليل لتقليل الخطوط الدقيقة والتجاعيد.", "68.00", "85.00", "La Mer", "RET-001", 45, catMap.skincare, 0, "retinol,anti-aging"],
    ["Gentle Cleansing Foam", "رغوة تنظيف لطيفة", "gentle-cleansing-foam", "Soft, pH-balanced cleansing foam that removes makeup and impurities.", "رغوة تنظيف ناعمة متوازنة الحموضة تزيل المكياج والشوائب.", "28.00", null, "CeraVe", "CLN-001", 250, catMap.skincare, 0, "cleanser,foam,gentle"],
    ["SPF 50 Sunscreen Lotion", "لوشن واقي شمس SPF 50", "spf50-sunscreen-lotion", "Broad-spectrum SPF 50 sunscreen with lightweight, non-greasy formula.", "واقي شمس واسع الطيف SPF 50 بتركيبة خفيفة غير دهنية.", "32.00", "39.00", "Supergoop", "SUN-001", 160, catMap.skincare, 1, "sunscreen,SPF50"],
    ["Rose Oud Eau de Parfum", "عطر روز عود أو دو بارفان", "rose-oud-eau-de-parfum", "A luxurious blend of Bulgarian rose and rare oud wood. Rich, warm, and captivating.", "مزيج فاخر من الورد البلغاري وخشب العود النادر. غني ودافئ وآسر.", "185.00", "220.00", "Tom Ford", "PER-001", 30, catMap.perfumes, 1, "perfume,oud,rose,luxury"],
    ["Fresh Citrus Cologne", "كولونيا حمضيات منعشة", "fresh-citrus-cologne", "Vibrant citrus notes of bergamot and lemon with a base of white musk.", "نوتات حمضيات نابضة بالحياة من البرغموت والليمون مع قاعدة من المسك الأبيض.", "95.00", null, "Jo Malone", "PER-002", 70, catMap.perfumes, 0, "cologne,citrus,fresh"],
    ["Midnight Jasmine Perfume", "عطر ياسمين منتصف الليل", "midnight-jasmine-perfume", "An enchanting evening fragrance with jasmine, vanilla, and amber.", "عطر مسائي ساحر بالياسمين والفانيليا والعنبر.", "145.00", "175.00", "Dior", "PER-003", 50, catMap.perfumes, 1, "perfume,jasmine,evening"],
    ["Ocean Breeze Body Mist", "بخاخ جسم نسيم المحيط", "ocean-breeze-body-mist", "Light and refreshing body mist with oceanic and floral notes.", "بخاخ جسم خفيف ومنعش بنوتات بحرية وزهرية.", "35.00", null, "Victoria's Secret", "PER-004", 200, catMap.perfumes, 0, "body mist,ocean,fresh"],
  ];

  for (const p of products) {
    await conn.execute(
      `INSERT IGNORE INTO products (name, nameAr, slug, description, descriptionAr, price, compareAtPrice, brand, sku, stock, categoryId, featured, isActive, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?)`,
      p
    );
  }
  console.log("Products seeded.");

  // Get product IDs
  const [prods] = await conn.execute("SELECT id, slug FROM products");
  const prodMap = {};
  for (const p of prods) prodMap[p.slug] = p.id;

  // Product images
  const imageData = {
    "velvet-matte-lipstick": ["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1631214500115-598fc2cb8ada?w=600&h=600&fit=crop"],
    "luminous-silk-foundation": ["https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop"],
    "soft-glam-eyeshadow-palette": ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1583241800698-e8ab01830a07?w=600&h=600&fit=crop"],
    "volumizing-mascara": ["https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=600&h=600&fit=crop"],
    "setting-spray-mist": ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop"],
    "contour-highlight-kit": ["https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=600&fit=crop"],
    "hyaluronic-acid-serum": ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&h=600&fit=crop"],
    "vitamin-c-brightening-cream": ["https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&h=600&fit=crop"],
    "retinol-night-treatment": ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=600&fit=crop"],
    "gentle-cleansing-foam": ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=600&fit=crop"],
    "spf50-sunscreen-lotion": ["https://images.unsplash.com/photo-1532947974358-a218d18d8a18?w=600&h=600&fit=crop"],
    "rose-oud-eau-de-parfum": ["https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&h=600&fit=crop"],
    "fresh-citrus-cologne": ["https://images.unsplash.com/photo-1594035910387-fea081ac29e7?w=600&h=600&fit=crop"],
    "midnight-jasmine-perfume": ["https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&h=600&fit=crop", "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600&h=600&fit=crop"],
    "ocean-breeze-body-mist": ["https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&h=600&fit=crop"],
  };

  for (const [slug, images] of Object.entries(imageData)) {
    const pid = prodMap[slug];
    if (!pid) continue;
    for (let i = 0; i < images.length; i++) {
      await conn.execute(
        "INSERT IGNORE INTO product_images (productId, url, alt, sortOrder) VALUES (?, ?, ?, ?)",
        [pid, images[i], slug.replace(/-/g, " "), i]
      );
    }
  }
  console.log("Product images seeded.");

  // Product options
  const optionsData = {
    "velvet-matte-lipstick": [
      ["Shade", "Ruby Red", "0"], ["Shade", "Nude Pink", "0"], ["Shade", "Berry Wine", "2.00"], ["Shade", "Coral Sunset", "0"],
    ],
    "luminous-silk-foundation": [
      ["Shade", "Fair", "0"], ["Shade", "Light", "0"], ["Shade", "Medium", "0"], ["Shade", "Tan", "0"], ["Shade", "Deep", "0"],
    ],
    "rose-oud-eau-de-parfum": [
      ["Size", "30ml", "0"], ["Size", "50ml", "45.00"], ["Size", "100ml", "95.00"],
    ],
    "fresh-citrus-cologne": [
      ["Size", "30ml", "0"], ["Size", "100ml", "55.00"],
    ],
    "midnight-jasmine-perfume": [
      ["Size", "50ml", "0"], ["Size", "100ml", "65.00"],
    ],
    "hyaluronic-acid-serum": [
      ["Size", "30ml", "0"], ["Size", "60ml", "18.00"],
    ],
  };

  for (const [slug, options] of Object.entries(optionsData)) {
    const pid = prodMap[slug];
    if (!pid) continue;
    for (const [name, value, priceModifier] of options) {
      await conn.execute(
        "INSERT IGNORE INTO product_options (productId, name, value, priceModifier) VALUES (?, ?, ?, ?)",
        [pid, name, value, priceModifier]
      );
    }
  }
  console.log("Product options seeded.");

  console.log("Seeding complete!");
  await conn.end();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
