// ====================================================================
// صفحة "من نحن" - About Page
// ====================================================================
// 1. ضع هذا الملف في:  src/pages/About.tsx
// 2. في ملف التوجيه (src/App.tsx أو src/routes.tsx):
//    - ابحث عن سطر about
//    - تأكد أنه ليس داخل ProtectedRoute
//    - يجب أن يكون:  <Route path="/about" component={AboutPage} />
// ====================================================================

import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div
        className="relative py-24 text-white text-center"
        style={{
          background:
            "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2a2a2a 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="absolute bottom-10 left-20 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            من نحن
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto px-4">
            تعرّف على قصتنا ورؤيتنا في عالم الجمال والأناقة
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-14">
        {/* قصتنا */}
        <section>
          <h2
            className="text-2xl font-bold mb-4 text-foreground"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            قصتنا
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {/* ← غيّر هذا النص لقصتك الفعلية */}
            انطلق متجر 4 YOU من شغف حقيقي بعالم الجمال والأناقة. نؤمن بأن كل
            شخص يستحق الوصول إلى أرقى المنتجات العالمية بسهولة وثقة. نختار
            منتجاتنا بعناية فائقة من أفضل الماركات العالمية لنقدم لعملائنا تجربة
            تسوق استثنائية لا تُنسى.
          </p>
        </section>

        {/* رؤيتنا */}
        <section>
          <h2
            className="text-2xl font-bold mb-4 text-foreground"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            رؤيتنا
          </h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            نسعى لأن نكون الوجهة الأولى في المملكة العربية السعودية والخليج
            للعطور الفاخرة ومستحضرات التجميل والعناية بالبشرة، مع الحفاظ على
            أعلى معايير الجودة والأصالة في كل منتج نقدمه.
          </p>
        </section>

        {/* لماذا نحن */}
        <section>
          <h2
            className="text-2xl font-bold mb-6 text-foreground"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            لماذا تختار 4 YOU؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-black/[0.08] rounded-lg hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">✓</div>
              <h3 className="font-bold text-lg mb-2 text-foreground">
                منتجات أصلية 100%
              </h3>
              <p className="text-muted-foreground">
                جميع منتجاتنا أصلية ومستوردة مباشرة من الوكلاء المعتمدين
                والموزعين الرسميين.
              </p>
            </div>
            <div className="p-6 border border-black/[0.08] rounded-lg hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">🚚</div>
              <h3 className="font-bold text-lg mb-2 text-foreground">
                شحن سريع ومجاني
              </h3>
              <p className="text-muted-foreground">
                توصيل مجاني للطلبات فوق 250 ريال مع خدمة شحن سريعة لجميع مناطق
                المملكة.
              </p>
            </div>
            <div className="p-6 border border-black/[0.08] rounded-lg hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="font-bold text-lg mb-2 text-foreground">
                دفع آمن
              </h3>
              <p className="text-muted-foreground">
                نوفر طرق دفع متعددة وآمنة تشمل مدى، فيزا، ماستركارد، وأبل باي.
              </p>
            </div>
            <div className="p-6 border border-black/[0.08] rounded-lg hover:shadow-md transition-shadow">
              <div className="text-2xl mb-3">💬</div>
              <h3 className="font-bold text-lg mb-2 text-foreground">
                خدمة عملاء مميزة
              </h3>
              <p className="text-muted-foreground">
                فريق دعم متخصص جاهز لمساعدتك والإجابة على استفساراتك في أي وقت.
              </p>
            </div>
          </div>
        </section>

        {/* معلومات التواصل */}
        <section
          className="p-8 rounded-lg"
          style={{ backgroundColor: "rgba(0,0,0,0.03)" }}
        >
          <h2
            className="text-2xl font-bold mb-6 text-foreground"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            تواصل معنا
          </h2>
          <div className="space-y-3 text-muted-foreground text-lg">
            {/* ========================================
                غيّر هذه البيانات لبياناتك الفعلية ↓↓↓
                ======================================== */}
            <p>
              📧 البريد الإلكتروني:{" "}
              <a
                href="mailto:support@4you-stores.com"
                className="text-foreground hover:underline"
              >
                support@4you-stores.com
              </a>
            </p>
            <p>
              📞 الهاتف:{" "}
              <a
                href="tel:+966500000000"
                className="text-foreground hover:underline"
                dir="ltr"
              >
                +966 50 000 0000
              </a>
            </p>
            <p>📍 العنوان: الرياض، المملكة العربية السعودية</p>
            <p>📋 السجل التجاري: XXXXXXXXXX</p>
            <p>🧾 الرقم الضريبي: 3XXXXXXXXXXXXX</p>
          </div>
        </section>
      </div>
    </div>
  );
}
