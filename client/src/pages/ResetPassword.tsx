import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const { isRTL } = useLanguage();

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setSuccess(true);
      toast.success(t.auth.passwordResetSuccess);
    },
    onError: (err) => {
      toast.error(err.message || (t.common.error));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error(t.common.required);
      return;
    }
    if (password.length < 8) {
      toast.error(t.account.passwordTooShort);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t.account.passwordsDoNotMatch);
      return;
    }
    resetMutation.mutate({ token, newPassword: password });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 border border-black/[0.06] rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-6 h-6 text-black/40" strokeWidth={1.5} />
          </div>
          <h2 className="font-heading text-2xl italic mb-3">
            {t.common.error}
          </h2>
          <p className="text-[13px] font-sans text-black/30 leading-relaxed mb-8">
            {isRTL
              ? "هذا الرابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد."
              : "This link is invalid or has expired. Please request a new one."
            }
          </p>
          <Link href="/forgot-password">
            <Button className="h-11 rounded-none font-sans text-[10px] tracking-luxury uppercase bg-black hover:bg-black/90 text-white px-8">
              {t.auth.sendResetLink}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80"
            alt=""
            className="w-full h-full object-cover opacity-30 grayscale"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="font-heading text-5xl italic mb-6">4 YOU</h1>
          <div className="w-12 h-[1px] bg-white/30 mb-6" />
          <p className="text-white/60 text-[15px] font-sans leading-relaxed max-w-sm">
            {isRTL
              ? "أنشئ كلمة مرور جديدة قوية لحماية حسابك."
              : "Create a strong new password to protect your account."
            }
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-12">
            <h1 className="font-heading text-3xl italic">4 YOU</h1>
          </div>

          {!success ? (
            <>
              <div className="mb-10">
                <h2 className="font-heading text-2xl italic mb-2">
                  {t.auth.newPassword}
                </h2>
                <p className="text-[13px] font-sans text-black/30 leading-relaxed">
                  {isRTL
                    ? "أدخل كلمة مرور جديدة لحسابك. يجب أن تكون 8 أحرف على الأقل."
                    : "Enter a new password for your account. Must be at least 8 characters."
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="password" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">
                    {t.auth.newPassword}
                  </Label>
                  <div className="relative">
                    <Lock className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/15`} strokeWidth={1.5} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t.auth.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"} h-11 rounded-none border-black/[0.08] text-[13px] font-sans focus:border-black/20 transition-all placeholder:text-black/15`}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${isRTL ? "left-3.5" : "right-3.5"} top-1/2 -translate-y-1/2 text-black/15 hover:text-black/40 transition-colors`}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-[2px] flex-1 transition-colors ${
                            password.length >= i * 3
                              ? password.length >= 12 ? "bg-black/60" : password.length >= 8 ? "bg-black/30" : "bg-black/15"
                              : "bg-black/[0.04]"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">
                    {t.auth.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Lock className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/15`} strokeWidth={1.5} />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder={t.auth.passwordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"} h-11 rounded-none border-black/[0.08] text-[13px] font-sans focus:border-black/20 transition-all placeholder:text-black/15`}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className={`absolute ${isRTL ? "left-3.5" : "right-3.5"} top-1/2 -translate-y-1/2 text-black/15 hover:text-black/40 transition-colors`}
                    >
                      {showConfirm ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] text-red-500/70 mt-1.5 font-sans">
                      {t.account.passwordsDoNotMatch}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={resetMutation.isPending || password !== confirmPassword}
                  className="w-full h-12 rounded-none font-sans text-[10px] tracking-luxury uppercase bg-black hover:bg-black/90 text-white transition-all duration-300 disabled:opacity-30"
                >
                  {resetMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border border-white/30 border-t-white animate-spin" />
                      {t.auth.resetting}
                    </span>
                  ) : (
                    t.auth.resetPasswordBtn
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 border border-black/[0.06] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-6 h-6 text-black/60" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-2xl italic mb-3">
                {t.auth.passwordResetSuccess}
              </h2>
              <p className="text-[13px] font-sans text-black/30 leading-relaxed mb-8 max-w-xs mx-auto">
                {isRTL
                  ? "تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة."
                  : "Your password has been changed successfully. You can now log in with your new password."
                }
              </p>
              <Link href="/login">
                <Button className="h-12 rounded-none font-sans text-[10px] tracking-luxury uppercase bg-black hover:bg-black/90 text-white px-12">
                  {t.auth.signIn}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
