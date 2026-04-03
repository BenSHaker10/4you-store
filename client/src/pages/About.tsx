import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft, Diamond, Award, Heart, Sparkles, Crown, Shield } from "lucide-react";
import SEOHead from "@/components/SEOHead";

/* ─── CDN Images (reuse existing) ─── */
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/hero-luxury-bw_3ea3dd72.jpg";
const CAT_FRAGRANCE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/category-fragrance_8b4c595d.jpg";
const CAT_BEAUTY = "https://d2xsxph8kpxj0f.cloudfront.net/310419663030484372/XnovjRfmZXUvsRtsthcxNS/category-beauty_20be47a7.jpeg";
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

/* ─── Counter Animation ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, 16);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Timeline Data ─── */
const timelineEn = [
  { year: "The Vision", title: "A Dream Takes Shape", desc: "Born from a passion for beauty and a belief that everyone deserves access to the finest products, 4You was conceived as more than a store — it was imagined as a sanctuary of elegance." },
  { year: "The Craft", title: "Curating Excellence", desc: "Every product in our collection undergoes a meticulous selection process. We partner only with brands that share our unwavering commitment to quality, authenticity, and artistry." },
  { year: "The Promise", title: "Redefining Luxury", desc: "We believe luxury should be an experience, not just a purchase. From the moment you browse our collection to the instant your order arrives, every touchpoint is designed to delight." },
  { year: "The Future", title: "Growing Together", desc: "As we expand our horizons, our core remains unchanged: to bring you the world's most exquisite beauty products with the care and attention you deserve." },
];

const timelineAr = [
  { year: "الرؤية", title: "حلم يتشكّل", desc: "وُلد 4You من شغف عميق بالجمال وإيمان بأن كل شخص يستحق الوصول إلى أرقى المنتجات. لم يكن مجرد متجر — بل ملاذ للأناقة." },
  { year: "الحرفة", title: "انتقاء التميّز", desc: "كل منتج في مجموعتنا يمر بعملية اختيار دقيقة. نتعاون فقط مع العلامات التجارية التي تشاركنا التزامنا الراسخ بالجودة والأصالة والفن." },
  { year: "الوعد", title: "إعادة تعريف الفخامة", desc: "نؤمن بأن الفخامة يجب أن تكون تجربة، لا مجرد عملية شراء. من لحظة تصفحك لمجموعتنا حتى وصول طلبك، كل تفصيل مصمم ليُبهرك." },
  { year: "المستقبل", title: "ننمو معاً", desc: "بينما نوسّع آفاقنا، يبقى جوهرنا ثابتاً: أن نقدم لك أرقى منتجات الجمال في العالم بالعناية والاهتمام الذي تستحقه." },
];

/* ─── Values Data ─── */
const valuesEn = [
  { icon: Diamond, title: "Authenticity", desc: "Every product is 100% genuine, sourced directly from authorized distributors and luxury houses." },
  { icon: Award, title: "Excellence", desc: "We set the highest standards in curation, packaging, and customer experience — nothing less." },
  { icon: Heart, title: "Passion", desc: "Beauty is our language. We are driven by a genuine love for the art of self-expression." },
  { icon: Shield, title: "Trust", desc: "Your confidence is our foundation. Secure transactions, transparent policies, and unwavering integrity." },
];

const valuesAr = [
  { icon: Diamond, title: "الأصالة", desc: "كل منتج أصلي 100%، مصدره مباشرة من الموزعين المعتمدين ودور الأزياء الفاخرة." },
  { icon: Award, title: "التميّز", desc: "نضع أعلى المعايير في الانتقاء والتغليف وتجربة العميل — لا نقبل بأقل من ذلك." },
  { icon: Heart, title: "الشغف", desc: "الجمال هو لغتنا. نحن مدفوعون بحب حقيقي لفن التعبير عن الذات." },
  { icon: Shield, title: "الثقة", desc: "ثقتكم هي أساسنا. معاملات آمنة، سياسات شفافة، ونزاهة لا تتزعزع." },
];

export default function About() {
  const { t, isRTL } = useLanguage();
  const timeline = isRTL ? timelineAr : timelineEn;
  const values = isRTL ? valuesAr : valuesEn;
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <div className="bg-white text-foreground">
      <SEOHead
        title={isRTL ? "من نحن" : "About Us"}
        description={isRTL ? "تعرف على قصة 4 YOU - وجهتك الأولى للعطور الفاخرة والمكياج والعناية بالبشرة" : "Learn about 4 YOU - Your premier destination for luxury perfumes, makeup and skincare"}
        url="/about"
      />

      {/* ═══ HERO ═══ */}
      <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_IMG} alt="4You Story" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <Section animation="animate-on-scroll">
            <p className="text-[10px] md:text-[11px] tracking-luxury uppercase text-white/40 font-sans mb-6">
              {isRTL ? "قصتنا" : "Our Story"}
            </p>
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl text-white italic leading-[1.15] mb-6">
              {isRTL ? (
                <>أكثر من متجر.<br /><span className="text-white/60">تجربة مُنتقاة.</span></>
              ) : (
                <>More Than a Store.<br /><span className="text-white/60">A Curated Experience.</span></>
              )}
            </h1>
            <div className="w-12 h-px bg-white/20 mx-auto mb-6" />
            <p className="text-[13px] md:text-[15px] font-sans text-white/50 max-w-xl mx-auto leading-relaxed">
              {isRTL
                ? "4You ليس مجرد متجر. إنه تجربة مُصمّمة بعناية لمن يقدّرون الأناقة والبساطة والجودة."
                : "4You is not just a store. It is a curated experience designed for those who value elegance, simplicity, and quality."
              }
            </p>
          </Section>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/30" />
        </div>
      </section>

      {/* ═══ BRAND PHILOSOPHY ═══ */}
      <section className="py-24 md:py-32">
        <div className="container">
          <Section>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[10px] tracking-luxury uppercase text-muted-foreground/50 font-sans mb-4">
                {isRTL ? "فلسفتنا" : "Our Philosophy"}
              </p>
              <div className="w-10 h-px bg-foreground/10 mx-auto mb-10" />
              <blockquote className="font-heading text-2xl md:text-3xl lg:text-4xl italic text-foreground/80 leading-relaxed mb-8">
                {isRTL
                  ? "نؤمن بأن الجمال الحقيقي يكمن في التفاصيل. كل منتج نختاره يحمل قصة، وكل قصة تستحق أن تُروى بأناقة."
                  : "We believe true beauty lies in the details. Every product we select carries a story, and every story deserves to be told with elegance."
                }
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-px bg-foreground/15" />
                <span className="text-[10px] tracking-luxury uppercase text-muted-foreground/40 font-sans">
                  {isRTL ? "مؤسس 4You" : "Founder of 4You"}
                </span>
                <div className="w-8 h-px bg-foreground/15" />
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ SPLIT IMAGE + TEXT ═══ */}
      <section className="py-0">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <Section animation="animate-slide-right" className="relative h-[50vh] md:h-[70vh] overflow-hidden img-zoom">
            <img src={CAT_FRAGRANCE} alt="Our Craft" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
          </Section>
          {/* Text */}
          <Section animation="animate-slide-left" className="flex items-center px-8 md:px-16 lg:px-24 py-16 md:py-0 bg-secondary/30">
            <div>
              <p className="text-[10px] tracking-luxury uppercase text-muted-foreground/40 font-sans mb-4">
                {isRTL ? "الحرفة" : "The Craft"}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl italic text-foreground mb-6 leading-tight">
                {isRTL ? "انتقاء لا يعرف المساومة" : "Uncompromising Curation"}
              </h2>
              <div className="w-10 h-px bg-foreground/10 mb-8" />
              <p className="text-[13px] font-sans text-muted-foreground/60 leading-[1.9] mb-6">
                {isRTL
                  ? "في 4You، لا نبيع منتجات فحسب — نقدم تجارب. كل عطر، كل مستحضر عناية، كل أداة تجميل تمر عبر عملية اختيار صارمة تضمن أن ما يصل إليك هو الأفضل فقط. نتعاون مع أرقى العلامات التجارية العالمية لنقدم لك مجموعة لا مثيل لها."
                  : "At 4You, we don't just sell products — we deliver experiences. Every fragrance, every skincare essential, every beauty tool passes through a rigorous selection process ensuring only the finest reaches you. We collaborate with the world's most prestigious brands to offer an unparalleled collection."
                }
              </p>
              <p className="text-[13px] font-sans text-muted-foreground/60 leading-[1.9]">
                {isRTL
                  ? "من التغليف الفاخر إلى التوصيل المتقن، كل خطوة مصممة لتعكس الاهتمام بالتفاصيل الذي يميّزنا."
                  : "From luxurious packaging to meticulous delivery, every step is designed to reflect the attention to detail that sets us apart."
                }
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ REVERSE SPLIT ═══ */}
      <section className="py-0">
        <div className="grid md:grid-cols-2">
          {/* Text */}
          <Section animation="animate-slide-right" className="flex items-center px-8 md:px-16 lg:px-24 py-16 md:py-0 bg-white order-2 md:order-1">
            <div>
              <p className="text-[10px] tracking-luxury uppercase text-muted-foreground/40 font-sans mb-4">
                {isRTL ? "التجربة" : "The Experience"}
              </p>
              <h2 className="font-heading text-3xl md:text-4xl italic text-foreground mb-6 leading-tight">
                {isRTL ? "فخامة في كل تفصيل" : "Luxury in Every Detail"}
              </h2>
              <div className="w-10 h-px bg-foreground/10 mb-8" />
              <p className="text-[13px] font-sans text-muted-foreground/60 leading-[1.9] mb-6">
                {isRTL
                  ? "نعيد تعريف تجربة التسوق الإلكتروني. من واجهة أنيقة تعكس ذوقك الرفيع، إلى خدمة عملاء استثنائية تتجاوز توقعاتك. كل لحظة معنا مصممة لتكون مميزة."
                  : "We are redefining the online shopping experience. From an elegant interface that reflects your refined taste, to exceptional customer service that exceeds your expectations. Every moment with us is designed to be extraordinary."
                }
              </p>
              <p className="text-[13px] font-sans text-muted-foreground/60 leading-[1.9]">
                {isRTL
                  ? "لأننا نؤمن بأن الفخامة ليست فقط في المنتج — بل في الرحلة بأكملها."
                  : "Because we believe luxury isn't just about the product — it's about the entire journey."
                }
              </p>
            </div>
          </Section>
          {/* Image */}
          <Section animation="animate-slide-left" className="relative h-[50vh] md:h-[70vh] overflow-hidden img-zoom order-1 md:order-2">
            <img src={CAT_BEAUTY} alt="The Experience" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
          </Section>
        </div>
      </section>

      {/* ═══ TIMELINE / JOURNEY ═══ */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="container">
          <Section className="text-center mb-20">
            <p className="text-[10px] tracking-luxury uppercase text-white/30 font-sans mb-4">
              {isRTL ? "رحلتنا" : "Our Journey"}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl italic text-white leading-tight">
              {isRTL ? "أربعة أركان تحكي قصتنا" : "Four Pillars of Our Story"}
            </h2>
            <div className="w-12 h-px bg-white/15 mx-auto mt-6" />
          </Section>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.06]">
            {timeline.map((item, i) => (
              <Section key={i} className="p-8 md:p-10 bg-black group hover:bg-white/[0.03] transition-colors duration-500">
                <div className="mb-6">
                  <span className="text-[10px] tracking-luxury uppercase text-white/20 font-sans">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-[11px] tracking-luxury uppercase text-white/30 font-sans mb-3">
                  {item.year}
                </p>
                <h3 className="font-heading text-xl md:text-2xl italic text-white mb-4 leading-tight">
                  {item.title}
                </h3>
                <div className="w-8 h-px bg-white/10 mb-5 group-hover:w-12 group-hover:bg-white/20 transition-all duration-500" />
                <p className="text-[12px] font-sans text-white/35 leading-[1.9]">
                  {item.desc}
                </p>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ VALUES ═══ */}
      <section className="py-24 md:py-32">
        <div className="container">
          <Section className="text-center mb-16">
            <p className="text-[10px] tracking-luxury uppercase text-muted-foreground/40 font-sans mb-4">
              {isRTL ? "قيمنا" : "Our Values"}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl italic text-foreground leading-tight">
              {isRTL ? "ما نؤمن به" : "What We Stand For"}
            </h2>
            <div className="w-10 h-px bg-foreground/10 mx-auto mt-6" />
          </Section>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <Section key={i} className="text-center group">
                  <div className="w-14 h-14 mx-auto mb-6 border border-foreground/[0.06] flex items-center justify-center group-hover:border-foreground/15 transition-colors duration-500">
                    <Icon size={18} strokeWidth={1} className="text-foreground/30 group-hover:text-foreground/60 transition-colors duration-500" />
                  </div>
                  <h3 className="font-heading text-lg italic text-foreground mb-3">{value.title}</h3>
                  <p className="text-[12px] font-sans text-muted-foreground/50 leading-[1.8] max-w-xs mx-auto">
                    {value.desc}
                  </p>
                </Section>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ NUMBERS ═══ */}
      <section className="py-20 md:py-24 bg-secondary/30">
        <div className="container">
          <Section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
              {[
                { num: 500, suffix: "+", label: isRTL ? "منتج فاخر" : "Luxury Products" },
                { num: 13, suffix: "+", label: isRTL ? "ماركة عالمية" : "Global Brands" },
                { num: 10, suffix: "K+", label: isRTL ? "عميل سعيد" : "Happy Clients" },
                { num: 100, suffix: "%", label: isRTL ? "منتجات أصلية" : "Authentic Products" },
              ].map((stat, i) => (
                <div key={i} className="py-4">
                  <p className="font-heading text-3xl md:text-4xl italic text-foreground mb-2">
                    <AnimatedCounter target={stat.num} suffix={stat.suffix} />
                  </p>
                  <p className="text-[10px] tracking-luxury uppercase text-muted-foreground/40 font-sans">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ FULL-WIDTH IMAGE QUOTE ═══ */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={CAT_EXCLUSIVE} alt="Vision" className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-black/65" />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <Section>
            <blockquote className="font-heading text-2xl md:text-4xl lg:text-5xl italic text-white leading-[1.3] max-w-3xl mx-auto">
              {isRTL
                ? "الأناقة هي الشكل الوحيد من الجمال الذي لا يتلاشى أبداً."
                : "Elegance is the only form of beauty that never fades."
              }
            </blockquote>
            <p className="text-[10px] tracking-luxury uppercase text-white/25 font-sans mt-6">
              — Audrey Hepburn
            </p>
          </Section>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-24 md:py-32">
        <div className="container">
          <Section className="text-center">
            <p className="text-[10px] tracking-luxury uppercase text-muted-foreground/40 font-sans mb-4">
              {isRTL ? "ابدأ رحلتك" : "Begin Your Journey"}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl italic text-foreground leading-tight mb-6">
              {isRTL ? "اكتشف مجموعتنا" : "Discover Our Collection"}
            </h2>
            <div className="w-10 h-px bg-foreground/10 mx-auto mb-8" />
            <p className="text-[13px] font-sans text-muted-foreground/50 max-w-lg mx-auto leading-relaxed mb-10">
              {isRTL
                ? "استكشف مجموعة منتقاة بعناية من أرقى منتجات الجمال والعناية. لأنك تستحق الأفضل."
                : "Explore a carefully curated collection of the finest beauty and care products. Because you deserve the best."
              }
            </p>
            <Link href="/products">
              <button className="group inline-flex items-center gap-3 px-10 py-4 bg-black text-white text-[11px] tracking-luxury uppercase font-sans hover:bg-foreground/85 transition-all duration-300">
                {isRTL ? "تسوق الآن" : "Shop Now"}
                <Arrow size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </Link>
          </Section>
        </div>
      </section>
    </div>
  );
}
