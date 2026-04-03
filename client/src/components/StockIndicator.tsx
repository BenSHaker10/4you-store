import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, Check, X as XIcon } from "lucide-react";

interface StockIndicatorProps {
  stock: number;
  className?: string;
}

export default function StockIndicator({ stock, className = "" }: StockIndicatorProps) {
  const { t, isRTL } = useLanguage();

  if (stock <= 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5">
          <XIcon className="w-3 h-3 text-red-400" strokeWidth={2} />
          <span className="text-[11px] font-sans text-red-500 font-medium">
            {t.stock.outOfStock}
          </span>
        </div>
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-500" strokeWidth={2} />
          <span className="text-[11px] font-sans text-amber-600 font-medium">
            {`${t.stock.onlyLeft} ${stock} ${t.stock.left}`}
          </span>
        </div>
        {/* Urgency bar */}
        <div className="flex-1 max-w-[100px] h-1.5 bg-black/[0.04] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-red-400 rounded-full transition-all duration-500"
            style={{ width: `${(stock / 10) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  if (stock <= 15) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <span className="text-[11px] font-sans text-black/50">
            {`${stock} ${t.stock.inStock} - ${t.stock.lowStock}`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5">
        <Check className="w-3 h-3 text-green-500" strokeWidth={2} />
        <span className="text-[11px] font-sans text-black/50">
          {t.stock.inStock}
        </span>
      </div>
    </div>
  );
}
