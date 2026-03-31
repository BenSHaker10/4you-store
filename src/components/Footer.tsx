import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="text-2xl font-bold tracking-tighter">4 YOU</Link>
            <p className="text-white/60 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t("footer.quickLinks")}</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link to="/" className="hover:text-white transition-colors">{t("footer.home")}</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">{t("footer.products")}</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">{t("footer.about")}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t("footer.customerService")}</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li><Link to="/shipping" className="hover:text-white transition-colors">{t("footer.shippingPolicy")}</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">{t("footer.returnPolicy")}</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">{t("footer.privacyPolicy")}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t("footer.contactUs")}</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li>{t("footer.email")}</li>
              <li dir="ltr" className="text-right md:text-left">{t("footer.phone")}</li>
              <li>{t("footer.address")}</li>
            </ul>
          </div>
        </div>

        {/* Legal Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-white/40">
              <span>{t("footer.commercialRegister")}</span>
              <span className="hidden md:inline">|</span>
              <span>{t("footer.vatNumber")}</span>
            </div>
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} 4 YOU. {t("footer.rights")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
