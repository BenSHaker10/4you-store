import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem("pwa-install-dismissed");
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed);
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true);
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if running as standalone (already installed)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowBanner(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed silently
      });
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:hidden animate-in slide-in-from-bottom duration-500">
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2520] rounded-2xl p-4 shadow-2xl border border-[#C4A24E]/30">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/50 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C4A24E] to-[#8B6914] flex items-center justify-center flex-shrink-0 shadow-lg">
            <Smartphone className="text-white" size={24} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-sm">
              حمّل تطبيق 4 YOU
            </h3>
            <p className="text-white/60 text-xs mt-0.5">
              تجربة تسوق أسرع وأسهل مع الإشعارات
            </p>
          </div>

          <button
            onClick={handleInstall}
            className="bg-gradient-to-r from-[#C4A24E] to-[#8B6914] text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 flex-shrink-0 hover:opacity-90 transition-opacity shadow-lg"
          >
            <Download size={16} />
            تثبيت
          </button>
        </div>
      </div>
    </div>
  );
}
