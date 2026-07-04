import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Trees, User, ShoppingCart, UserCheck, Shield } from "lucide-react";

export default function AuthLanding() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-bg-secondary py-16 px-4 max-w-4xl mx-auto flex flex-col items-center justify-center text-center" id="auth-landing-page">
      
      {/* Brand logo display */}
      <div className="flex items-center gap-1.5 bg-orange-50 px-4 py-2 rounded-full border border-orange-100 mb-6">
        <span className="text-xl font-bold text-brand-blue font-hindi">सहीभूमि</span>
        <span className="bg-brand-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">1% Flat</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-hindi tracking-tight leading-snug mb-3">
        {lang === "hi" ? "साहिबभूमि पोर्टल में आपका स्वागत है" : "Welcome to Sahibhoomi Portal"}
      </h1>
      <p className="text-xs sm:text-sm text-text-muted font-bold mb-10 max-w-md font-hindi leading-relaxed">
        {lang === "hi" 
          ? "बदायूँ की पहली १% फ्लैट कमीशन सुरक्षित प्रॉपर्टी वेबसाइट। कृपया अपनी भूमिका चुनें:"
          : "Budaun's premier 1% transparent commission web platform. Choose your role to continue:"}
      </p>

      {/* Grid selector options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-8">
        
        {/* Buyer Option Card */}
        <div
          onClick={() => navigate("/auth/buyer")}
          className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:border-brand-orange hover:shadow-md cursor-pointer transition-all flex flex-col items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue group-hover:bg-orange-50 group-hover:text-brand-orange flex items-center justify-center transition-colors">
            <ShoppingCart size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-text-primary font-hindi leading-snug">मैं खरीदार हूँ</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Buyer Login</p>
          </div>
          <p className="text-[10px] text-text-muted font-medium font-hindi leading-relaxed">
            {lang === "hi" ? "खेत, प्लॉट या मकान खरीदने के लिए मुफ़्त लॉगिन करें।" : "Browse farmlands, houses, or plots with flat 1% commission."}
          </p>
        </div>

        {/* Seller Option Card */}
        <div
          onClick={() => navigate("/auth/seller")}
          className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:border-brand-orange hover:shadow-md cursor-pointer transition-all flex flex-col items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue group-hover:bg-orange-50 group-hover:text-brand-orange flex items-center justify-center transition-colors">
            <Trees size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-text-primary font-hindi leading-snug">मैं विक्रेता हूँ</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Seller Login</p>
          </div>
          <p className="text-[10px] text-text-muted font-medium font-hindi leading-relaxed">
            {lang === "hi" ? "अपनी प्रॉपर्टी मुफ़्त में सूचीबद्ध करें और जल्दी बेचें।" : "List your properties directly. Speak to genuine buyers."}
          </p>
        </div>

        {/* Broker Option Card */}
        <div
          onClick={() => navigate("/auth/broker")}
          className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:border-brand-orange hover:shadow-md cursor-pointer transition-all flex flex-col items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue group-hover:bg-orange-50 group-hover:text-brand-orange flex items-center justify-center transition-colors">
            <UserCheck size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-text-primary font-hindi leading-snug">मैं ब्रोकर/डीलर हूँ</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Broker Signup</p>
          </div>
          <p className="text-[10px] text-text-muted font-medium font-hindi leading-relaxed">
            {lang === "hi" ? "सौदा रेफर करें और हर डील पर सीधे ५०% कमीशन कमाएं।" : "Refer deals on Sahibhoomi. Unlock transparent commission splits."}
          </p>
        </div>

      </div>

      {/* Admin Login Portal Link */}
      <Link 
        to="/admin/login" 
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-muted hover:text-brand-blue uppercase transition-colors select-none"
      >
        <Shield size={12} />
        <span>प्रशासनिक प्रवेश / Admin Login Portal →</span>
      </Link>

    </div>
  );
}
