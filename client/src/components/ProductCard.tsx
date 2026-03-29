import { Link } from "wouter";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { useState } from "react";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    compareAtPrice?: string | null;
    brand?: string | null;
    images?: { url: string; alt?: string | null }[];
  };
  compact?: boolean;
};

function ProductCardRating({ productId }: { productId: number }) {
  const { data: stats } = trpc.reviews.stats.useQuery({ productId });
  const avg = stats?.averageRating ?? 0;
  const total = stats?.totalReviews ?? 0;
  if (total === 0) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="flex items-center gap-px">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-2 h-2 ${i <= Math.round(avg) ? "fill-black text-black" : "text-black/15"}`} />
        ))}
      </div>
      <span className="text-[9px] text-black/30 font-sans tabular-nums">({total})</span>
    </div>
  );
}

export default function ProductCard({ product, compact }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { rate, enabled } = useExchangeRate();
  const { t, isRTL } = useLanguage();

  const mainImage = product.images?.[0]?.url || "https://placehold.co/400x500/f5f5f5/999?text=No+Image";
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)
    : 0;

  const priceSAR = parseFloat(product.price);
  const priceYER = priceSAR * rate;
  const compareAtPriceSAR = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(product.id);
      toast.success(t.product.addedToCart, { description: product.name, duration: 2000 });
    } catch {
      toast.error(isRTL ? "فشل في الإضافة" : "Failed to add");
    } finally {
      setIsAdding(false);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    toast.success(
      liked
        ? (isRTL ? "تمت الإزالة من المفضلة" : "Removed from wishlist")
        : (isRTL ? "تمت الإضافة للمفضلة" : "Saved to wishlist"),
      { duration: 1500 }
    );
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="overflow-hidden bg-white">
        {/* Image */}
        <div className="relative overflow-hidden bg-[#f5f5f5] aspect-[3/4]">
          {!imageLoaded && <div className="absolute inset-0 bg-black/[0.03] animate-pulse" />}
          <img
            src={mainImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"} group-hover:scale-105`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3">
              <span className="bg-black text-white text-[9px] font-sans tracking-wider px-2.5 py-1 uppercase">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Wishlist */}
          <button
            onClick={handleLike}
            className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center transition-all duration-300 ${
              liked
                ? "text-black opacity-100"
                : "text-black/30 opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} strokeWidth={1.5} />
          </button>

          {/* Add to cart overlay */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full py-3 bg-black text-white text-[10px] font-sans tracking-luxury uppercase hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className={`w-3 h-3 ${isAdding ? "animate-pulse" : ""}`} strokeWidth={1.5} />
              {isAdding ? (isRTL ? "جاري الإضافة..." : "Adding...") : t.product.addToCart}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="py-3 px-1 space-y-1">
          {product.brand && (
            <p className="text-[9px] font-sans tracking-luxury uppercase text-black/30">{product.brand}</p>
          )}
          <h3 className="text-[12px] font-sans leading-snug line-clamp-2 text-black/80 group-hover:text-black transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className={`text-[13px] font-sans font-medium tabular-nums ${hasDiscount ? "text-black" : "text-black"}`}>
              {priceSAR.toFixed(2)} <span className="text-[9px] text-black/40">{t.product.sar}</span>
            </span>
            {hasDiscount && compareAtPriceSAR && (
              <span className="text-[10px] text-black/25 line-through font-sans tabular-nums">
                {compareAtPriceSAR.toFixed(2)}
              </span>
            )}
          </div>
          <ProductCardRating productId={product.id} />
          {enabled && (
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[9px] font-sans text-black/30 tabular-nums">
                {priceYER.toLocaleString("en", { maximumFractionDigits: 0 })} <span className="text-[8px]">{t.product.yer}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
