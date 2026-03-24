import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, MapPin, Phone, Mail, Check } from "lucide-react";
import { useParams, Link } from "wouter";

const statusSteps = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: order, isLoading } = trpc.orders.byId.useQuery({ id: parseInt(id || "0") }, { enabled: !!user && !!id });

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
        <h2 className="text-xl font-bold mb-4">Order Not Found</h2>
        <Link href="/orders"><Button variant="outline" className="rounded-full">Back to Orders</Button></Link>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-secondary/30 border-b border-border/60">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-foreground transition-colors">My Orders</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Order #{order.id}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Order #{order.id}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 border text-[11px] font-semibold rounded-full capitalize ${
              order.status === "delivered" ? "bg-green-50 border-green-100 text-green-700" :
              order.status === "cancelled" ? "bg-red-50 border-red-100 text-red-700" :
              order.status === "shipped" ? "bg-purple-50 border-purple-100 text-purple-700" :
              order.status === "processing" ? "bg-blue-50 border-blue-100 text-blue-700" :
              "bg-amber-50 border-amber-100 text-amber-700"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                order.status === "delivered" ? "bg-green-500" :
                order.status === "cancelled" ? "bg-red-500" :
                order.status === "shipped" ? "bg-purple-500" :
                order.status === "processing" ? "bg-blue-500" :
                "bg-amber-500"
              }`} />
              {order.status}
            </span>
          </div>
        </div>

        {/* Status Progress */}
        {order.status !== "cancelled" && (
          <div className="border border-border/40 bg-card rounded-2xl p-6 mb-6">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-5">Order Progress</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold rounded-full transition-colors ${
                      i <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i <= currentStep ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className="text-[11px] mt-2 capitalize font-medium">{step}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 rounded-full ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Order Items</h2>
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
                      <p className="text-[11px] text-muted-foreground mt-1">Qty: {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold">${parseFloat(item.totalPrice).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 border-t border-border/40 bg-secondary/20 flex justify-between items-center">
                <span className="text-sm font-bold">Total</span>
                <span className="text-xl font-bold">${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="border border-border/40 bg-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Shipping Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</p>
                    <p className="text-sm font-medium">{order.shippingName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium">{order.shippingEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</p>
                    <p className="text-sm font-medium">{order.shippingPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Address</p>
                    <p className="text-sm font-medium">{order.shippingAddress}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingCity}, {order.shippingCountry} {order.shippingZipCode}</p>
                  </div>
                </div>
              </div>
              {order.notes && (
                <div className="px-6 py-4 border-t border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>

            <Link href="/orders" className="block">
              <Button variant="outline" className="w-full rounded-full gap-2 font-semibold">
                <ArrowLeft className="w-4 h-4" /> Back to Orders
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
