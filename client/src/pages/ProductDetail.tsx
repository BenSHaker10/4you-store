import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Minus, Plus, Truck, RotateCcw, Shield, Heart, ChevronLeft, ChevronRight, Star, Share2, ArrowLeft, ArrowRight } from "lucide-react";
import { useParams, Link } from "wouter";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useLanguage } from "@/contexts/LanguageContext";

function ProductRatingDisplay({ productId }: { productId: number }) {
  const { t } = useLanguage();
  const { data: stats } = trpc.reviews.stats.useQuery({ productId });
  const avg = stats?.averageRating ?? 0;
  const total = stats?.totalReviews ?? 0;
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-3 h-3 ${i <= Math.round(avg) ? "fill-black text-black" : "text-black/10"}`} />
        ))}
      </div>
      <span className="text-[11px] text-black/30 font-sans">
        {avg > 0 ? avg.toFixed(1) : "—"} ({total} {t.product.reviews})
      </span>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, isRTL } = useLanguage();
  const { data: product, isLoading, error } = trpc.products.bySlug.useQuery({ slug: slug || "" }, { enabled: !!slug });
  const { data: relatedData } = trpc.products.list.useQuery({ limit: 5 }, { enabled: !!product });
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);
  const { rate, enabled: yerEnabled } = useExchangeRate();

  useEffect(() => {
    setSelectedImage(0);
    setSelectedOption(null);
    setQuantity(1);
    setLiked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const handleImageMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            <div className="animate-pulse">
              <div className="aspect-[3/4] bg-[#f5f5f5]" />
              <div className="flex gap-3 mt-4">
                {[...Array(4)].map((_, i) => <div key={i} className="w-16 h-20 bg-[#f5f5f5]" />)}
              </div>
            </div>
            <div className="animate-pulse space-y-6 pt-4">
              <div className="h-3 bg-[#f5f5f5] w-1/4" />
              <div className="h-8 bg-[#f5f5f5] w-3/4" />
              <div className="h-4 bg-[#f5f5f5] w-1/3" />
              <div className="h-px bg-black/5 w-full my-8" />
              <div className="h-28 bg-[#f5f5f5]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h2 className="font-heading text-2xl italic mb-4">{isRTL ? "المنتج غير موجود" : "Product Not Found"}</h2>
          <p className="text-[13px] font-sans text-black/40 mb-8">{isRTL ? "قد يكون المنتج غير متوفر أو تم حذفه" : "This product may be unavailable or removed"}</p>
          <Link href="/products">
            <Button variant="outline" className="text-[11px] font-sans tracking-luxury uppercase border-black/15 hover:bg-black hover:text-white gap-2 px-8 py-3 rounded-none transition-all duration-300">
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              {t.productDetail.backToProducts}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: "https://placehold.co/600x800/f5f5f5/999?text=No+Image", alt: "No image" }];
  const hasDiscount = product.compareAtPrice && parseFloat(product.compareAtPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice!)) * 100)
    : 0;

  const selectedOptionData = product.options?.find(o => o.id === selectedOption);
  const finalPrice = parseFloat(product.price) + (selectedOptionData ? parseFloat(selectedOptionData.priceModifier ?? "0") : 0);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity, selectedOption ?? undefined);
      toast.success(t.product.addedToCart, { description: `${product.name} x${quantity}`, duration: 2500 });
    } catch {
      toast.error(isRTL ? "فشل في الإضافة للسلة" : "Failed to add to bag");
    } finally {
      setAdding(false);
    }
  };

  const optionGroups: Record<string, typeof product.options> = {};
  product.options?.forEach(opt => {
    if (!optionGroups[opt.name]) optionGroups[opt.name] = [];
    optionGroups[opt.name].push(opt);
  });

  const nextImage = () => setSelectedImage(i => (i + 1) % images.length);
  const prevImage = () => setSelectedImage(i => (i - 1 + images.length) % images.length);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(isRTL ? "تم نسخ الرابط" : "Link copied");
    } catch {
      toast.error(isRTL ? "فشل في النسخ" : "Failed to copy");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-black/[0.04]">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-[10px] font-sans tracking-wide text-black/30">
            <Link href="/" className="hover:text-black transition-colors">{t.footer.home}</Link>
            <span className="text-black/10">/</span>
            <Link href="/products" className="hover:text-black transition-colors">{t.footer.products}</Link>
            <span className="text-black/10">/</span>
            <span className="text-black/60 truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20">
          {/* Image Gallery */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-3 w-16 shrink-0">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-20 overflow-hidden border transition-all duration-300 ${
                      selectedImage === i
                        ? "border-black opacity-100"
                        : "border-transparent opacity-30 hover:opacity-60"
                    }`}
                  >
                    <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative group">
              <div
                ref={imageRef}
                className="aspect-[3/4] overflow-hidden bg-[#f5f5f5] cursor-crosshair"
                onMouseEnter={() => setImageZoom(true)}
                onMouseLeave={() => setImageZoom(false)}
                onMouseMove={handleImageMouseMove}
              >
                <img
                  src={images[selectedImage]?.url}
                  alt={images[selectedImage]?.alt || product.name}
                  className="w-full h-full object-cover transition-transform duration-700"
                  style={imageZoom ? { transform: `scale(2)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
                />
              </div>

              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
                    <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white">
                    <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </>
              )}

              {hasDiscount && (
                <span className={`absolute top-4 ${isRTL ? "right-4" : "left-4"} bg-black text-white text-[9px] font-sans tracking-wider px-3 py-1.5 uppercase`}>
                  -{discountPercent}%
                </span>
              )}

              {images.length > 1 && (
                <div className={`md:hidden absolute bottom-4 ${isRTL ? "left-4" : "right-4"} bg-black/60 text-white text-[10px] font-sans px-3 py-1.5`}>
                  {selectedImage + 1}/{images.length}
                </div>
              )}

              {/* Mobile thumbnails */}
              {images.length > 1 && (
                <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-14 h-18 shrink-0 overflow-hidden border transition-all duration-300 ${
                        selectedImage === i ? "border-black" : "border-transparent opacity-40"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="pt-0 md:pt-2">
            {/* Brand & Share */}
            <div className="flex items-center justify-between mb-4">
              {product.brand && (
                <p className="text-[9px] font-sans tracking-luxury uppercase text-black/30">
                  {product.brand}
                </p>
              )}
              <button onClick={handleShare} className="p-2 text-black/20 hover:text-black transition-colors duration-300">
                <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Name */}
            <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <ProductRatingDisplay productId={product.id} />

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-black/[0.06]">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-sans font-light tabular-nums text-black">
                  {finalPrice.toFixed(2)} <span className="text-sm text-black/30">{t.product.sar}</span>
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-sm text-black/25 line-through font-sans tabular-nums">
                      {parseFloat(product.compareAtPrice!).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-sans tracking-wider uppercase text-black/50 border border-black/10 px-2 py-0.5">
                      {isRTL ? `وفر ${discountPercent}%` : `Save ${discountPercent}%`}
                    </span>
                  </>
                )}
              </div>
              {yerEnabled && (
                <div className="mt-2">
                  <span className="text-[11px] font-sans text-black/25 tabular-nums">
                    {(finalPrice * rate).toLocaleString("en", { maximumFractionDigits: 0 })} <span className="text-[9px]">{t.product.yer}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2 text-[11px] font-sans">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  <span className="text-black/60">{t.productDetail.inStock}</span>
                  <span className="text-black/25">({product.stock} {isRTL ? "متوفر" : "available"})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] font-sans">
                  <span className="w-1.5 h-1.5 bg-black/30 rounded-full" />
                  <span className="text-black/40">{t.productDetail.outOfStock}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <p className="text-[13px] font-sans text-black/40 leading-relaxed italic">
                  "{product.description}"
                </p>
              </div>
            )}

            {/* Options */}
            {Object.entries(optionGroups).map(([name, opts]) => (
              <div key={name} className="mb-6">
                <h3 className="text-[10px] font-sans tracking-luxury uppercase mb-3 text-black/40">
                  {name}: <span className="text-black/70">{selectedOption ? opts.find(o => o.id === selectedOption)?.value || (isRTL ? "اختر" : "Select") : (isRTL ? "اختر" : "Select")}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {opts.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id === selectedOption ? null : opt.id)}
                      className={`px-5 py-2.5 border text-[11px] font-sans transition-all duration-300 ${
                        selectedOption === opt.id
                          ? "border-black bg-black text-white"
                          : "border-black/10 hover:border-black/30 text-black/50 hover:text-black"
                      }`}
                    >
                      {opt.value}
                      {opt.priceModifier && parseFloat(opt.priceModifier) > 0 && (
                        <span className="opacity-50 mx-1">(+{parseFloat(opt.priceModifier).toFixed(2)})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity & Actions */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center border border-black/10">
                <button className="w-11 h-11 flex items-center justify-center hover:bg-black/[0.03] transition-colors" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  <Minus className="w-3 h-3" strokeWidth={1.5} />
                </button>
                <span className="w-10 text-center text-[13px] font-sans tabular-nums">{quantity}</span>
                <button className="w-11 h-11 flex items-center justify-center hover:bg-black/[0.03] transition-colors" onClick={() => setQuantity(q => q + 1)}>
                  <Plus className="w-3 h-3" strokeWidth={1.5} />
                </button>
              </div>
              <Button
                className="flex-1 h-12 rounded-none font-sans text-[11px] tracking-luxury uppercase gap-2.5 bg-black hover:bg-black/90 text-white transition-all duration-300"
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
              >
                <ShoppingBag className={`w-3.5 h-3.5 ${adding ? "animate-pulse" : ""}`} strokeWidth={1.5} />
                {adding ? t.common.loading : t.productDetail.addToCart}
              </Button>
              <button
                onClick={() => { setLiked(!liked); toast.success(liked ? (isRTL ? "تمت الإزالة من المفضلة" : "Removed from wishlist") : (isRTL ? "تمت الإضافة للمفضلة" : "Saved to wishlist")); }}
                className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 ${
                  liked ? "border-black bg-black text-white" : "border-black/10 hover:border-black/30 text-black/30"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} strokeWidth={1.5} />
              </button>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-black/[0.06] pt-6 space-y-4">
              {[
                { icon: Truck, title: t.productDetail.freeShipping, desc: t.productDetail.freeShippingDesc },
                { icon: RotateCcw, title: t.productDetail.easyReturns, desc: t.productDetail.easyReturnsDesc },
                { icon: Shield, title: t.productDetail.authentic, desc: t.productDetail.authenticDesc },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <item.icon className="w-4 h-4 text-black/20 shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[11px] font-sans text-black/60">{item.title}</p>
                    <p className="text-[10px] font-sans text-black/25 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {product.tags && (
              <div className="mt-8 pt-6 border-t border-black/[0.06]">
                <p className="text-[9px] font-sans tracking-luxury uppercase text-black/25 mb-3">{isRTL ? "الوسوم" : "Tags"}</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.split(",").map(tag => (
                    <span key={tag.trim()} className="text-[10px] font-sans border border-black/[0.06] px-3 py-1.5 text-black/30 hover:text-black hover:border-black/20 transition-all duration-300 cursor-pointer">{tag.trim()}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        {product && <ReviewSection productId={product.id} />}

        {/* Related Products */}
        {relatedData && relatedData.items.length > 0 && (
          <div className="mt-24 pt-16 border-t border-black/[0.06]">
            <div className="text-center mb-12">
              <p className="text-[9px] font-sans tracking-luxury uppercase text-black/25 mb-3">
                {isRTL ? "قد يعجبك أيضاً" : "You May Also Like"}
              </p>
              <h2 className="font-heading text-2xl md:text-3xl italic">
                {t.productDetail.relatedProducts}
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {relatedData.items.filter(p => p.id !== product.id).slice(0, 5).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
