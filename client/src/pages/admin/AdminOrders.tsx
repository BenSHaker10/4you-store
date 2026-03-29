import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Eye, Trash2, Bell, BellRing, CheckCircle2, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState("all");
  const utils = trpc.useUtils();
  const prevOrderCountRef = useRef<number | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  useEffect(() => {
    if (!loading && user && user.role !== "admin") navigate("/");
  }, [user, loading, navigate]);

  const { data, isLoading } = trpc.admin.orders.useQuery(
    { status: statusFilter !== "all" ? statusFilter : undefined, limit: 100 },
    {
      enabled: user?.role === "admin",
      refetchInterval: 15000,
    }
  );

  // Notification when new order arrives
  useEffect(() => {
    if (data && data.total !== undefined) {
      if (prevOrderCountRef.current !== null && data.total > prevOrderCountRef.current) {
        const newCount = data.total - prevOrderCountRef.current;
        setNewOrderAlert(true);
        toast.success(`🔔 ${newCount} طلب جديد وصل!`, {
          description: "New order received!",
          duration: 10000,
        });
        try {
          const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczGjlkjrfWwX1RLSF5pMvb1IhYOzN3l8GYbkMvP3KUw5RuQy8/cpTDlG5DLz9ylMOUbkMvP3KUw5RuQy8/cpTDlG4A");
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch {}
        setTimeout(() => setNewOrderAlert(false), 5000);
      }
      prevOrderCountRef.current = data.total;
    }
  }, [data]);

  const updateStatus = trpc.admin.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.admin.orders.invalidate();
      toast.success("تم تحديث حالة الطلب");
    },
  });

  const updatePaymentStatus = trpc.admin.updatePaymentStatus.useMutation({
    onSuccess: (_data, variables) => {
      utils.admin.orders.invalidate();
      if (variables.paymentStatus === "paid") {
        toast.success("✅ تم تأكيد الدفع بنجاح");
      } else {
        toast.success("تم تغيير حالة الدفع إلى: لم يتم الدفع");
      }
    },
    onError: () => {
      toast.error("فشل تحديث حالة الدفع");
    },
  });

  const deleteOrder = trpc.admin.deleteOrder.useMutation({
    onSuccess: () => {
      utils.admin.orders.invalidate();
      toast.success("تم حذف الطلب بنجاح");
    },
    onError: () => {
      toast.error("فشل حذف الطلب");
    },
  });

  const handleDelete = (orderId: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.")) {
      deleteOrder.mutate({ orderId });
    }
  };

  const handleTogglePayment = (orderId: number, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "unpaid" : "paid";
    const message = newStatus === "paid"
      ? "هل تأكدت من وصول المبلغ لحسابك؟ سيتم تغيير الحالة إلى: تم الدفع"
      : "هل تريد تغيير الحالة إلى: لم يتم الدفع؟";
    if (window.confirm(message)) {
      updatePaymentStatus.mutate({ orderId, paymentStatus: newStatus as "paid" | "unpaid" });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container py-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>Orders</h1>
            {newOrderAlert && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-800 rounded-full animate-pulse">
                <BellRing className="w-4 h-4" />
                <span className="text-xs font-semibold">طلب جديد!</span>
              </div>
            )}
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left text-xs font-semibold uppercase tracking-wider p-4">Order</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider p-4">Customer</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider p-4">Total</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider p-4">Payment Method</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider p-4">Payment Status / حالة الدفع</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider p-4">Transfer Ref / رقم الحوالة</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider p-4">Order Status</th>
                    <th className="text-left text-xs font-semibold uppercase tracking-wider p-4">Date</th>
                    <th className="text-right text-xs font-semibold uppercase tracking-wider p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(order => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-4 font-medium">#{order.id}</td>
                      <td className="p-4">
                        <p className="text-sm">{order.shippingName}</p>
                        <p className="text-xs text-muted-foreground">{order.shippingEmail}</p>
                      </td>
                      <td className="p-4 font-semibold">{parseFloat(order.totalAmount).toFixed(2)} ر.س</td>
                      <td className="p-4">
                        {(order as any).paymentMethod && (
                          <span className="text-xs font-medium">
                            {(order as any).paymentMethod === "kuraimi" ? "🏦 الكريمي" : (order as any).paymentMethod === "cod" ? "💵 عند الاستلام" : (order as any).paymentMethod === "card" ? "💳 بطاقة" : (order as any).paymentMethod}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleTogglePayment(order.id, order.paymentStatus)}
                          disabled={updatePaymentStatus.isPending}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-2 hover:shadow-md ${
                            order.paymentStatus === "paid"
                              ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100"
                              : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                          } ${updatePaymentStatus.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                          title={order.paymentStatus === "paid" ? "اضغط لتغيير إلى: لم يتم الدفع" : "اضغط لتأكيد الدفع"}
                        >
                          {order.paymentStatus === "paid" ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              تم الدفع ✓
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              لم يتم الدفع
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        {(order as any).transferReference ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-mono font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                              {(order as any).transferReference}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateStatus.mutate({ orderId: order.id, status: v })}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/orders/${order.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(order.id)}
                            disabled={deleteOrder.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
