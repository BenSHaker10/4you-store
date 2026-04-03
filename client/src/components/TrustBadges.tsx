import { Truck, Shield, RotateCcw, Award, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrustBadgesProps {
  variant?: "horizontal" | "vertical" | "compact";
  className?: string;
}

export default function TrustBadges({ variant = "horizontal", className = "" }: TrustBadgesProps) {
  const { isRTL } = useLanguage();

  const badges = [
    {
      icon: Truck,
      title: t.trust.freeShipping,
      desc: t.trust.freeShippingDesc,
    },
    {
      icon: Shield,
      title: t.trust.authentic,
      desc: t.trust.authenticDesc,
    },
    {
      icon: RotateCcw,
      title: t.trust.freeReturn,
      desc: t.trust.freeReturnDesc,
    },
    {
      icon: CreditCard,
      title: t.home.securePayment,
      desc: t.trust.securePaymentDesc,
    },
    {
      icon: Award,
      title: t.trust.authentic,
      desc: t.trust.authenticDesc,
    },
  ];

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-4 py-4 ${className}`}>
        {badges.slice(0, 4).map((badge, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <badge.icon className="w-3 h-3 text-black/25" strokeWidth={1.5} />
            <span className="text-[9px] font-sans text-black/30 tracking-wide uppercase">{badge.title}</span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className={`space-y-3 ${className}`}>
        {badges.slice(0, 4).map((badge, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-black/[0.04] bg-black/[0.01]">
            <badge.icon className="w-4 h-4 text-black/25 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-[11px] font-sans font-medium text-black/60">{badge.title}</p>
              <p className="text-[9px] font-sans text-black/25 mt-0.5">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // horizontal (default)
  return (
    <div className={`border-y border-black/[0.04] py-6 ${className}`}>
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="flex items-center gap-2.5 group">
              <badge.icon className="w-4 h-4 text-black/30 group-hover:text-black transition-colors shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-sans font-medium text-black/60">{badge.title}</p>
                <p className="text-[9px] font-sans text-black/25 mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
