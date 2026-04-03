import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, ArrowLeft, Sparkles, ChevronRight, ChevronLeft, Truck, Shield, Gift, RotateCcw, Crown, Award, Heart, Star, ArrowUpRight, Diamond } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";

/* ─── CDN Images ─── */
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/hero-luxury-bw_3ea3dd72.jpg";
const CAT_BEAUTY = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/category-beauty_20be47a7.jpeg";
const CAT_SKINCARE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/category-skincare_54edb277.jpg";
const CAT_FRAGRANCE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/category-fragrance_8b4c595d.jpg";
const CAT_EXCLUSIVE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/category-exclusive_baece675.jpeg";

/* ─── Scroll Animation Hook ─── */
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("is-visible"); observer.unobserve(el); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Section({ children, className = "", animation = "animate-on-scroll" }: { children: React.ReactNode; className?: string; animation?: string }) {
  const ref = useScrollAnimation();
  return <div ref={ref} className={`${animation} ${className}`}>{children}</div>;
}

/* ─── Categories ─── */
const categories = [
  { name: "Beauty", nameAr: "الجمال", image: CAT_BEAUTY, slug: "beauty" },
  { name: "Skincare", nameAr: "العناية بالبشرة", image: CAT_SKINCARE, slug: "skincare" },
  { name: "Fragrance", nameAr: "العطور", image: CAT_FRAGRANCE, slug: "fragrance" },
  { name: "Exclusive", nameAr: "حصري", image: CAT_EXCLUSIVE, slug: "exclusive" },
];

/* ─── Testimonials ─── */
const testimonials = [
  { name: "Sarah M.", text: "The most refined shopping experience I've ever had. Every product feels curated with impeccable taste.", rating: 5 },
  { name: "Nora K.", text: "Elegance in every detail. From packaging to product quality, 4You exceeds all expectations.", rating: 5 },
  { name: "Layla A.", text: "Finally, a store that understands luxury. The attention to detail is extraordinary.", rating: 5 },
];

/* ─── Scroll To Top ─── */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-foreground text-background rounded-full shadow-xl flex items-center justify-center hover:bg-gold hover:text-gold-foreground transition-all duration-500"
      aria-label="Scroll to top"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN HOME PAGE - CHANEL-INSPIRED LUXURY
   ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const { t, isRTL } = useLanguage();
  const { data: productsData, isLoading } = trpc.products.list.useQuery({ limit: 8 });
  const products = productsData?.items || [];
  const [heroLoaded, setHeroLoaded] = useState(false);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-white">
      <SEOHead
        title={t.home.seoTitle}
        description={t.home.seoDesc}
        url="/"
      />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative h-[100vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt=""
            className={`w-full h-full object-cover transition-all duration-[2s] ${heroLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
            style={{ filter: "grayscale(100%) contrast(1.1)" }}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <div className="chanel-line mx-auto mb-8 bg-white/60" />
          <p className="text-white/60 text-[10px] tracking-luxury uppercase font-sans mb-6">
            {t.home.curatedCollection}
          </p>
          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6 font-bold uppercase tracking-tight">
            <>{t.home.heroTitle1}<span className="block mt-2">{t.home.heroTitle2}</span></>
          </h1>
          <p className="text-white/60 text-sm md:text-base font-sans font-light max-w-xl mx-auto mb-10 leading-relaxed">
            {t.home.heroDesc}
          </p>
          <Link href="/products">
            <button className="group bg-transparent text-white px-10 py-4 text-[11px] tracking-widest uppercase font-sans hover:bg-white hover:text-black transition-all duration-500 border border-white">
              {t.home.discoverCollection}
              <ArrowIcon className="inline-block ml-3 w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </button>
          </Link>
          <div className="chanel-line mx-auto mt-10 bg-white/25" />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/30 text-[9px] tracking-luxury uppercase">{t.home.scroll}</span>
          <div className="w-px h-8 bg-white/15 animate-pulse" />
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <Section>
        <section className="border-b border-border/30 py-8">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { icon: Truck, title: t.home.fastShipping, desc: t.home.fastShippingDesc },
                { icon: Shield, title: t.home.securePayment, desc: t.home.securePaymentDesc },
                { icon: Gift, title: t.home.premiumQuality, desc: t.home.premiumQualityDesc },
                { icon: RotateCcw, title: t.home.easyReturns, desc: t.home.easyReturnsDesc },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 group">
                  <f.icon className="w-4 h-4 text-foreground/40 group-hover:text-foreground transition-colors" strokeWidth={1.2} />
                  <div>
                    <p className="text-[11px] font-medium tracking-wide text-foreground">{f.title}</p>
                    <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="py-24 md:py-32">
        <div className="container">
          <Section>
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-luxury uppercase text-muted-foreground mb-4">
                {t.home.ourCollections}
              </p>
              <h2 className="font-sans text-3xl md:text-4xl text-foreground font-bold uppercase tracking-tight">
                {t.home.exploreByCategory}
              </h2>
              <div className="w-16 h-px bg-black mx-auto mt-6" />
            </div>
          </Section>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Section key={cat.slug}>
                <Link href={`/products?category=${cat.slug}`}>
                  <div className="group relative overflow-hidden aspect-[3/4] cursor-pointer">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ filter: "grayscale(30%)" }}
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-500" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-8">
                      <p className="text-white/70 text-[10px] tracking-luxury uppercase font-sans mb-2">{cat.nameAr}</p>
                      <h3 className="font-sans text-xl md:text-2xl text-white font-bold uppercase tracking-wide">{cat.name}</h3>
                      <div className="w-8 h-px bg-white/50 mt-3 group-hover:w-16 transition-all duration-500" />
                    </div>
                  </div>
                </Link>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section className="py-24 md:py-32 bg-secondary/30">
        <div className="container">
          <Section>
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-luxury uppercase text-muted-foreground mb-4">
                {t.home.handpickedForYou}
              </p>
              <h2 className="font-sans text-3xl md:text-4xl text-foreground font-bold uppercase tracking-tight">
                {t.home.featuredProducts}
              </h2>
              <div className="w-16 h-px bg-black mx-auto mt-6" />
            </div>
          </Section>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-muted/40 mb-3" />
                  <div className="h-2 bg-muted/40 w-1/3 mb-2" />
                  <div className="h-3 bg-muted/40 w-2/3 mb-2" />
                  <div className="h-2.5 bg-muted/40 w-1/4" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, 8).map((product) => (
                <Section key={product.id}>
                  <ProductCard product={product} />
                </Section>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t.common.comingSoon}</p>
            </div>
          )}

          <Section>
            <div className="text-center mt-14">
              <Link href="/products">
                <button className="group border border-black text-black px-10 py-3.5 text-[11px] tracking-widest uppercase font-sans hover:bg-black hover:text-white transition-all duration-500">
                  {t.home.viewAllProducts}
                  <ArrowIcon className="inline-block ml-3 w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </button>
              </Link>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ LUXURY OFFER ═══ */}
      <section className="py-24 md:py-32 bg-white text-black border-y border-black/10">
        <div className="container">
          <Section>
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-[10px] tracking-luxury uppercase text-black/40 mb-6">
                {t.home.limitedEdition}
              </p>
              <h2 className="font-sans text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight mb-6">
                <>{t.home.limitedTitle1}<span className="block">{t.home.limitedTitle2}</span></>
              </h2>
              <div className="w-16 h-px bg-black mx-auto mb-6" />
              <p className="text-black/50 font-sans font-light text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
                {t.home.limitedDesc}
              </p>
              <Link href="/products">
                <button className="group border border-black text-black px-10 py-4 text-[11px] tracking-widest uppercase font-sans hover:bg-black hover:text-white transition-all duration-500">
                  {t.home.shopNow}
                  <ArrowIcon className="inline-block ml-3 w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                </button>
              </Link>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-24 md:py-32">
        <div className="container">
          <Section>
            <div className="text-center mb-16">
              <p className="text-[10px] tracking-luxury uppercase text-muted-foreground mb-4">
                {t.home.whatTheySay}
              </p>
              <h2 className="font-sans text-3xl md:text-4xl text-foreground font-bold uppercase tracking-tight">
                {t.home.clientTestimonials}
              </h2>
              <div className="w-16 h-px bg-black mx-auto mt-6" />
            </div>
          </Section>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Section key={i}>
                <div className="text-center">
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-foreground text-foreground" />
                    ))}
                  </div>
                  <p className="font-heading text-sm md:text-base italic text-foreground leading-relaxed mb-6">
                    "{t.text}"
                  </p>
                  <div className="w-8 h-px bg-foreground/15 mx-auto mb-4" />
                  <p className="text-[10px] tracking-luxury uppercase text-muted-foreground font-sans">{t.name}</p>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <Section>
        <section className="py-16 md:py-20 border-y border-border/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
              {[
                { value: "500+", label: t.home.luxuryProducts, icon: Crown },
                { value: "13+", label: t.home.globalBrands, icon: Award },
                { value: "10K+", label: t.home.happyCustomers, icon: Heart },
                { value: "100%", label: t.home.authentic, icon: Shield },
              ].map((stat, i) => (
                <div key={i} className="group">
                  <stat.icon className="w-4 h-4 text-muted-foreground mx-auto mb-3" strokeWidth={1.2} />
                  <div className="text-2xl md:text-3xl font-heading italic text-foreground mb-1">{stat.value}</div>
                  <p className="text-[10px] tracking-luxury uppercase text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Section>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="py-24 md:py-32 bg-white text-black border-t border-black/10">
        <div className="container">
          <Section>
            <div className="max-w-lg mx-auto text-center">
              <Diamond className="w-4 h-4 text-black/30 mx-auto mb-6" strokeWidth={1.2} />
              <p className="text-[10px] tracking-widest uppercase text-black/40 mb-4">
                {t.home.stayConnected}
              </p>
              <h2 className="font-sans text-2xl md:text-3xl text-black font-bold uppercase tracking-tight mb-4">
                {t.home.joinOurWorld}
              </h2>
              <div className="w-16 h-px bg-black mx-auto mb-6" />
              <p className="text-black/40 text-sm font-sans font-light mb-8">
                {isRTL
                  ? "كن أول من يكتشف المجموعات الجديدة والعروض الحصرية."
                  : "Be the first to discover new collections, exclusive offers, and the art of refined living."}
              </p>
              <div className="flex gap-0 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t.home.yourEmail}
                  className="flex-1 bg-white border border-black/15 px-5 py-3.5 text-sm font-sans text-black placeholder:text-black/25 focus:outline-none focus:border-black transition-colors"
                />
                <button className="bg-black text-white px-6 py-3.5 text-[10px] tracking-widest uppercase font-sans hover:bg-black/80 transition-colors whitespace-nowrap">
                  {t.home.subscribe}
                </button>
              </div>
              <p className="text-black/25 text-[9px] mt-5 tracking-wide">
                {t.home.subscribeOffer}
              </p>
            </div>
          </Section>
        </div>
      </section>

      <ScrollToTop />
    </div>
  );
}
