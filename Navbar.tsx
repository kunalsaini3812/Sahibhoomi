import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Menu, X, Landmark, Home, Trees, ShoppingBag, User, Settings, LogOut, FileText, Download } from "lucide-react";

export default function Navbar() {
  const { lang, toggleLang, t } = useLanguage();
  const { currentUser, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  const handleCategoryClick = (category: string) => {
    setMobileMenuOpen(false);
    navigate(`/search?type=${category}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 soft-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex flex-col justify-center select-none" id="nav-logo">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold text-brand-blue tracking-tight font-hindi">सहीभूमि</span>
            <span className="bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">1% Fee</span>
          </div>
          <span className="text-xs font-semibold text-brand-orange tracking-wider mt-[-2px]">{t("logo_sub")}</span>
        </Link>

        {/* Desktop Category Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button
            onClick={() => handleCategoryClick("khet")}
            className="flex items-center gap-1.5 text-text-primary hover:text-brand-orange font-medium text-sm transition-colors cursor-pointer"
          >
            <Trees size={16} className="text-brand-blue" />
            <span>{t("nav_khet")}</span>
          </button>
          <button
            onClick={() => handleCategoryClick("makan")}
            className="flex items-center gap-1.5 text-text-primary hover:text-brand-orange font-medium text-sm transition-colors cursor-pointer"
          >
            <Home size={16} className="text-brand-blue" />
            <span>{t("nav_makan")}</span>
          </button>
          <button
            onClick={() => handleCategoryClick("plot")}
            className="flex items-center gap-1.5 text-text-primary hover:text-brand-orange font-medium text-sm transition-colors cursor-pointer"
          >
            <Landmark size={16} className="text-brand-blue" />
            <span>{t("nav_plot")}</span>
          </button>
          <button
            onClick={() => handleCategoryClick("dukan")}
            className="flex items-center gap-1.5 text-text-primary hover:text-brand-orange font-medium text-sm transition-colors cursor-pointer"
          >
            <ShoppingBag size={16} className="text-brand-blue" />
            <span>{t("nav_dukan")}</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          
          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-text-primary hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer"
            id="lang-toggle"
          >
            <span className={lang === "hi" ? "text-brand-orange font-bold font-hindi" : "text-gray-400 font-medium"}>हिन्दी</span>
            <span className="text-gray-300">|</span>
            <span className={lang === "en" ? "text-brand-orange font-bold" : "text-gray-400 font-medium"}>English</span>
          </button>

          {/* Download Code Button */}
          <a
            href="/api/download-project"
            download="sahibhoomi-project.zip"
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all soft-shadow duration-200 select-none flex items-center gap-1.5 cursor-pointer"
            id="download-project-btn"
            title="Download full project code as ZIP"
          >
            <Download size={14} />
            <span>{lang === "hi" ? "कोड डाउनलोड" : "Download Code"}</span>
          </a>

          {/* List Property (Requires Seller or Admin/Broker, redirect to Login if not logged in) */}
          <Link
            to={isLoggedIn ? "/post-property" : "/auth"}
            className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-lg hover:bg-opacity-90 transition-all soft-shadow duration-200 select-none cursor-pointer"
            id="list-property-btn"
          >
            {t("nav_post_property")}
          </Link>

          {/* User Auth Info */}
          {isLoggedIn && currentUser ? (
            <div className="flex items-center space-x-2 relative group">
              <Link
                to={currentUser.role === "admin" ? "/admin" : `/profile/${currentUser.id}`}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.role === "admin" ? "AD" : (currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U")}
                </div>
                <span className="text-xs font-semibold text-text-primary truncate max-w-[100px]">{currentUser.name}</span>
              </Link>

              {/* Dropdown menu */}
              <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 z-50 p-1">
                {currentUser.role === "admin" ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-primary hover:bg-gray-50 rounded-md"
                  >
                    <Settings size={14} className="text-brand-blue" />
                    <span>{t("nav_admin")}</span>
                  </Link>
                ) : (
                  <Link
                    to={`/profile/${currentUser.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-text-primary hover:bg-gray-50 rounded-md"
                  >
                    <User size={14} className="text-brand-blue" />
                    <span>{t("nav_profile")}</span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>{t("nav_logout")}</span>
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg hover:bg-opacity-90 transition-all soft-shadow duration-200 select-none cursor-pointer"
              id="login-btn"
            >
              {t("nav_login")}
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Mobile Lang */}
          <button
            onClick={toggleLang}
            className="px-2 py-1 border border-gray-200 rounded-md text-[10px] font-bold text-text-primary cursor-pointer"
          >
            {lang === "hi" ? "EN" : "हिन्दी"}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-text-primary hover:bg-gray-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 flex flex-col shadow-inner">
          <button
            onClick={() => handleCategoryClick("khet")}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 font-semibold text-sm text-text-primary cursor-pointer"
          >
            <Trees size={18} className="text-brand-blue" />
            <span>{t("nav_khet")}</span>
          </button>
          <button
            onClick={() => handleCategoryClick("makan")}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 font-semibold text-sm text-text-primary cursor-pointer"
          >
            <Home size={18} className="text-brand-blue" />
            <span>{t("nav_makan")}</span>
          </button>
          <button
            onClick={() => handleCategoryClick("plot")}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 font-semibold text-sm text-text-primary cursor-pointer"
          >
            <Landmark size={18} className="text-brand-blue" />
            <span>{t("nav_plot")}</span>
          </button>
          <button
            onClick={() => handleCategoryClick("dukan")}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 font-semibold text-sm text-text-primary cursor-pointer"
          >
            <ShoppingBag size={18} className="text-brand-blue" />
            <span>{t("nav_dukan")}</span>
          </button>

          <hr className="border-gray-100" />

          {/* List Property Mobile Button */}
          <Link
            to={isLoggedIn ? "/post-property" : "/auth"}
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2.5 bg-brand-orange text-white font-bold text-sm rounded-lg block cursor-pointer"
          >
            {t("nav_post_property")}
          </Link>

          {/* Download Code Mobile Button */}
          <a
            href="/api/download-project"
            download="sahibhoomi-project.zip"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full text-center py-2.5 bg-green-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={16} />
            <span>{lang === "hi" ? "पूरा कोड डाउनलोड करें (ZIP)" : "Download Code (ZIP)"}</span>
          </a>

          {isLoggedIn && currentUser ? (
            <>
              {currentUser.role === "admin" ? (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-brand-blue text-white font-bold text-sm rounded-lg block cursor-pointer"
                >
                  {t("nav_admin")}
                </Link>
              ) : (
                <Link
                  to={`/profile/${currentUser.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-brand-blue text-white font-bold text-sm rounded-lg block cursor-pointer"
                >
                  {t("nav_profile")} ({currentUser.name})
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full py-2.5 border border-red-200 text-red-600 font-bold text-sm rounded-lg block cursor-pointer"
              >
                {t("nav_logout")}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-brand-blue text-white font-bold text-sm rounded-lg block cursor-pointer"
            >
              {t("nav_login")}
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
