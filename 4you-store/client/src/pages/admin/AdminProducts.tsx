import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ArrowLeft, ArrowRight, Image as ImageIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminProducts() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { isRTL } = useLanguage();
  const { data, isLoading } = trpc.products.list.useQuery({ limit: 100 }, { enabled: user?.role === "admin" });

  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (!loading && user && user.role !== "admin") navigate("/");
  }, [user, loading, navigate]);

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      utils.products.list.invalidate();
      toast.success(isRTL ? "تم حذف المنتج" : "Product deleted");
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(isRTL ? `هل تريد حذف "${name}"؟` : `Delete "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container py-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <BackArrow className="w-4 h-4" /> {isRTL ? "العودة إلى لوحة التحكم" : "Back to Dashboard"}
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>{isRTL ? "المنتجات" : "Products"}</h1>
          <Link href="/admin/products/new">
            <Button className="gap-2 rounded-full"><Plus className="w-4 h-4" /> {isRTL ? "إضافة منتج" : "Add Product"}</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-xl">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{isRTL ? "لا توجد منتجات بعد" : "No products yet"}</h3>
            <p className="text-muted-foreground mb-4">{isRTL ? "ابدأ بإضافة منتجك الأول" : "Start by adding your first product"}</p>
            <Link href="/admin/products/new"><Button className="gap-2"><Plus className="w-4 h-4" /> {isRTL ? "إضافة منتج" : "Add Product"}</Button></Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className={`${isRTL ? "text-right" : "text-left"} text-xs font-semibold uppercase tracking-wider p-4`}>{isRTL ? "المنتج" : "Product"}</th>
                    <th className={`${isRTL ? "text-right" : "text-left"} text-xs font-semibold uppercase tracking-wider p-4`}>{isRTL ? "السعر" : "Price"}</th>
                    <th className={`${isRTL ? "text-right" : "text-left"} text-xs font-semibold uppercase tracking-wider p-4`}>{isRTL ? "المخزون" : "Stock"}</th>
                    <th className={`${isRTL ? "text-right" : "text-left"} text-xs font-semibold uppercase tracking-wider p-4`}>{isRTL ? "الحالة" : "Status"}</th>
                    <th className={`${isRTL ? "text-left" : "text-right"} text-xs font-semibold uppercase tracking-wider p-4`}>{isRTL ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(product => (
                    <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0]?.url || "https://placehold.co/48x48/f5f5f5/999?text=N"}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.brand || (isRTL ? "بدون ماركة" : "No brand")}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold">{parseFloat(product.price).toFixed(2)} {isRTL ? "ر.س" : "SAR"}</span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-muted-foreground line-through ml-2">{parseFloat(product.compareAtPrice).toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={product.stock > 0 ? "text-green-600" : "text-red-600"}>{product.stock}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? (isRTL ? "نشط" : "Active") : (isRTL ? "غير نشط" : "Inactive")}
                        </Badge>
                        {product.featured && <Badge variant="outline" className="ml-1">{isRTL ? "مميز" : "Featured"}</Badge>}
                      </td>
                      <td className={`p-4 ${isRTL ? "text-left" : "text-right"}`}>
                        <div className={`flex items-center ${isRTL ? "justify-start" : "justify-end"} gap-1`}>
                          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/products/${product.id}`)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id, product.name)}>
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
