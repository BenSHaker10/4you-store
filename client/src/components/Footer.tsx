import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="mt-auto bg-black text-white">
      {/* Thin gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="container py-20 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3">
            <h3 className="font-heading text-3xl italic mb-3">
              <span className="font-light">4</span>You
            </h3>
            <p className="text-[10px] tracking-luxury uppercase text-white/25 font-sans mb-6">
              {isRTL ? "الأناقة بين يديك" : "Elegance Redefined"}
            </p>
            <p className="text-[12px] font-sans text-white/30 leading-relaxed max-w-xs">
              {t.footer.description}
            </p>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <h4 className="text-[9px] font-sans tracking-luxury uppercase text-white/25 mb-8">{isRTL ? "تسوق" : "Shop"}</h4>
            <ul className="space-y-4">
              <li><Link href="/products?department=women" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{t.nav.women}</Link></li>
              <li><Link href="/products?department=men" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{t.nav.men}</Link></li>
              <li><Link href="/products?department=youth" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{t.nav.youth}</Link></li>
              <li><Link href="/products?department=kids" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{t.nav.kids}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-2">
            <h4 className="text-[9px] font-sans tracking-luxury uppercase text-white/25 mb-8">{isRTL ? "الفئات" : "Categories"}</h4>
            <ul className="space-y-4">
              <li><Link href="/products?category=perfumes" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{t.categories.perfumes}</Link></li>
              <li><Link href="/products?category=makeup" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{t.categories.makeup}</Link></li>
              <li><Link href="/products?category=skincare" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{t.categories.skincare}</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className="md:col-span-2">
            <h4 className="text-[9px] font-sans tracking-luxury uppercase text-white/25 mb-8">{t.footer.customerService}</h4>
            <ul className="space-y-4">
              <li><span className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300 cursor-pointer">{t.footer.shippingPolicy}</span></li>
              <li><span className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300 cursor-pointer">{t.footer.returnPolicy}</span></li>
              <li><Link href="/orders" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{isRTL ? "تتبع الطلب" : "Track Order"}</Link></li>
              <li><span className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300 cursor-pointer">{t.footer.contactUs}</span></li>
              <li><Link href="/about" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{isRTL ? "من نحن" : "About Us"}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-3">
            <h4 className="text-[9px] font-sans tracking-luxury uppercase text-white/25 mb-8">{isRTL ? "ابقَ على اتصال" : "Stay Connected"}</h4>
            <p className="text-[12px] font-sans text-white/30 mb-5 leading-relaxed">
              {isRTL ? "احصل على خصم 15% على أول طلب" : "Get 15% off your first order"}
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder={t.newsletter.placeholder}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-[11px] font-sans text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-colors"
              />
              <button className="px-5 bg-white text-black text-[10px] font-sans tracking-luxury uppercase hover:bg-white/90 transition-colors whitespace-nowrap">
                {t.newsletter.button}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[10px] font-sans text-white/15 tracking-wide">&copy; {new Date().getFullYear()} 4You. {t.footer.rights}</span>
          <div className="flex gap-8">
            <span className="text-[10px] font-sans text-white/15 hover:text-white/40 cursor-pointer transition-colors">{t.footer.privacyPolicy}</span>
            <span className="text-[10px] font-sans text-white/15 hover:text-white/40 cursor-pointer transition-colors">{isRTL ? "شروط الخدمة" : "Terms"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
