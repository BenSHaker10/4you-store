import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, Truck, Shield, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import ProductCard from "@/components/ProductCard";
import SEOHead from "@/components/SEOHead";

export default function Cart() {
  const { items, isLoading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { t, isRTL } = useLanguage();
  const { data: suggestedData } = trpc.products.list.useQuery({ featured: true, limit: 4 });

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="text-center px-4 max-w-md">
          <ShoppingBag className="w-10 h-10 text-black/10 mx-auto mb-6" strokeWidth={1} />
          <h2 className="font-heading text-2xl md:text-3xl italic mb-4">{t.cart.title}</h2>
          <p className="text-[13px] font-sans text-black/30 mb-8">
            {isRTL ? "سجل دخولك لعرض سلتك وبدء التسوق" : "Sign in to view your bag and start shopping"}
          </p>
          <Button onClick={() => { window.location.href = getLoginUrl(); }} className="rounded-none font-sans text-[10px] tracking-luxury uppercase px-10 h-12 bg-black hover:bg-black/90 text-white">
            {t.auth.signIn}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container py-8">
          <div className="h-6 bg-[#f5f5f5] w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex gap-5 p-5 border border-black/[0.04]">
                  <div className="w-24 h-32 bg-[#f5f5f5]" />
                  <div className="flex-1 space-y-3">
                    <div className="h-2 bg-[#f5f5f5] w-1/3" />
                    <div className="h-3 bg-[#f5f5f5] w-1/2" />
                    <div className="h-2 bg-[#f5f5f5] w-1/4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="animate-pulse"><div className="h-72 bg-[#f5f5f5]" /></div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const price = item.product ? parseFloat(item.product.price) + (item.option ? parseFloat(item.option.priceModifier ?? "0") : 0) : 0;
    return sum + price * item.quantity;
  }, 0);

  const shipping = subtotal >= 250 ? 0 : 15;
  const total = subtotal + shipping;
  const freeShippingProgress = Math.min((subtotal / 250) * 100, 100);
  const formatPrice = (amount: number) => `${amount.toFixed(2)} ${isRTL ? "ريال" : "SAR"}`;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <ShoppingBag className="w-10 h-10 text-black/10 mx-auto mb-6" strokeWidth={1} />
            <h2 className="font-heading text-2xl md:text-3xl italic mb-4">{t.cart.empty}</h2>
            <p className="text-[13px] font-sans text-black/30 mb-8">{t.cart.emptyDesc}</p>
            <Link href="/products">
              <Button className="rounded-none gap-2.5 font-sans text-[10px] tracking-luxury uppercase px-10 h-12 bg-black hover:bg-black/90 text-white">
                {t.cart.continueShopping} <ArrowIcon className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {suggestedData && suggestedData.items.length > 0 && (
          <div className="container pb-16">
            <div className="pt-12 border-t border-black/[0.04]">
              <div className="text-center mb-10">
                <p className="text-[9px] font-sans tracking-luxury uppercase text-black/25 mb-2">{isRTL ? "اقتراحات لك" : "Curated For You"}</p>
                <h3 className="font-heading text-xl italic">{isRTL ? "قد يعجبك" : "You Might Like"}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {suggestedData.items.slice(0, 4).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead title={isRTL ? "سلة التسوق" : "Shopping Cart"} url="/cart" noindex />
      {/* Breadcrumb */}
      <div className="border-b border-black/[0.04]">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-[10px] font-sans tracking-wide text-black/25">
            <Link href="/" className="hover:text-black transition-colors">{t.footer.home}</Link>
            <span className="text-black/10">/</span>
            <span className="text-black/50">{t.cart.title}</span>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-heading text-2xl md:text-3xl italic">
            {t.cart.title}
            <span className="font-sans text-sm text-black/20 not-italic mx-2">({items.length})</span>
          </h1>
          <button
            className="text-[10px] font-sans tracking-luxury uppercase text-black/30 hover:text-black transition-colors"
            onClick={() => { clearCart(); toast.success(isRTL ? "تم مسح السلة" : "Bag cleared"); }}
          >
            {isRTL ? "مسح الكل" : "Clear All"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-0">
            {items.map((item, index) => {
              const price = item.product ? parseFloat(item.product.price) + (item.option ? parseFloat(item.option.priceModifier ?? "0") : 0) : 0;
              const image = item.images?.[0]?.url || "https://placehold.co/200x250/f5f5f5/999?text=No+Image";
              return (
                <div key={item.id} className={`group flex gap-5 md:gap-6 py-6 ${index > 0 ? "border-t border-black/[0.04]" : ""}`}>
                  <Link href={`/product/${item.product?.slug}`} className="shrink-0">
                    <div className="w-24 h-32 md:w-28 md:h-36 overflow-hidden bg-[#f5f5f5]">
                      <img src={image} alt={item.product?.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          {item.product?.brand && (
                            <p className="text-[8px] font-sans tracking-luxury uppercase text-black/25 mb-1">{item.product.brand}</p>
                          )}
                          <Link href={`/product/${item.product?.slug}`}>
                            <h3 className="text-[13px] font-sans font-medium hover:text-black/60 transition-colors line-clamp-2">
                              {item.product?.name}
                            </h3>
                          </Link>
                          {item.option && (
                            <p className="text-[10px] font-sans text-black/30 mt-1.5">
                              {item.option.name}: <span className="text-black/50">{item.option.value}</span>
                            </p>
                          )}
                        </div>
                        <button
                          className="p-2 text-black/15 hover:text-black transition-colors shrink-0"
                          onClick={() => { removeItem(item.id); toast.success(isRTL ? "تمت الإزالة" : "Removed"); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-black/[0.08]">
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-black/[0.03] transition-colors" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <Minus className="w-2.5 h-2.5" strokeWidth={1.5} />
                        </button>
                        <span className="w-8 text-center text-[11px] font-sans tabular-nums">{item.quantity}</span>
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-black/[0.03] transition-colors" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <Plus className="w-2.5 h-2.5" strokeWidth={1.5} />
                        </button>
                      </div>
                      <span className="text-[14px] font-sans tabular-nums">{formatPrice(price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link href="/products" className="flex items-center gap-2 text-[10px] font-sans tracking-luxury uppercase text-black/25 hover:text-black transition-colors mt-6 pt-6 border-t border-black/[0.04]">
              {isRTL ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
              {t.cart.continueShopping}
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-black/[0.06] sticky top-32">
              <div className="p-6">
                <h2 className="text-[10px] font-sans tracking-luxury uppercase text-black/40 mb-6">{t.cart.orderSummary}</h2>

                {/* Free shipping progress */}
                <div className="mb-6 pb-6 border-b border-black/[0.04]">
                  {shipping > 0 ? (
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-sans text-black/40 mb-2">
                        <Truck className="w-3 h-3" strokeWidth={1.5} />
                        {isRTL ? `أضف ${(250 - subtotal).toFixed(0)} ريال للشحن المجاني` : `Add ${(250 - subtotal).toFixed(0)} SAR for free shipping`}
                      </div>
                      <div className="h-px bg-[#f0f0f0] overflow-hidden">
                        <div className="h-full bg-black transition-all duration-500" style={{ width: `${freeShippingProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] font-sans text-black/50">
                      <Truck className="w-3 h-3" strokeWidth={1.5} />
                      {isRTL ? "شحن مجاني" : "Complimentary shipping"}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-black/[0.04]">
                  <div className="flex justify-between text-[12px] font-sans">
                    <span className="text-black/40">{t.cart.subtotal}</span>
                    <span className="tabular-nums">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[12px] font-sans">
                    <span className="text-black/40">{t.cart.shipping}</span>
                    <span className="tabular-nums">{shipping === 0 ? (isRTL ? "مجاني" : "Complimentary") : formatPrice(shipping)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-[10px] font-sans tracking-luxury uppercase text-black/40">{t.cart.total}</span>
                  <span className="text-xl font-sans tabular-nums">{formatPrice(total)}</span>
                </div>

                <Button
                  className="w-full h-12 rounded-none font-sans text-[10px] tracking-luxury uppercase bg-black hover:bg-black/90 text-white transition-all duration-300"
                  onClick={() => navigate("/checkout")}
                >
                  {t.cart.checkout}
                </Button>

                <div className="mt-6 space-y-3">
                  {[
                    { icon: Truck, text: isRTL ? "شحن مجاني فوق 250 ريال" : "Free shipping over 250 SAR" },
                    { icon: RotateCcw, text: isRTL ? "إرجاع مجاني خلال 14 يوم" : "14-day free returns" },
                    { icon: Shield, text: isRTL ? "دفع آمن ومشفر" : "Secure encrypted payment" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-[10px] font-sans text-black/25">
                      <item.icon className="w-3 h-3 shrink-0" strokeWidth={1.5} />
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        {suggestedData && suggestedData.items.length > 0 && (
          <div className="mt-20 pt-12 border-t border-black/[0.04]">
            <div className="text-center mb-10">
              <p className="text-[9px] font-sans tracking-luxury uppercase text-black/25 mb-2">{isRTL ? "اقتراحات لك" : "Curated For You"}</p>
              <h3 className="font-heading text-xl italic">{isRTL ? "قد يعجبك أيضاً" : "You May Also Like"}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {suggestedData.items.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
