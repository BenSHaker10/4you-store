import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { isRTL } = useLanguage();

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setSent(true);
    },
    onError: (err) => {
      toast.error(err.message || (isRTL ? "حدث خطأ، حاول مرة أخرى" : "An error occurred, please try again"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(isRTL ? "يرجى إدخال بريدك الإلكتروني" : "Please enter your email");
      return;
    }
    forgotMutation.mutate({ email, origin: window.location.origin });
  };

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
              ? "حسابك آمن معنا. سنساعدك في استعادة الوصول إلى حسابك بسهولة."
              : "Your account is safe with us. We'll help you regain access easily."
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

          {!sent ? (
            <>
              <div className="mb-10">
                <h2 className="font-heading text-2xl italic mb-2">
                  {isRTL ? "نسيت كلمة المرور؟" : "Forgot Password?"}
                </h2>
                <p className="text-[13px] font-sans text-black/30 leading-relaxed">
                  {isRTL
                    ? "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."
                    : "Enter your email and we'll send you a link to reset your password."
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email" className="text-[9px] font-sans tracking-luxury uppercase text-black/30 mb-2 block">
                    {isRTL ? "البريد الإلكتروني" : "Email Address"}
                  </Label>
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

                <Button
                  type="submit"
                  disabled={forgotMutation.isPending}
                  className="w-full h-12 rounded-none font-sans text-[10px] tracking-luxury uppercase bg-black hover:bg-black/90 text-white transition-all duration-300"
                >
                  {forgotMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border border-white/30 border-t-white animate-spin" />
                      {isRTL ? "جاري الإرسال..." : "Sending..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isRTL ? "إرسال رابط الاستعادة" : "Send Reset Link"}
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-[12px] font-sans text-black/30 hover:text-black/60 transition-colors underline underline-offset-4 decoration-black/10">
                  {isRTL ? "العودة لتسجيل الدخول" : "Back to Login"}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 border border-black/[0.06] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-6 h-6 text-black/60" strokeWidth={1.5} />
              </div>
              <h2 className="font-heading text-2xl italic mb-3">
                {isRTL ? "تم الإرسال" : "Email Sent"}
              </h2>
              <p className="text-[13px] font-sans text-black/30 leading-relaxed mb-8 max-w-xs mx-auto">
                {isRTL
                  ? "إذا كان هذا البريد مسجلاً لدينا، ستتلقى رابطاً لإعادة تعيين كلمة المرور خلال دقائق. تحقق من صندوق الوارد والبريد المزعج."
                  : "If this email is registered, you'll receive a password reset link within minutes. Check your inbox and spam folder."
                }
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => { setSent(false); setEmail(""); }}
                  variant="outline"
                  className="w-full h-11 rounded-none font-sans text-[10px] tracking-luxury uppercase border-black/[0.08] hover:bg-black/[0.02] transition-all"
                >
                  {isRTL ? "إرسال مرة أخرى" : "Send Again"}
                </Button>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full h-11 rounded-none font-sans text-[10px] tracking-luxury uppercase text-black/40 hover:text-black/60 transition-all"
                  >
                    {isRTL ? "العودة لتسجيل الدخول" : "Back to Login"}
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
