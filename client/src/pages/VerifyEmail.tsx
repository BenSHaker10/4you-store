import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus("success");
      setTimeout(() => navigate("/"), 3000);
    },
    onError: (err) => {
      setStatus("error");
      setErrorMsg(err.message);
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setStatus("no-token");
      return;
    }
    setToken(t);
    verifyMutation.mutate({ token: t });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-10 text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-3xl font-light tracking-[6px] text-foreground">4 YOU</h1>
            <p className="text-xs text-muted-foreground tracking-[3px] mt-1">PREMIUM BEAUTY STORE</p>
          </div>

          {status === "loading" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">جاري التحقق...</h2>
              <p className="text-muted-foreground">يرجى الانتظار بينما نتحقق من بريدك الإلكتروني</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">تم التحقق بنجاح! 🎉</h2>
              <p className="text-muted-foreground">
                تم تأكيد بريدك الإلكتروني بنجاح. مرحباً بك في عائلة 4 YOU!
              </p>
              <p className="text-sm text-muted-foreground">سيتم تحويلك للصفحة الرئيسية خلال ثوانٍ...</p>
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded-full"
              >
                ابدأ التسوق الآن
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">فشل التحقق</h2>
              <p className="text-muted-foreground text-sm">{errorMsg}</p>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/register")}
                  className="flex-1 rounded-full"
                >
                  التسجيل مجدداً
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-full"
                >
                  الرئيسية
                </Button>
              </div>
            </div>
          )}

          {status === "no-token" && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">تحقق من بريدك الإلكتروني</h2>
              <p className="text-muted-foreground">
                لقد أرسلنا رابط التأكيد إلى بريدك الإلكتروني. يرجى فتح الرابط من البريد لتفعيل حسابك.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full rounded-full"
              >
                العودة للرئيسية
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
