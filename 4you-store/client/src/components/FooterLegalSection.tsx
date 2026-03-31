// ====================================================================
// قسم البيانات القانونية في الفوتر
// ====================================================================
// أضف هذا الكود داخل مكون الفوتر (Footer.tsx)
// قبل سطر حقوق النشر مباشرة (قبل "جميع الحقوق محفوظة")
//
// مكان الملف الأصلي المتوقع:
//   src/components/Footer.tsx  أو  src/components/layout/Footer.tsx
// ====================================================================

import React from "react";

// ========================================
// غيّر هذه القيم لبياناتك الفعلية ↓↓↓
// ========================================
const COMMERCIAL_REGISTER = "XXXXXXXXXX";       // رقم السجل التجاري
const VAT_NUMBER = "3XXXXXXXXXXXXX";             // الرقم الضريبي
const ADDRESS = "الرياض، المملكة العربية السعودية"; // العنوان
const PHONE = "+966 50 000 0000";                // رقم الهاتف السعودي
// ========================================

export function FooterLegalSection() {
  return (
    <div className="border-t border-white/10 mt-8 pt-6">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white/50 text-xs">
        <span>سجل تجاري رقم: {COMMERCIAL_REGISTER}</span>
        <span className="hidden md:inline">|</span>
        <span>الرقم الضريبي: {VAT_NUMBER}</span>
        <span className="hidden md:inline">|</span>
        <span>{ADDRESS}</span>
        <span className="hidden md:inline">|</span>
        <span dir="ltr">{PHONE}</span>
      </div>
    </div>
  );
}

// ====================================================================
// طريقة الاستخدام:
// ====================================================================
// 1. افتح ملف Footer.tsx
// 2. أضف هذا السطر في أعلى الملف:
//      import { FooterLegalSection } from './FooterLegalSection';
// 3. أضف المكون قبل سطر حقوق النشر:
//      <FooterLegalSection />
//
// أو إذا تفضل بدون ملف منفصل، انسخ الـ JSX التالي مباشرة:
// ====================================================================
/*
  <div className="border-t border-white/10 mt-8 pt-6">
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-white/50 text-xs">
      <span>سجل تجاري رقم: XXXXXXXXXX</span>
      <span className="hidden md:inline">|</span>
      <span>الرقم الضريبي: 3XXXXXXXXXXXXX</span>
      <span className="hidden md:inline">|</span>
      <span>الرياض، المملكة العربية السعودية</span>
      <span className="hidden md:inline">|</span>
      <span dir="ltr">+966 50 000 0000</span>
    </div>
  </div>
*/
