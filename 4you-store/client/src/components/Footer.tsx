import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

export default function Footer() {
  const { t, isRTL } = useLanguage();
  const { data: contactData } = trpc.settings.getContactSettings.useQuery();

  const instagramUser = contactData?.instagram || "4_YOU_U_STORE";
  const tiktokUser = contactData?.tiktok || "4_YOU_U_STORE";
  const whatsappNum = contactData?.whatsapp || "";
  const whatsappNum2 = contactData?.whatsapp2 || "";
  const phone1 = contactData?.phone1 || "";
  const phone2 = contactData?.phone2 || "";

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
            <p className="text-[12px] font-sans text-white/30 leading-relaxed max-w-xs mb-6">
              {t.footer.description}
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              {/* Instagram */}
              <a
                href={`https://www.instagram.com/${instagramUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 hover:border-transparent transition-all duration-300 group"
                title="Instagram"
              >
                <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              {/* TikTok */}
              <a
                href={`https://www.tiktok.com/@${tiktokUser}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-black hover:border-white/30 transition-all duration-300 group"
                title="TikTok"
              >
                <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.16z"/>
                </svg>
              </a>
              {/* WhatsApp 1 */}
              {whatsappNum && (
                <a
                  href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-600 hover:border-transparent transition-all duration-300 group"
                  title="WhatsApp 1"
                >
                  <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
              {/* WhatsApp 2 */}
              {whatsappNum2 && (
                <a
                  href={`https://wa.me/${whatsappNum2.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-green-600 hover:border-transparent transition-all duration-300 group"
                  title="WhatsApp 2"
                >
                  <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              )}
            </div>
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

          {/* Help + Contact */}
          <div className="md:col-span-2">
            <h4 className="text-[9px] font-sans tracking-luxury uppercase text-white/25 mb-8">{t.footer.customerService}</h4>
            <ul className="space-y-4">
              <li><span className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300 cursor-pointer">{t.footer.shippingPolicy}</span></li>
              <li><span className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300 cursor-pointer">{t.footer.returnPolicy}</span></li>
              <li><Link href="/orders" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{isRTL ? "تتبع الطلب" : "Track Order"}</Link></li>
              <li><Link href="/about" className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300">{isRTL ? "من نحن" : "About Us"}</Link></li>
              {/* Phone numbers */}
              {phone1 && (
                <li>
                  <a href={`tel:${phone1}`} className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-1.5" dir="ltr">
                    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {phone1}
                  </a>
                </li>
              )}
              {phone2 && (
                <li>
                  <a href={`tel:${phone2}`} className="text-[12px] font-sans text-white/40 hover:text-white transition-colors duration-300 flex items-center gap-1.5" dir="ltr">
                    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {phone2}
                  </a>
                </li>
              )}
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
          <div className="flex gap-8 items-center">
            <a href={`https://www.instagram.com/${instagramUser}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-sans text-white/15 hover:text-white/40 transition-colors">
              @{instagramUser}
            </a>
            <span className="text-[10px] font-sans text-white/15 hover:text-white/40 cursor-pointer transition-colors">{t.footer.privacyPolicy}</span>
            <span className="text-[10px] font-sans text-white/15 hover:text-white/40 cursor-pointer transition-colors">{isRTL ? "شروط الخدمة" : "Terms"}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
