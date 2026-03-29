import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Plus, ArrowLeft, Trash2, ToggleLeft, ToggleRight, Percent, DollarSign, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminCoupons() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const { isRTL } = useLanguage();
  const utils = trpc.useUtils();

  const { data: coupons, isLoading } = trpc.admin.listCoupons.useQuery({}, { enabled: user?.role === "admin" });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    descriptionAr: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    maxUses: "",
    maxUsesPerUser: "1",
    expiresAt: "",
  });

  const createCoupon = trpc.admin.createCoupon.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? "تم إنشاء الكوبون بنجاح" : "Coupon created successfully");
      utils.admin.listCoupons.invalidate();
      setShowForm(false);
      resetForm();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleCoupon = trpc.admin.toggleCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listCoupons.invalidate();
      toast.success(isRTL ? "تم تحديث حالة الكوبون" : "Coupon status updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCoupon = trpc.admin.deleteCoupon.useMutation({
    onSuccess: () => {
      utils.admin.listCoupons.invalidate();
      toast.success(isRTL ? "تم حذف الكوبون" : "Coupon deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (!loading && user && user.role !== "admin") navigate("/");
  }, [user, loading, navigate]);

  const resetForm = () => {
    setFormData({
      code: "", description: "", descriptionAr: "", type: "percentage",
      value: "", minOrderAmount: "", maxDiscountAmount: "", maxUses: "", maxUsesPerUser: "1", expiresAt: "",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error(isRTL ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields");
      return;
    }
    await createCoupon.mutateAsync({
      code: formData.code,
      description: formData.description || undefined,
      descriptionAr: formData.descriptionAr || undefined,
      type: formData.type,
      value: formData.value,
      minOrderAmount: formData.minOrderAmount || undefined,
      maxDiscountAmount: formData.maxDiscountAmount || null,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      maxUsesPerUser: parseInt(formData.maxUsesPerUser) || 1,
      expiresAt: formData.expiresAt || null,
    });
  };

  if (loading || isLoading || user?.role !== "admin") {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20">
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {isRTL ? "إدارة الكوبونات" : "Manage Coupons"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isRTL ? `${coupons?.total ?? 0} كوبون` : `${coupons?.total ?? 0} coupons`}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 rounded-full">
            <Plus className="w-4 h-4" />
            {isRTL ? "كوبون جديد" : "New Coupon"}
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8">
            <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "var(--font-heading)" }}>
              {isRTL ? "إنشاء كوبون جديد" : "Create New Coupon"}
            </h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label className="text-xs font-medium mb-2 block">{isRTL ? "كود الكوبون *" : "Coupon Code *"}</Label>
                  <Input
                    value={formData.code}
                    onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    placeholder="SAVE20"
                    required
                    className="uppercase tracking-wider"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">{isRTL ? "نوع الخصم *" : "Discount Type *"}</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.type === "percentage" ? "default" : "outline"}
                      onClick={() => setFormData(p => ({ ...p, type: "percentage" }))}
                      className="flex-1 gap-2"
                    >
                      <Percent className="w-3.5 h-3.5" /> {isRTL ? "نسبة مئوية" : "Percentage"}
                    </Button>
                    <Button
                      type="button"
                      variant={formData.type === "fixed" ? "default" : "outline"}
                      onClick={() => setFormData(p => ({ ...p, type: "fixed" }))}
                      className="flex-1 gap-2"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> {isRTL ? "مبلغ ثابت" : "Fixed Amount"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">
                    {isRTL ? `القيمة * (${formData.type === "percentage" ? "%" : "ر.س"})` : `Value * (${formData.type === "percentage" ? "%" : "SAR"})`}
                  </Label>
                  <Input
                    value={formData.value}
                    onChange={e => setFormData(p => ({ ...p, value: e.target.value }))}
                    placeholder={formData.type === "percentage" ? "20" : "50"}
                    required
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">{isRTL ? "الحد الأدنى للطلب (ر.س)" : "Min Order Amount (SAR)"}</Label>
                  <Input
                    value={formData.minOrderAmount}
                    onChange={e => setFormData(p => ({ ...p, minOrderAmount: e.target.value }))}
                    placeholder="100"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
                {formData.type === "percentage" && (
                  <div>
                    <Label className="text-xs font-medium mb-2 block">{isRTL ? "الحد الأقصى للخصم (ر.س)" : "Max Discount (SAR)"}</Label>
                    <Input
                      value={formData.maxDiscountAmount}
                      onChange={e => setFormData(p => ({ ...p, maxDiscountAmount: e.target.value }))}
                      placeholder="100"
                      type="number"
                      step="0.01"
                      min="0"
                    />
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium mb-2 block">{isRTL ? "الحد الأقصى للاستخدام" : "Max Total Uses"}</Label>
                  <Input
                    value={formData.maxUses}
                    onChange={e => setFormData(p => ({ ...p, maxUses: e.target.value }))}
                    placeholder={isRTL ? "غير محدود" : "Unlimited"}
                    type="number"
                    min="1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">{isRTL ? "الاستخدام لكل مستخدم" : "Uses Per User"}</Label>
                  <Input
                    value={formData.maxUsesPerUser}
                    onChange={e => setFormData(p => ({ ...p, maxUsesPerUser: e.target.value }))}
                    placeholder="1"
                    type="number"
                    min="1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">{isRTL ? "تاريخ الانتهاء" : "Expires At"}</Label>
                  <Input
                    value={formData.expiresAt}
                    onChange={e => setFormData(p => ({ ...p, expiresAt: e.target.value }))}
                    type="datetime-local"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">{isRTL ? "الوصف (إنجليزي)" : "Description (EN)"}</Label>
                  <Input
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    placeholder="20% off your order"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium mb-2 block">{isRTL ? "الوصف (عربي)" : "Description (AR)"}</Label>
                  <Input
                    value={formData.descriptionAr}
                    onChange={e => setFormData(p => ({ ...p, descriptionAr: e.target.value }))}
                    placeholder="خصم 20% على طلبك"
                    dir="rtl"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createCoupon.isPending} className="gap-2">
                  {createCoupon.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isRTL ? "إنشاء الكوبون" : "Create Coupon"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {!coupons || coupons.items.length === 0 ? (
            <div className="p-12 text-center">
              <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" strokeWidth={1} />
              <p className="text-muted-foreground">{isRTL ? "لا توجد كوبونات بعد" : "No coupons yet"}</p>
              <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> {isRTL ? "إنشاء أول كوبون" : "Create First Coupon"}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-xs font-medium text-muted-foreground px-4 py-3 text-start">{isRTL ? "الكود" : "Code"}</th>
                    <th className="text-xs font-medium text-muted-foreground px-4 py-3 text-start">{isRTL ? "النوع" : "Type"}</th>
                    <th className="text-xs font-medium text-muted-foreground px-4 py-3 text-start">{isRTL ? "القيمة" : "Value"}</th>
                    <th className="text-xs font-medium text-muted-foreground px-4 py-3 text-start">{isRTL ? "الحد الأدنى" : "Min Order"}</th>
                    <th className="text-xs font-medium text-muted-foreground px-4 py-3 text-start">{isRTL ? "الاستخدام" : "Usage"}</th>
                    <th className="text-xs font-medium text-muted-foreground px-4 py-3 text-start">{isRTL ? "الانتهاء" : "Expires"}</th>
                    <th className="text-xs font-medium text-muted-foreground px-4 py-3 text-start">{isRTL ? "الحالة" : "Status"}</th>
                    <th className="text-xs font-medium text-muted-foreground px-4 py-3 text-start">{isRTL ? "إجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.items.map((coupon: any) => {
                    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                    const isMaxed = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                    return (
                      <tr key={coupon.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-bold tracking-wider">{coupon.code}</span>
                          {coupon.descriptionAr && <p className="text-xs text-muted-foreground mt-0.5">{isRTL ? coupon.descriptionAr : coupon.description}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            coupon.type === "percentage" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                          }`}>
                            {coupon.type === "percentage" ? <Percent className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                            {coupon.type === "percentage" ? isRTL ? "نسبة" : "%" : isRTL ? "ثابت" : "Fixed"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {coupon.type === "percentage" ? `${coupon.value}%` : `${coupon.value} ${isRTL ? "ر.س" : "SAR"}`}
                          {coupon.maxDiscountAmount && (
                            <p className="text-xs text-muted-foreground">{isRTL ? `حد أقصى: ${coupon.maxDiscountAmount} ر.س` : `Max: ${coupon.maxDiscountAmount} SAR`}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {parseFloat(coupon.minOrderAmount) > 0 ? `${coupon.minOrderAmount} ${isRTL ? "ر.س" : "SAR"}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="font-medium">{coupon.usedCount ?? 0}</span>
                          <span className="text-muted-foreground">/{coupon.maxUses ?? "∞"}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {coupon.expiresAt ? (
                            <span className={isExpired ? "text-red-500" : ""}>
                              {new Date(coupon.expiresAt).toLocaleDateString(isRTL ? "ar" : "en", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          ) : (isRTL ? "بلا حد" : "No limit")}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full ${
                            !coupon.isActive ? "bg-gray-100 text-gray-500" :
                            isExpired ? "bg-red-100 text-red-600" :
                            isMaxed ? "bg-yellow-100 text-yellow-600" :
                            "bg-green-100 text-green-600"
                          }`}>
                            {!coupon.isActive ? (isRTL ? "معطل" : "Inactive") :
                             isExpired ? (isRTL ? "منتهي" : "Expired") :
                             isMaxed ? (isRTL ? "مكتمل" : "Maxed") :
                             (isRTL ? "نشط" : "Active")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleCoupon.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                              title={coupon.isActive ? (isRTL ? "تعطيل" : "Deactivate") : (isRTL ? "تفعيل" : "Activate")}
                            >
                              {coupon.isActive ? (
                                <ToggleRight className="w-4 h-4 text-green-600" />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-gray-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (confirm(isRTL ? "هل تريد حذف هذا الكوبون؟" : "Delete this coupon?")) {
                                  deleteCoupon.mutate({ id: coupon.id });
                                }
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
