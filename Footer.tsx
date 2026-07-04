import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-blue text-white py-12 border-t border-blue-900" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand Info */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-white tracking-tight font-hindi">सहीभूमि</span>
            <span className="bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">1% Fee</span>
          </div>
          <p className="text-xs text-blue-200 leading-relaxed max-w-sm">
            {t("footer_tagline")}
          </p>
        </div>

        {/* Quick & Legal Links */}
        <div className="flex flex-col space-y-3">
          <h4 className="text-sm font-bold tracking-wider text-brand-orange uppercase">{t("footer_quick_links")}</h4>
          <ul className="space-y-2 text-xs text-blue-100 font-semibold">
            <li>
              <Link to="/search?type=khet" className="hover:text-brand-orange transition-colors">
                {t("nav_khet")}
              </Link>
            </li>
            <li>
              <Link to="/search?type=makan" className="hover:text-brand-orange transition-colors">
                {t("nav_makan")}
              </Link>
            </li>
            <li>
              <Link to="/search?type=plot" className="hover:text-brand-orange transition-colors">
                {t("nav_plot")}
              </Link>
            </li>
            <li>
              <Link to="/search?type=dukan" className="hover:text-brand-orange transition-colors">
                {t("nav_dukan")}
              </Link>
            </li>
            <li className="pt-2 text-blue-300 text-[11px] leading-relaxed">
              {t("footer_legal")}
            </li>
          </ul>
        </div>

        {/* Contact Coordinates */}
        <div className="flex flex-col space-y-3">
          <h4 className="text-sm font-bold tracking-wider text-brand-orange uppercase">संपर्क / Contact</h4>
          <p className="text-xs text-blue-100 leading-relaxed font-sans">
            {t("footer_contact")}
          </p>
          <div className="pt-2">
            <span className="inline-block bg-blue-900 text-brand-orange text-[10px] font-bold px-3 py-1 rounded-full uppercase">
              Budaun District UP
            </span>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-blue-900 flex flex-col sm:flex-row justify-between items-center text-xs text-blue-300">
        <p className="font-semibold">{t("footer_copy")}</p>
        <p className="mt-2 sm:mt-0 text-[10px] font-mono">Civil Lines, Budaun, Uttar Pradesh - 243601</p>
      </div>
    </footer>
  );
}
