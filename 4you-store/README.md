# 4You Stores - ملفات التعديلات الجاهزة

## بنية الملفات

```
4you-ready/
├── README.md                              ← أنت هنا (تعليمات الاستخدام)
├── index.html                             ← استبدل index.html في جذر المشروع
├── public/
│   ├── robots.txt                         ← انسخه إلى مجلد public/
│   └── sitemap.xml                        ← انسخه إلى مجلد public/
├── src/
│   ├── components/
│   │   ├── testimonials-data.ts           ← شهادات العملاء المعرّبة
│   │   └── FooterLegalSection.tsx         ← قسم البيانات القانونية للفوتر
│   ├── pages/
│   │   └── About.tsx                      ← صفحة "من نحن" الجديدة
│   └── i18n/
│       └── ar-footer-fix.ts              ← ترجمات الفوتر المعدّلة (عربي + إنجليزي)
└── nginx/
    └── 4you-stores.conf                   ← إعدادات Nginx المحسّنة
```

---

## خطوات التطبيق

### الخطوة 1: نسخ الملفات إلى مشروعك
```bash
# انسخ ملفات SEO إلى مجلد public
cp public/robots.txt    /مسار-مشروعك/public/
cp public/sitemap.xml   /مسار-مشروعك/public/

# استبدل index.html
cp index.html           /مسار-مشروعك/index.html
```

### الخطوة 2: تعديل الكود المصدري
1. افتح مشروعك في VS Code
2. ابحث عن `Sarah M.` واستبدل مصفوفة الشهادات (راجع `src/components/testimonials-data.ts`)
3. ابحث عن `+8619511382336` واستبدله برقمك السعودي
4. عدّل ترجمات الفوتر (راجع `src/i18n/ar-footer-fix.ts`)
5. أضف قسم البيانات القانونية في الفوتر (راجع `src/components/FooterLegalSection.tsx`)
6. أضف صفحة "من نحن" (راجع `src/pages/About.tsx`)

### الخطوة 3: بناء المشروع
```bash
cd /مسار-مشروعك
npm run build
```

### الخطوة 4: رفع الملفات للسيرفر
```bash
# رفع مجلد dist إلى السيرفر
rsync -avz --delete ./dist/ user@IP-السيرفر:/var/www/4you-stores/dist/
```

### الخطوة 5: تحديث Nginx على السيرفر
```bash
# الدخول للسيرفر
ssh user@IP-السيرفر

# نسخ إعدادات Nginx
sudo cp 4you-stores.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/4you-stores.conf /etc/nginx/sites-enabled/

# فحص وإعادة تشغيل
sudo nginx -t
sudo systemctl reload nginx
```

---

## تنبيهات مهمة
- استبدل `XXXXXXXXXX` برقم سجلك التجاري الفعلي
- استبدل `3XXXXXXXXXXXXX` برقمك الضريبي الفعلي
- استبدل `+966 50 000 0000` برقم هاتفك السعودي الفعلي
- استبدل `support@4you-stores.com` بإيميلك الفعلي
- استبدل العنوان بعنوانك الحقيقي
