import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Shield, MapPin, Check, Package, Truck, RotateCcw, Tag, X, Loader2, Banknote, CreditCard, Building2, Copy } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOHead from "@/components/SEOHead";
import TrustBadges from "@/components/TrustBadges";

export default function Checkout() {
  const { items, refetch } = useCart();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const { t, isRTL } = useLanguage();

  // Kuraimi settings
  const { data: kuraimiSettings } = trpc.settings.getKuraimiSettings.useQuery();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; type: string; value: string; discount: string; description?: string | null; descriptionAr?: string | null;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "kuraimi">("cod");
  const [transferReference, setTransferReference] = useState("");

  const [form, setForm] = useState({
    shippingName: user?.name || "",
    shippingEmail: user?.email || "",
    shippingPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingCountry: "",
    shippingZipCode: "",
    notes: "",
  });

  const validateCoupon = trpc.coupons.validate.useMutation({
    onSuccess: (data) => {
      setAppliedCoupon(data);
      setCouponCode("");
      toast.success(isRTL ? `تم تطبيق الكوبون! خصم ${data.discount} ر.س` : `Coupon applied! ${data.discount} SAR discount`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      refetch();
      toast.success(t.checkout.orderSuccess);
      navigate(`/orders/${data.orderId}`);
    },
    onError: (err) => {
      toast.error(err.message || (isRTL ? "فشل في تقديم الطلب" : "Failed to place order"));
    },
  });

  const subtotal = items.reduce((sum, item) => {
    const price = item.product ? parseFloat(item.product.price) + (item.option ? parseFloat(item.option.priceModifier ?? "0") : 0) : 0;
    return sum + price * item.quantity;
  }, 0);
  const shipping = subtotal >= 250 ? 0 : 15;
  const discount = appliedCoupon ? parseFloat(appliedCoupon.discount) : 0;
  const total = Math.max(subtotal + shipping - discount, 0);

  const formatPrice = (amount: number) => `${amount.toFixed(2)} ${t.product.sar}`;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      await validateCoupon.mutateAsync({ code: couponCode.trim(), orderTotal: subtotal });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isRTL ? "تم النسخ!" : "Copied!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shippingName || !form.shippingEmail || !form.shippingPhone || !form.shippingAddress || !form.shippingCity || !form.shippingCountry) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }
    if (paymentMethod === "kuraimi" && !transferReference.trim()) {
      toast.error(isRTL ? "يرجى إدخال رقم الحوالة" : "Please enter the transfer reference number");
      return;
    }
    setSubmitting(true);
    try {
      await createOrder.mutateAsync({
        ...form,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        transferReference: paymentMethod === "kuraimi" ? transferReference.trim() : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="text-center px-4 max-w-md">
          <Package className="w-10 h-10 text-black/10 mx-auto mb-6" strokeWidth={1} />
          <h2 className="font-heading text-2xl italic mb-4">{t.cart.empty}</h2>
          <p className="text-[13px] font-sans text-black/30 mb-8">{isRTL ? "أضف منتجات للسلة أولاً" : "Add products to your bag first"}</p>
          <Link href="/products">
            <Button className="rounded-none font-sans text-[10px] tracking-luxury uppercase px-10 h-12 bg-black hover:bg-black/90 text-white">
              {t.cart.continueShopping}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: t.cart.title, done: true },
    { num: 2, label: t.checkout.shippingInfo, active: true },
    { num: 3, label: isRTL ? "الدفع" : "Payment", done: false },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead title={isRTL ? "إتمام الطلب" : "Checkout"} url="/checkout" noindex />
      {/* Breadcrumb */}
      <div className="border-b border-black/[0.04]">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-[10px] font-sans tracking-wide text-black/25">
            <Link href="/" className="hover:text-black transition-colors">{t.footer.home}</Link>
            <span className="text-black/10">/</span>
            <Link href="/cart" className="hover:text-black transition-colors">{t.cart.title}</Link>
            <span className="text-black/10">/</span>
            <span className="text-black/50">{t.checkout.title}</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-black/[0.04]">
        <div className="container py-6">
          <div className="flex items-center justify-center gap-0">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <span className={`w-7 h-7 flex items-center justify-center text-[10px] font-sans transition-all duration-300 ${
                    step.done ? "bg-black text-white" : step.active ? "bg-black text-white" : "border border-black/10 text-black/20"
                  }`}>
                    {step.done && !step.active ? <Check className="w-3 h-3" /> : step.num}
                  </span>
                  <span className={`text-[10px] font-sans tracking-luxury uppercase hidden sm:inline transition-colors ${
                    step.done || step.active ? "text-black" : "text-black/20"
                  }`}>{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-12 md:w-20 h-[1px] mx-3 md:mx-5 ${step.done ? "bg-black" : "bg-black/[0.06]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="border border-black/[0.06] p-6 md:p-8">
                <h2 className="text-[10px] font-sans tracking-luxury uppercase text-black/40 mb-8 flex items-center gap-3">
                  <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {t.checkout.shippingInfo}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="name" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.fullName} *</Label>
                    <Input id="name" value={form.shippingName} onChange={e => updateField("shippingName", e.target.value)} placeholder={isRTL ? "محمد أحمد" : "John Doe"} required className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.email} *</Label>
                    <Input id="email" type="email" value={form.shippingEmail} onChange={e => updateField("shippingEmail", e.target.value)} placeholder="email@example.com" required className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.phone} *</Label>
                    <Input id="phone" value={form.shippingPhone} onChange={e => updateField("shippingPhone", e.target.value)} placeholder="+966 50 000 0000" required className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15" />
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.country} *</Label>
                    <Input id="country" value={form.shippingCountry} onChange={e => updateField("shippingCountry", e.target.value)} placeholder={isRTL ? "اليمن" : "Yemen"} required className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.address} *</Label>
                    <Input id="address" value={form.shippingAddress} onChange={e => updateField("shippingAddress", e.target.value)} placeholder={isRTL ? "شارع الملك فهد، حي العليا" : "King Fahd Road, Al Olaya"} required className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15" />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.city} *</Label>
                    <Input id="city" value={form.shippingCity} onChange={e => updateField("shippingCity", e.target.value)} placeholder={isRTL ? "صنعاء" : "Sana'a"} required className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15" />
                  </div>
                  <div>
                    <Label htmlFor="zip" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{isRTL ? "الرمز البريدي" : "ZIP Code"}</Label>
                    <Input id="zip" value={form.shippingZipCode} onChange={e => updateField("shippingZipCode", e.target.value)} placeholder="12345" className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15" />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">
                      {isRTL ? "ملاحظات الطلب" : "Order Notes"} <span className="text-black/15 normal-case">({isRTL ? "اختياري" : "optional"})</span>
                    </Label>
                    <Input id="notes" value={form.notes} onChange={e => updateField("notes", e.target.value)} placeholder={isRTL ? "تعليمات توصيل خاصة..." : "Special delivery instructions..."} className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15" />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="border border-black/[0.06] p-6 md:p-8">
                <h2 className="text-[10px] font-sans tracking-luxury uppercase text-black/40 mb-6 flex items-center gap-3">
                  <CreditCard className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {t.checkout.paymentMethod}
                </h2>

                <div className="space-y-3">
                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-black bg-black/[0.02]"
                        : "border-black/[0.08] hover:border-black/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === "cod" ? "border-black" : "border-black/20"
                    }`}>
                      {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                    <Banknote className="w-5 h-5 text-black/40" strokeWidth={1.5} />
                    <div>
                      <p className="text-[12px] font-sans font-medium">{t.checkout.cod}</p>
                      <p className="text-[10px] font-sans text-black/30 mt-0.5">
                        {isRTL ? "ادفع نقداً عند استلام طلبك" : "Pay cash when you receive your order"}
                      </p>
                    </div>
                  </label>

                  {/* Kuraimi Bank Transfer */}
                  {kuraimiSettings?.enabled && (
                    <div>
                      <label
                        className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                          paymentMethod === "kuraimi"
                            ? "border-black bg-black/[0.02]"
                            : "border-black/[0.08] hover:border-black/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="kuraimi"
                          checked={paymentMethod === "kuraimi"}
                          onChange={() => setPaymentMethod("kuraimi")}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          paymentMethod === "kuraimi" ? "border-black" : "border-black/20"
                        }`}>
                          {paymentMethod === "kuraimi" && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                        <Building2 className="w-5 h-5 text-black/40" strokeWidth={1.5} />
                        <div>
                          <p className="text-[12px] font-sans font-medium">{t.checkout.kuraimi}</p>
                          <p className="text-[10px] font-sans text-black/30 mt-0.5">
                            {isRTL ? kuraimiSettings.instructionsAr || "حوّل المبلغ إلى أحد الحسابات أدناه" : kuraimiSettings.instructions || "Transfer the amount to one of the accounts below"}
                          </p>
                        </div>
                      </label>

                      {/* Kuraimi Account Details (shown when selected) */}
                      {paymentMethod === "kuraimi" && (
                        <div className="mt-3 border border-black/[0.06] p-5 space-y-4 bg-black/[0.01]">
                          {/* Beneficiary Name */}
                          <div className="flex items-center justify-between p-3 bg-white border border-black/[0.06]">
                            <div>
                              <p className="text-[9px] font-sans tracking-luxury uppercase text-black/30">{t.checkout.beneficiary}</p>
                              <p className="text-[13px] font-sans font-medium mt-1">{kuraimiSettings.beneficiaryName}</p>
                            </div>
                            <button type="button" onClick={() => copyToClipboard(kuraimiSettings.beneficiaryName)} className="p-2 hover:bg-black/[0.04] transition-colors">
                              <Copy className="w-3.5 h-3.5 text-black/30" strokeWidth={1.5} />
                            </button>
                          </div>

                          {/* Accounts Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* USD Account */}
                            <div className="p-3 bg-white border border-black/[0.06]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-sans tracking-luxury uppercase text-black/30">{t.checkout.accountUSD}</span>
                                <span className="text-[9px] font-sans font-bold text-green-700 bg-green-50 px-1.5 py-0.5">USD $</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-[13px] font-sans font-medium tabular-nums">{kuraimiSettings.accountUSD}</p>
                                <button type="button" onClick={() => copyToClipboard(kuraimiSettings.accountUSD)} className="p-1 hover:bg-black/[0.04] transition-colors">
                                  <Copy className="w-3 h-3 text-black/30" strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>

                            {/* YER Account */}
                            <div className="p-3 bg-white border border-black/[0.06]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-sans tracking-luxury uppercase text-black/30">{t.checkout.accountYER}</span>
                                <span className="text-[9px] font-sans font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5">YER</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-[13px] font-sans font-medium tabular-nums">{kuraimiSettings.accountYER}</p>
                                <button type="button" onClick={() => copyToClipboard(kuraimiSettings.accountYER)} className="p-1 hover:bg-black/[0.04] transition-colors">
                                  <Copy className="w-3 h-3 text-black/30" strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>

                            {/* SAR Account */}
                            <div className="p-3 bg-white border border-black/[0.06]">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[9px] font-sans tracking-luxury uppercase text-black/30">{t.checkout.accountSAR}</span>
                                <span className="text-[9px] font-sans font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5">SAR</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-[13px] font-sans font-medium tabular-nums">{kuraimiSettings.accountSAR}</p>
                                <button type="button" onClick={() => copyToClipboard(kuraimiSettings.accountSAR)} className="p-1 hover:bg-black/[0.04] transition-colors">
                                  <Copy className="w-3 h-3 text-black/30" strokeWidth={1.5} />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Transfer Reference Input */}
                          <div>
                            <Label className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.transferReference} *</Label>
                            <Input
                              value={transferReference}
                              onChange={e => setTransferReference(e.target.value)}
                              placeholder={t.checkout.transferReferencePlaceholder}
                              required={paymentMethod === "kuraimi"}
                              className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Coupon Section */}
              <div className="border border-black/[0.06] p-6 md:p-8">
                <h2 className="text-[10px] font-sans tracking-luxury uppercase text-black/40 mb-6 flex items-center gap-3">
                  <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {isRTL ? "كوبون الخصم" : "Discount Code"}
                </h2>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-black/[0.02] border border-black/[0.06] px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[12px] font-sans font-medium tracking-wide uppercase">{appliedCoupon.code}</p>
                        <p className="text-[10px] font-sans text-black/40 mt-0.5">
                          {isRTL
                            ? (appliedCoupon.descriptionAr || `خصم ${appliedCoupon.type === "percentage" ? `${appliedCoupon.value}%` : `${appliedCoupon.value} ر.س`}`)
                            : (appliedCoupon.description || `${appliedCoupon.type === "percentage" ? `${appliedCoupon.value}%` : `${appliedCoupon.value} SAR`} off`)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-sans font-medium text-green-700">-{formatPrice(discount)}</span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="w-7 h-7 flex items-center justify-center hover:bg-black/[0.04] transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-black/30" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder={isRTL ? "أدخل كود الخصم" : "Enter discount code"}
                      className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] bg-white focus:border-black/20 transition-all placeholder:text-black/15 uppercase tracking-wider flex-1"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); } }}
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="rounded-none h-11 px-6 font-sans text-[10px] tracking-luxury uppercase bg-black hover:bg-black/90 text-white transition-all disabled:opacity-30"
                    >
                      {couponLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        isRTL ? "تطبيق" : "Apply"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Security Notice */}
              <div className="flex items-center gap-3 px-5 py-3.5 border border-black/[0.04]">
                <Lock className="w-3 h-3 text-black/20 shrink-0" strokeWidth={1.5} />
                <p className="text-[10px] font-sans text-black/25">
                  {isRTL ? "جميع بياناتك مشفرة ومحمية بأعلى معايير الأمان" : "All your data is encrypted and protected with the highest security standards"}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-black/[0.06] sticky top-32">
                <div className="p-6">
                  <h2 className="text-[10px] font-sans tracking-luxury uppercase text-black/40 mb-6">{t.cart.orderSummary}</h2>
                  
                  <div className="space-y-3 mb-6 max-h-[250px] overflow-y-auto">
                    {items.map(item => {
                      const price = item.product ? parseFloat(item.product.price) + (item.option ? parseFloat(item.option.priceModifier ?? "0") : 0) : 0;
                      return (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-14 h-[70px] overflow-hidden bg-[#f5f5f5] shrink-0">
                            <img src={item.images?.[0]?.url || "https://placehold.co/60x75/f5f5f5/999?text=N"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-sans font-medium line-clamp-1">{item.product?.name}</p>
                            {item.option && <p className="text-[9px] font-sans text-black/25 mt-0.5">{item.option.name}: {item.option.value}</p>}
                            <p className="text-[10px] font-sans text-black/30 mt-1">{isRTL ? "الكمية" : "Qty"}: {item.quantity}</p>
                          </div>
                          <span className="text-[12px] font-sans tabular-nums shrink-0">{formatPrice(price * item.quantity)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3 pt-4 border-t border-black/[0.04] mb-4">
                    <div className="flex justify-between text-[12px] font-sans">
                      <span className="text-black/40">{t.cart.subtotal}</span>
                      <span className="tabular-nums">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[12px] font-sans">
                      <span className="text-black/40">{t.cart.shipping}</span>
                      <span className="tabular-nums">{shipping === 0 ? (isRTL ? "مجاني" : "Complimentary") : formatPrice(shipping)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-[12px] font-sans">
                        <span className="text-black/40 flex items-center gap-1.5">
                          <Tag className="w-3 h-3" strokeWidth={1.5} />
                          {isRTL ? "الخصم" : "Discount"}
                          <span className="text-[9px] text-black/25 uppercase">({appliedCoupon.code})</span>
                        </span>
                        <span className="tabular-nums text-green-700">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    {/* Payment Method Display */}
                    <div className="flex justify-between text-[12px] font-sans">
                      <span className="text-black/40">{t.checkout.paymentMethod}</span>
                      <span className="text-[11px]">{paymentMethod === "kuraimi" ? t.checkout.kuraimi : t.checkout.cod}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-4 border-t border-black/[0.04] mb-6">
                    <span className="text-[10px] font-sans tracking-luxury uppercase text-black/40">{t.cart.total}</span>
                    <span className="text-xl font-sans tabular-nums">{formatPrice(total)}</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 rounded-none font-sans text-[10px] tracking-luxury uppercase bg-black hover:bg-black/90 text-white transition-all duration-300 gap-2"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-white/30 border-t-white animate-spin" />
                        {isRTL ? "جاري التنفيذ..." : "Processing..."}
                      </div>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" strokeWidth={1.5} />
                        {t.checkout.placeOrder}
                      </>
                    )}
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
        </form>
      </div>

      {/* Trust Badges */}
      <TrustBadges variant="compact" className="border-t border-black/[0.04] mt-8" />
    </div>
  );
}
