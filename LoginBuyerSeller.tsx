import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertiesContext";
import { Mail, Phone, User, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export default function LoginBuyerSeller() {
  const { lang, t } = useLanguage();
  const { login, sendEmailOtp, verifyEmailOtp } = useAuth();
  const { showToast } = useProperties();
  const navigate = useNavigate();
  const location = useLocation();

  // Deduce role from route: /auth/buyer -> "buyer", /auth/seller -> "seller"
  const isSeller = location.pathname.includes("seller");
  const activeRole = isSeller ? "seller" : "buyer";

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // Phase state: "input_details" | "enter_otp"
  const [phase, setPhase] = useState<"input_details" | "enter_otp">("input_details");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast("कृपया अपना नाम और ईमेल पता दर्ज करें! / Missing fields", "error");
      return;
    }

    setLoading(true);
    try {
      const success = await sendEmailOtp(email);
      if (success) {
        setPhase("enter_otp");
        showToast("ओटीपी भेजा गया! परीक्षण के लिए '1234' का उपयोग करें। / OTP sent! Use '1234'.", "info");
      } else {
        showToast("ओटीपी भेजने में असमर्थ। पुनः प्रयास करें।", "error");
      }
    } catch (err) {
      showToast("नेटवर्क त्रुटि। / Communication error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      showToast("ओटीपी कोड आवश्यक है! / OTP is required", "error");
      return;
    }

    setLoading(true);
    try {
      const success = await verifyEmailOtp(email, otpCode);
      if (success) {
        // Complete the auth login flow
        await login(name, email, activeRole, phone || undefined);
        showToast(lang === "hi" ? "सफलतापूर्वक लॉगिन किया गया! राम राम जी।" : "Login successful! Ram Ram.", "success");
        navigate("/");
      } else {
        showToast("गलत ओटीपी! कृपया '1234' दर्ज करें। / Invalid OTP.", "error");
      }
    } catch (err) {
      showToast("त्रुटि हुई। / Verification failure.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-bg-secondary py-16 px-4 max-w-md mx-auto flex flex-col justify-center" id="buyer-seller-login-page">
      
      {/* Container Card */}
      <div className="bg-white rounded-xl border border-gray-100 soft-shadow p-6 sm:p-8 space-y-6">
        
        {/* Header Title */}
        <div className="text-center">
          <span className="inline-block bg-orange-100 text-brand-orange text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-3">
            {activeRole === "seller" ? (lang === "hi" ? "विक्रेता प्रवेश / Seller" : "Seller Portal") : (lang === "hi" ? "खरीदार प्रवेश / Buyer" : "Buyer Portal")}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary font-hindi tracking-tight">
            जीमेल ईमेल ओटीपी लॉगिन
          </h2>
          <p className="text-[10px] text-text-muted font-bold uppercase mt-1">
            Secure Gmail Access
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50/50 border border-blue-50 p-4 rounded-xl space-y-1">
          <p className="text-xs font-bold text-brand-blue flex items-center gap-1">
            <Sparkles size={14} className="text-brand-orange animate-pulse" />
            <span>परीक्षण जानकारी / Testing details:</span>
          </p>
          <p className="text-[11px] text-text-muted font-semibold leading-relaxed">
            {lang === "hi" 
              ? "आप कोई भी ईमेल दर्ज कर सकते हैं। सत्यापन कोड '1234' है।" 
              : "Enter any testing email address. The demo OTP is '1234'."}
          </p>
        </div>

        {/* Phase 1: Name, Email & Optional Phone Inputs */}
        {phase === "input_details" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">अपना नाम / Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="जैसे: राजेश कुमार (Rajesh Kumar)"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">जीमेल पता / Gmail Address *</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
                  required
                />
              </div>
            </div>

            {/* Optional Phone Input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">
                मोबाइल नंबर / Phone Number <span className="text-text-muted text-[9px]">(Optional)</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="जैसे: 9876543210"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
                />
              </div>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-orange text-white text-xs font-bold rounded-lg shadow-md hover:bg-opacity-95 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer select-none border border-orange-400"
            >
              {loading ? "ओटीपी भेज रहे हैं..." : "वेरिफिकेशन कोड भेजें / Send Verification Code"}
            </button>

          </form>
        ) : (
          /* Phase 2: OTP Verification Input */
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
            
            <div className="space-y-1 text-center">
              <label className="block text-xs font-bold text-brand-blue font-hindi mb-2">
                हमने आपके ईमेल ({email}) पर ४ अंकों का ओटीपी भेजा है:
              </label>
              
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="4-digit OTP"
                className="w-32 mx-auto text-center px-4 py-3 bg-gray-50 border-2 border-brand-orange rounded-xl text-lg font-extrabold tracking-widest text-brand-orange focus:outline-none focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-blue text-white text-xs font-bold rounded-lg shadow-md hover:bg-opacity-95 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer select-none"
            >
              {loading ? "सत्यापित कर रहे हैं..." : "सत्यापित करें / Verify & Log In"}
            </button>

            <button
              type="button"
              onClick={() => setPhase("input_details")}
              className="w-full text-center text-[10px] font-bold text-text-muted hover:text-brand-orange transition-colors uppercase tracking-wider cursor-pointer"
            >
              ← ईमेल बदलें / Change Email Address
            </button>

          </form>
        )}

        <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted font-bold select-none uppercase border-t border-gray-100 pt-4">
          <ShieldCheck size={14} className="text-success-green" />
          <span>सुरक्षित १% पारदर्शी प्लेटफॉर्म / Verified Sahibhoomi</span>
        </div>

      </div>

    </div>
  );
}
