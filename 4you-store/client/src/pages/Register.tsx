import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, User, Sparkles, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Register() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { t, isRTL } = useLanguage();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      if (data.requiresVerification) {
        toast.success(
          isRTL
            ? "تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتفعيل الحساب."
            : "Account created! Check your email to verify your account.",
          { duration: 6000 }
        );
        navigate("/verify-email");
      } else {
        toast.success(isRTL ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
        window.location.href = "/";
      }
    },
    onError: (err) => {
      toast.error(err.message || (isRTL ? "فشل في إنشاء الحساب" : "Registration failed"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول" : "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error(isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error(isRTL ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters");
      return;
    }
    registerMutation.mutate({ name, email, password, origin: window.location.origin });
  };

  const passwordChecks = [
    { label: isRTL ? "8 أحرف على الأقل" : "At least 8 characters", valid: password.length >= 8 },
    { label: isRTL ? "يحتوي رقم" : "Contains a number", valid: /\d/.test(password) },
    { label: isRTL ? "حرف كبير" : "Contains uppercase letter", valid: /[A-Z]/.test(password) },
  ];

  const benefits = isRTL
    ? ["شحن مجاني على أول طلب", "خصومات حصرية للأعضاء", "وصول مبكر للمنتجات الجديدة"]
    : ["Free shipping on first order", "Exclusive member discounts", "Early access to new arrivals"];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2a2a2a 100%)"
      }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-amber-500/30 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-amber-300/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-10 h-10 text-amber-400" />
            <h1 className="text-4xl font-serif font-bold tracking-wide">4 YOU</h1>
          </div>
          <h2 className="text-3xl font-serif mb-4 leading-tight">
            {isRTL ? (
              <>انضم إلى عالم<br /><span className="text-amber-400 italic">الجمال الفاخر</span></>
            ) : (
              <>Join the World of<br /><span className="text-amber-400 italic">Premium Beauty</span></>
            )}
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            {isRTL
              ? "أنشئ حسابك للوصول إلى مجموعات حصرية، تتبع طلباتك، واستمتع بتوصيات جمال مخصصة."
              : "Create your account to access exclusive collections, track orders, and enjoy personalized beauty recommendations."
            }
          </p>
          <div className="mt-10 space-y-4">
            {benefits.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Sparkles className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-serif font-bold">4 YOU</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>{t.auth.registerTitle}</h2>
            <p className="text-muted-foreground">{t.auth.registerSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">{t.checkout.fullName}</Label>
              <div className="relative">
                <User className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                <Input
                  id="name"
                  type="text"
                  placeholder={isRTL ? "اسمك الكامل" : "Your full name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${isRTL ? "pr-11" : "pl-11"} h-12 border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl bg-background`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">{t.checkout.email}</Label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                <Input
                  id="email"
                  type="email"
                  placeholder={isRTL ? "بريدك@email.com" : "your@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${isRTL ? "pr-11" : "pl-11"} h-12 border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl bg-background`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">{isRTL ? "كلمة المرور" : "Password"}</Label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRTL ? "أنشئ كلمة مرور قوية" : "Create a strong password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${isRTL ? "pr-11 pl-11" : "pl-11 pr-11"} h-12 border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl bg-background`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {password && (
                <div className="flex gap-3 mt-2">
                  {passwordChecks.map((check, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-full transition-colors ${check.valid ? "bg-green-500" : "bg-muted-foreground/30"}`} />
                      <span className={`text-xs transition-colors ${check.valid ? "text-green-600" : "text-muted-foreground"}`}>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">{isRTL ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={isRTL ? "أعد كتابة كلمة المرور" : "Confirm your password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`${isRTL ? "pr-11" : "pl-11"} h-12 border-border/50 focus:border-gold focus:ring-gold/20 rounded-xl bg-background`}
                  required
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match"}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background rounded-xl text-base font-medium transition-all duration-300 mt-2"
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRTL ? "جاري إنشاء الحساب..." : "Creating account..."}
                </span>
              ) : t.auth.registerTitle}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {t.auth.hasAccount}{" "}
              <Link href="/login" className="text-gold hover:text-gold/80 font-medium transition-colors">
                {t.auth.signIn}
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground/60">
              {isRTL
                ? "بإنشاء حساب، أنت توافق على شروط الخدمة وسياسة الخصوصية"
                : "By creating an account, you agree to our Terms of Service and Privacy Policy"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
