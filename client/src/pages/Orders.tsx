import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  pending: { color: "text-amber-700", bg: "bg-amber-50 border-amber-100", dot: "bg-amber-500" },
  processing: { color: "text-blue-700", bg: "bg-blue-50 border-blue-100", dot: "bg-blue-500" },
  shipped: { color: "text-purple-700", bg: "bg-purple-50 border-purple-100", dot: "bg-purple-500" },
  delivered: { color: "text-green-700", bg: "bg-green-50 border-green-100", dot: "bg-green-500" },
  cancelled: { color: "text-red-700", bg: "bg-red-50 border-red-100", dot: "bg-red-500" },
};

export default function Orders() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: orders, isLoading } = trpc.orders.myOrders.useQuery(undefined, { enabled: !!user });
  const { t, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

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

  const getPaymentLabel = (status: string) => {
    if (isRTL) {
      return status === "paid" ? "مدفوع" : "قيد الانتظار";
    }
    return status;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>{t.orders.title}</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse p-5 bg-secondary/20 rounded-2xl">
              <div className="h-3 bg-muted rounded w-1/4 mb-3" />
              <div className="h-4 bg-muted rounded w-1/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-secondary/30 border-b border-border/60">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">{isRTL ? "الرئيسية" : "Home"}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{t.orders.title}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>{t.orders.title}</h1>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-secondary/60 flex items-center justify-center mx-auto mb-5">
              <Package className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <h2 className="text-lg font-bold mb-2">{t.orders.empty}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t.orders.emptyDesc}</p>
            <Link href="/products">
              <Button className="rounded-full gap-2 font-semibold px-8 h-11">
                {isRTL ? "ابدأ التسوق" : "Start Shopping"} <ArrowIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const config = statusConfig[order.status] || { color: "text-gray-700", bg: "bg-gray-50 border-gray-100", dot: "bg-gray-500" };
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="block group">
                  <div className="border border-border/40 bg-card rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-sm transition-all">
                    <div className="p-5 md:p-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">{isRTL ? `طلب #${order.id}` : `Order #${order.id}`}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString(isRTL ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <ChevronIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[11px] font-semibold rounded-full capitalize ${config.bg} ${config.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                            {getStatusLabel(order.status)}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[11px] font-semibold rounded-full capitalize ${
                            order.paymentStatus === "paid"
                              ? "bg-green-50 border-green-100 text-green-700"
                              : "bg-amber-50 border-amber-100 text-amber-700"
                          }`}>
                            {getPaymentLabel(order.paymentStatus)}
                          </span>
                        </div>
                        <span className="text-lg font-bold">{parseFloat(order.totalAmount).toFixed(2)} {isRTL ? "ر.س" : "SAR"}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
