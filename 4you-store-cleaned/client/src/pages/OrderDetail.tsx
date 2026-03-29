import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Package, MapPin, Phone, Mail, Check, CreditCard, Building2, Banknote, Clock, Truck, CheckCircle2, XCircle, Receipt } from "lucide-react";
import { useParams, Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const statusSteps = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: order, isLoading } = trpc.orders.byId.useQuery({ id: parseInt(id || "0") }, { enabled: !!user && !!id });
  const { t, isRTL } = useLanguage();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: t.orders.pending,
      processing: t.orders.processing,
      shipped: t.orders.shipped,
      delivered: t.orders.delivered,
      cancelled: t.orders.cancelled,
    };
    return map[status] || status;
  };

  const getStatusIcon = (step: string) => {
    switch (step) {
      case "pending": return Clock;
      case "processing": return Package;
      case "shipped": return Truck;
      case "delivered": return CheckCircle2;
      default: return Clock;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    if (isRTL) {
      return method === "kuraimi" ? "تحويل عبر الكريمي" : method === "stripe" ? "بطاقة ائتمان" : "الدفع عند الاستلام";
    }
    return method === "kuraimi" ? "Kuraimi Bank Transfer" : method === "stripe" ? "Credit Card" : "Cash on Delivery";
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method === "kuraimi") return <Building2 className="w-4 h-4 text-primary/60" />;
    if (method === "stripe") return <CreditCard className="w-4 h-4 text-primary/60" />;
    return <Banknote className="w-4 h-4 text-primary/60" />;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-muted rounded w-1/4" />
          <div className="h-40 bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-xl font-bold mb-4">{isRTL ? "الطلب غير موجود" : "Order Not Found"}</h2>
        <Link href="/orders">
          <Button variant="outline" className="rounded-full">
            {isRTL ? "العودة للطلبات" : "Back to Orders"}
          </Button>
        </Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const paymentMethod = (order as any).paymentMethod || "cod";
  const transferReference = (order as any).transferReference || "";

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-secondary/30 border-b border-border/60">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">{isRTL ? "الرئيسية" : "Home"}</Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-foreground transition-colors">{t.orders.title}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{isRTL ? `طلب #${order.id}` : `Order #${order.id}`}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              {isRTL ? `طلب #${order.id}` : `Order #${order.id}`}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL ? "تم الطلب في " : "Placed on "}
              {new Date(order.createdAt).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[11px] font-semibold rounded-full capitalize ${
              isCancelled ? "bg-red-50 border-red-100 text-red-700" :
              order.status === "delivered" ? "bg-green-50 border-green-100 text-green-700" :
              order.status === "shipped" ? "bg-purple-50 border-purple-100 text-purple-700" :
              order.status === "processing" ? "bg-blue-50 border-blue-100 text-blue-700" :
              "bg-amber-50 border-amber-100 text-amber-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isCancelled ? "bg-red-500" :
                order.status === "delivered" ? "bg-green-500" :
                order.status === "shipped" ? "bg-purple-500" :
                order.status === "processing" ? "bg-blue-500" :
                "bg-amber-500"
              }`} />
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        {/* Status Progress */}
        {isCancelled ? (
          <div className="border border-red-200 bg-red-50/50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">
                  {isRTL ? "تم إلغاء هذا الطلب" : "This order has been cancelled"}
                </h3>
                <p className="text-xs text-red-600 mt-0.5">
                  {isRTL ? "إذا كان لديك أي استفسار، يرجى التواصل معنا" : "If you have any questions, please contact us"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-border/40 bg-card rounded-2xl p-6 mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              {isRTL ? "تقدم الطلب" : "Order Progress"}
            </h3>
            <div className="flex items-center justify-between relative">
              {statusSteps.map((step, i) => {
                const StepIcon = getStatusIcon(step);
                const isCompleted = i <= currentStep;
                const isActive = i === currentStep;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                        isCompleted
                          ? isActive
                            ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                            : "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isCompleted && !isActive ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`text-[11px] mt-2.5 font-semibold capitalize ${
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {getStatusLabel(step)}
                      </span>
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                        i < currentStep ? "bg-primary" : "bg-border"
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {isRTL ? "عناصر الطلب" : "Order Items"}
                </h2>
              </div>
              <div className="divide-y divide-border/40">
                {order.items?.map(item => (
                  <div key={item.id} className="flex gap-4 p-5">
                    <img
                      src={item.productImage || "https://placehold.co/80x100/f8f6f3/999?text=N"}
                      alt={item.productName}
                      className="w-16 h-20 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold line-clamp-1">{item.productName}</h3>
                      {item.optionName && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{item.optionName}: {item.optionValue}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {isRTL ? `الكمية: ${item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}` : `Qty: ${item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}`} {isRTL ? "ر.س" : "SAR"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold">{parseFloat(item.totalPrice).toFixed(2)} {isRTL ? "ر.س" : "SAR"}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Order summary */}
              <div className="px-6 py-4 border-t border-border/40 bg-secondary/20">
                {order.discountAmount && parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-green-600 font-medium">{isRTL ? "خصم الكوبون" : "Coupon Discount"} {order.couponCode ? `(${order.couponCode})` : ""}</span>
                    <span className="text-xs text-green-600 font-semibold">-{parseFloat(order.discountAmount).toFixed(2)} {isRTL ? "ر.س" : "SAR"}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold">{isRTL ? "الإجمالي" : "Total"}</span>
                  <span className="text-xl font-bold">{parseFloat(order.totalAmount).toFixed(2)} {isRTL ? "ر.س" : "SAR"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Payment Info */}
            <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {isRTL ? "معلومات الدفع" : "Payment Information"}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Payment method */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    {getPaymentMethodIcon(paymentMethod)}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {isRTL ? "طريقة الدفع" : "Payment Method"}
                    </p>
                    <p className="text-sm font-medium">{getPaymentMethodLabel(paymentMethod)}</p>
                  </div>
                </div>
                {/* Payment status */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <CreditCard className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {isRTL ? "حالة الدفع" : "Payment Status"}
                    </p>
                    <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 border text-[11px] font-semibold rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-50 border-green-100 text-green-700"
                        : "bg-amber-50 border-amber-100 text-amber-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === "paid" ? "bg-green-500" : "bg-amber-500"}`} />
                      {isRTL ? (order.paymentStatus === "paid" ? "مدفوع" : "قيد الانتظار") : (order.paymentStatus === "paid" ? "Paid" : "Unpaid")}
                    </span>
                  </div>
                </div>
                {/* Transfer reference */}
                {transferReference && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                      <Receipt className="w-3.5 h-3.5 text-primary/60" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {isRTL ? "رقم الحوالة" : "Transfer Reference"}
                      </p>
                      <p className="text-sm font-mono font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 mt-1 inline-block">
                        {transferReference}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {isRTL ? "معلومات الشحن" : "Shipping Details"}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{isRTL ? "الاسم" : "Name"}</p>
                    <p className="text-sm font-medium">{order.shippingName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{isRTL ? "البريد الإلكتروني" : "Email"}</p>
                    <p className="text-sm font-medium">{order.shippingEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{isRTL ? "رقم الهاتف" : "Phone"}</p>
                    <p className="text-sm font-medium">{order.shippingPhone}</p>
                  </div>
                </div>
                {order.shippingAddress && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5 text-primary/60" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{isRTL ? "العنوان" : "Address"}</p>
                      <p className="text-sm font-medium">{order.shippingAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {[order.shippingCity, order.shippingCountry, order.shippingZipCode].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {order.notes && (
                <div className="px-6 py-4 border-t border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{isRTL ? "ملاحظات" : "Notes"}</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>

            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full rounded-full gap-2 font-semibold">
                <BackIcon className="w-4 h-4" /> {isRTL ? "العودة للطلبات" : "Back to Orders"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
