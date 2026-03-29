import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t, isRTL } = useLanguage();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success(isRTL ? "مرحباً بعودتك" : "Welcome back");
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(err.message || (isRTL ? "بريد إلكتروني أو كلمة مرور غير صحيحة" : "Invalid email or password"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول" : "Please fill in all fields");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80"
            alt=""
            className="w-full h-full object-cover opacity-40 grayscale"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="font-heading text-5xl italic mb-6">4 YOU</h1>
          <div className="w-12 h-[1px] bg-white/30 mb-6" />
          <p className="text-white/60 text-[15px] font-sans leading-relaxed max-w-sm">
            {isRTL
              ? "اكتشف مجموعات مختارة بعناية من أرقى المنتجات، صُممت لمن يقدّرون الأناقة والجودة."
              : "Discover curated collections of the finest products, designed for those who appreciate elegance and quality."
            }
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-12">
            <h1 className="font-heading text-3xl italic">4 YOU</h1>
          </div>

          <div className="mb-10">
            <h2 className="font-heading text-2xl italic mb-2">{t.auth.loginTitle}</h2>
            <p className="text-[13px] font-sans text-black/30">{t.auth.loginSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{t.checkout.email}</Label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/15`} strokeWidth={1.5} />
                <Input
                  id="email"
                  type="email"
                  placeholder={isRTL ? "بريدك@email.com" : "your@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${isRTL ? "pr-10" : "pl-10"} h-11 rounded-none border-black/[0.08] text-[13px] font-sans focus:border-black/20 transition-all placeholder:text-black/15`}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">{isRTL ? "كلمة المرور" : "Password"}</Label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? "right-3.5" : "left-3.5"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black/15`} strokeWidth={1.5} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRTL ? "أدخل كلمة المرور" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${isRTL ? "pr-10 pl-10" : "pl-10 pr-10"} h-11 rounded-none border-black/[0.08] text-[13px] font-sans focus:border-black/20 transition-all placeholder:text-black/15`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? "left-3.5" : "right-3.5"} top-1/2 -translate-y-1/2 text-black/15 hover:text-black/40 transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[11px] font-sans text-black/30 hover:text-black/60 transition-colors underline underline-offset-4 decoration-black/10">
                {isRTL ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 rounded-none font-sans text-[10px] tracking-luxury uppercase bg-black hover:bg-black/90 text-white transition-all duration-300"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-white/30 border-t-white animate-spin" />
                  {isRTL ? "جاري تسجيل الدخول..." : "Signing in..."}
                </span>
              ) : t.auth.signIn}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[12px] font-sans text-black/30">
              {t.auth.noAccount}{" "}
              <Link href="/register" className="text-black hover:text-black/60 font-medium transition-colors underline underline-offset-4 decoration-black/15">
                {t.auth.signUp}
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-black/[0.04] text-center">
            <p className="text-[10px] font-sans text-black/15">
              {isRTL
                ? "بتسجيل الدخول، أنت توافق على شروط الخدمة وسياسة الخصوصية"
                : "By signing in, you agree to our Terms of Service and Privacy Policy"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
