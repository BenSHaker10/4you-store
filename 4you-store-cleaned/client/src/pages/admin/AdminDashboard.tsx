import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Package, ShoppingCart, Users, DollarSign, Plus, ArrowRight, ArrowLeft, Settings, Tag } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminDashboard() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const { data: stats, isLoading } = trpc.admin.stats.useQuery(undefined, { enabled: user?.role === "admin" });
  const { t, isRTL } = useLanguage();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    if (!loading && user && user.role !== "admin") {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading || isLoading || user?.role !== "admin") {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: isRTL ? "إجمالي المنتجات" : "Total Products", value: stats?.totalProducts ?? 0, icon: Package, color: "text-blue-600 bg-blue-100" },
    { label: isRTL ? "إجمالي الطلبات" : "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-green-600 bg-green-100" },
    { label: isRTL ? "الإيرادات" : "Revenue", value: `${(stats?.totalRevenue ?? 0).toLocaleString()} ${isRTL ? "ر.س" : "SAR"}`, icon: DollarSign, color: "text-purple-600 bg-purple-100" },
    { label: isRTL ? "إجمالي المستخدمين" : "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{isRTL ? "لوحة التحكم" : "Admin Dashboard"}</h1>
            <p className="text-muted-foreground mt-1">{isRTL ? `مرحباً بعودتك، ${user?.name || "المدير"}` : `Welcome back, ${user?.name || "Admin"}`}</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="gap-2 rounded-full">
              <Plus className="w-4 h-4" /> {isRTL ? "إضافة منتج" : "Add Product"}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/products" className="block">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <Package className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold mb-1">{isRTL ? "إدارة المنتجات" : "Manage Products"}</h3>
              <p className="text-sm text-muted-foreground mb-3">{isRTL ? "إضافة أو تعديل أو حذف المنتجات" : "Add, edit, or remove products"}</p>
              <span className="text-sm text-primary inline-flex items-center gap-1">{isRTL ? "انتقل" : "Go"} <ArrowIcon className="w-3 h-3" /></span>
            </div>
          </Link>
          <Link href="/admin/orders" className="block">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <ShoppingCart className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold mb-1">{isRTL ? "إدارة الطلبات" : "Manage Orders"}</h3>
              <p className="text-sm text-muted-foreground mb-3">{isRTL ? "عرض وتحديث حالة الطلبات" : "View and update order status"}</p>
              <span className="text-sm text-primary inline-flex items-center gap-1">{isRTL ? "انتقل" : "Go"} <ArrowIcon className="w-3 h-3" /></span>
            </div>
          </Link>
          <Link href="/admin/categories" className="block">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <Users className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold mb-1">{isRTL ? "إدارة الفئات" : "Manage Categories"}</h3>
              <p className="text-sm text-muted-foreground mb-3">{isRTL ? "تنظيم فئات المنتجات" : "Organize product categories"}</p>
              <span className="text-sm text-primary inline-flex items-center gap-1">{isRTL ? "انتقل" : "Go"} <ArrowIcon className="w-3 h-3" /></span>
            </div>
          </Link>
          <Link href="/admin/coupons" className="block">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <Tag className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold mb-1">{isRTL ? "إدارة الكوبونات" : "Manage Coupons"}</h3>
              <p className="text-sm text-muted-foreground mb-3">{isRTL ? "إنشاء وإدارة كوبونات الخصم" : "Create and manage discount codes"}</p>
              <span className="text-sm text-primary inline-flex items-center gap-1">{isRTL ? "انتقل" : "Go"} <ArrowIcon className="w-3 h-3" /></span>
            </div>
          </Link>
          <Link href="/admin/settings" className="block">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors">
              <Settings className="w-6 h-6 text-primary mb-3" />
              <h3 className="font-bold mb-1">{isRTL ? "إعدادات المتجر" : "Store Settings"}</h3>
              <p className="text-sm text-muted-foreground mb-3">{isRTL ? "سعر الصرف وإعدادات العملة" : "Exchange rate & currency settings"}</p>
              <span className="text-sm text-primary inline-flex items-center gap-1">{isRTL ? "انتقل" : "Go"} <ArrowIcon className="w-3 h-3" /></span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
