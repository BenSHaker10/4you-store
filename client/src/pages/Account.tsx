import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Package, ChevronRight, ChevronLeft, Heart, Settings, LogOut, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Account() {
  const { user, logout } = useAuth({ redirectOnUnauthenticated: true });
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { t, isRTL } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: (user as any).phone || "",
        address: (user as any).address || "",
        city: (user as any).city || "",
        country: (user as any).country || "",
        zipCode: (user as any).zipCode || "",
      });
    }
  }, [user]);

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? "تم تحديث الملف الشخصي" : "Profile updated");
      utils.auth.me.invalidate();
    },
    onError: () => {
      toast.error(isRTL ? "فشل في تحديث الملف الشخصي" : "Failed to update profile");
    },
  });

  const changePassword = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? "تم تغيير كلمة المرور" : "Password changed");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err) => {
      toast.error(err.message || (isRTL ? "فشل في تغيير كلمة المرور" : "Failed to change password"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error(isRTL ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }
    changePassword.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const menuItems = [
    { icon: Package, label: isRTL ? "طلباتي" : "My Orders", href: "/orders" },
    { icon: Heart, label: isRTL ? "المفضلة" : "Wishlist", href: "/products", badge: isRTL ? "قريباً" : "Soon" },
    { icon: Settings, label: isRTL ? "الإعدادات" : "Settings", href: "/account", active: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-black/[0.04]">
        <div className="container py-4">
          <div className="flex items-center gap-2 text-[10px] font-sans tracking-wide text-black/25">
            <Link href="/" className="hover:text-black transition-colors">{isRTL ? "الرئيسية" : "Home"}</Link>
            <span className="text-black/10">/</span>
            <span className="text-black/50">{t.account.title}</span>
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-10">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            {/* User Info */}
            <div className="border border-black/[0.06] p-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center text-sm font-heading italic">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-sans font-medium truncate">{user?.name || (isRTL ? "مستخدم" : "User")}</p>
                  <p className="text-[10px] font-sans text-black/25 truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu */}
            <div className="border border-black/[0.06] divide-y divide-black/[0.04]">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center justify-between px-5 py-4 text-[11px] font-sans transition-all duration-300 ${
                    item.active ? "bg-black/[0.02] text-black" : "text-black/40 hover:text-black hover:bg-black/[0.01]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-3.5 h-3.5 ${item.active ? "text-black" : "text-black/20"}`} strokeWidth={1.5} />
                    {item.label}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="text-[8px] font-sans tracking-luxury uppercase border border-black/[0.06] px-2 py-0.5 text-black/20">{item.badge}</span>
                    )}
                    <ChevronIcon className="w-3 h-3 text-black/15" strokeWidth={1.5} />
                  </div>
                </Link>
              ))}
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-3 px-5 py-4 text-[11px] font-sans text-black/30 hover:text-red-500 transition-all duration-300"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                {t.account.signOut}
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Profile Settings */}
            <div className="border border-black/[0.06]">
              <div className="px-6 py-5 border-b border-black/[0.04]">
                <h1 className="text-[10px] font-sans tracking-luxury uppercase text-black/40">{t.account.settings}</h1>
                <p className="text-[11px] font-sans text-black/20 mt-1">{t.account.manageInfo}</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="name" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.fullName}</Label>
                      <Input id="name" value={form.name} onChange={e => updateField("name", e.target.value)} placeholder={isRTL ? "اسمك" : "Your name"} className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all placeholder:text-black/15" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.email}</Label>
                      <Input id="email" value={user?.email || ""} disabled className="rounded-none h-11 text-[13px] font-sans bg-[#fafafa] border-black/[0.04] text-black/30" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.phone}</Label>
                      <Input id="phone" value={form.phone} onChange={e => updateField("phone", e.target.value)} placeholder="+966 5XX XXX XXXX" className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all placeholder:text-black/15" />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.country}</Label>
                      <Input id="country" value={form.country} onChange={e => updateField("country", e.target.value)} placeholder={isRTL ? "المملكة العربية السعودية" : "Saudi Arabia"} className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all placeholder:text-black/15" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.address}</Label>
                      <Input id="address" value={form.address} onChange={e => updateField("address", e.target.value)} placeholder={isRTL ? "عنوانك الكامل" : "Your full address"} className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all placeholder:text-black/15" />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.city}</Label>
                      <Input id="city" value={form.city} onChange={e => updateField("city", e.target.value)} placeholder={isRTL ? "الرياض" : "Riyadh"} className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all placeholder:text-black/15" />
                    </div>
                    <div>
                      <Label htmlFor="zip" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{isRTL ? "الرمز البريدي" : "ZIP Code"}</Label>
                      <Input id="zip" value={form.zipCode} onChange={e => updateField("zipCode", e.target.value)} placeholder="12345" className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all placeholder:text-black/15" />
                    </div>
                  </div>
                  <div className="mt-7 pt-6 border-t border-black/[0.04]">
                    <Button
                      type="submit"
                      className="rounded-none gap-2 font-sans text-[10px] tracking-luxury uppercase px-8 h-10 bg-black hover:bg-black/90 text-white transition-all duration-300"
                      disabled={updateProfile.isPending}
                    >
                      <Save className="w-3 h-3" strokeWidth={1.5} />
                      {updateProfile.isPending ? (isRTL ? "جاري الحفظ..." : "Saving...") : t.account.saveChanges}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* Change Password */}
            <div className="border border-black/[0.06]">
              <div className="px-6 py-5 border-b border-black/[0.04]">
                <h2 className="text-[10px] font-sans tracking-luxury uppercase text-black/40 flex items-center gap-2">
                  <Lock className="w-3 h-3" strokeWidth={1.5} />
                  {isRTL ? "تغيير كلمة المرور" : "Change Password"}
                </h2>
              </div>
              <div className="p-6">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <Label className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{isRTL ? "كلمة المرور الحالية" : "Current Password"}</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all pr-10"
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/15 hover:text-black/40 transition-colors">
                          {showPasswords.current ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{isRTL ? "كلمة المرور الجديدة" : "New Password"}</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all pr-10"
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/15 hover:text-black/40 transition-colors">
                          {showPasswords.new ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="rounded-none h-11 text-[13px] font-sans border-black/[0.08] focus:border-black/20 transition-all pr-10"
                          required
                        />
                        <button type="button" onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/15 hover:text-black/40 transition-colors">
                          {showPasswords.confirm ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-5 border-t border-black/[0.04]">
                    <Button
                      type="submit"
                      variant="outline"
                      className="rounded-none gap-2 font-sans text-[10px] tracking-luxury uppercase px-8 h-10 border-black/15 hover:bg-black hover:text-white transition-all duration-300"
                      disabled={changePassword.isPending}
                    >
                      <Lock className="w-3 h-3" strokeWidth={1.5} />
                      {changePassword.isPending ? (isRTL ? "جاري التغيير..." : "Changing...") : (isRTL ? "تغيير كلمة المرور" : "Change Password")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
