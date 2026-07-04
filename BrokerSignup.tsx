import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertiesContext";
import { Shield, FileText, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export default function BrokerSignup() {
  const { lang, t } = useLanguage();
  const { login } = useAuth();
  const { showToast } = useProperties();
  const navigate = useNavigate();

  // Inputs state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("Civil Lines Budaun");

  // Scroll unlock terms states
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollTerms = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    // Check if scrolled near the bottom (within 10px)
    const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
    if (isBottom && !hasReadTerms) {
      setHasReadTerms(true);
      showToast("नियम पढ़ लिए गए हैं! अब आप बॉक्स को चेक कर सकते हैं।", "success");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      showToast("कृपया सभी आवश्यक फ़ील्ड भरें! / Please fill all required fields", "error");
      return;
    }
    if (!acceptedTerms) {
      showToast("कृपया आगे बढ़ने के लिए नियमों को स्वीकार करें! / Accept terms required", "error");
      return;
    }

    try {
      // Mock broker signup on backend or simply call authContext login with broker role
      await login(name, email, "broker", phone);
      showToast("ब्रोकर पार्टनरशिप सफलतापूर्वक दर्ज! राम राम जी।", "success");
      navigate("/");
    } catch (err) {
      showToast("त्रुटि हुई। / Registration failed.", "error");
    }
  };

  return (
    <div className="flex-1 bg-bg-secondary py-16 px-4 max-w-xl mx-auto flex flex-col justify-center" id="broker-signup-page">
      
      <div className="bg-white rounded-xl border border-gray-100 soft-shadow p-6 sm:p-8 space-y-6">
        
        {/* Title Heading */}
        <div className="text-center">
          <span className="inline-block bg-orange-100 text-brand-orange text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-3">
            साहिबभूमि पार्टनर / Broker Partnership
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-text-primary font-hindi tracking-tight">
            ब्रोकर रेफरल पार्टनरशिप
          </h2>
          <p className="text-[10px] text-text-muted font-bold uppercase mt-1">
            Referred Deals Commission Registration
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">पूरा नाम / Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="जैसे: अमित कुमार शर्मा (Amit Sharma)"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">ईमेल पता / Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@gmail.com"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">मोबाइल नंबर / Mobile Phone *</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="जैसे: 9876543210"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
              required
            />
          </div>

          {/* Region */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">कार्यक्षेत्र / Business Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange cursor-pointer"
            >
              <option value="Civil Lines Budaun">Civil Lines Budaun</option>
              <option value="Ujhani">Ujhani</option>
              <option value="Dataganj">Dataganj</option>
              <option value="Bisauli">Bisauli</option>
              <option value="Sahaswan">Sahaswan</option>
            </select>
          </div>

          {/* Referred Deals Agreement scroll container */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-bold text-brand-blue uppercase tracking-wider flex items-center gap-1">
              <FileText size={12} className="text-brand-orange" />
              <span>साझा सौदा अनुबंध (Referred Deals Partnership Agreement) *</span>
            </h4>

            {/* Scroll tracking box */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScrollTerms}
              className="h-32 overflow-y-auto border border-gray-200 p-3.5 rounded-lg bg-gray-50 text-[11px] leading-relaxed font-semibold font-hindi text-text-muted space-y-3"
            >
              <p className="text-brand-orange text-center font-bold pb-1 uppercase">
                ⚠️ नियम स्वीकार करने के लिए नीचे तक स्क्रॉल करें / Scroll to bottom to unlock
              </p>
              <p>
                १. साहिबभूमि पर रेफरल ब्रोकर के रूप में जुड़ने के लिए धन्यवाद। यहाँ कमीशन पारदर्शी १% के सिद्धांत पर काम करता है।
              </p>
              <p>
                २. आपके द्वारा लाए गए खरीदार या विक्रेता के सफल सौदा होने पर, कलेक्ट किए गए कमीशन का सीधे ५०% हिस्सा आपका होगा।
              </p>
              <p>
                ३. आप केवल वास्तविक मालिकों और वैध दस्तावेज़ों के साथ आने वाली संपत्तियों को ही सूचीबद्ध या रेफर करने के लिए सहमत हैं।
              </p>
              <p>
                ४. किसी भी प्रकार की धोखाधड़ी, जाली रजिस्ट्री दस्तावेज़ या असत्य जानकारी देने पर आपका कमीशन ज़ब्त और खाता हमेशा के लिए ब्लॉक कर दिया जाएगा।
              </p>
              <p>
                ५. बदायूँ जिले के सिविल लाइन्स, उझानी, दातागंज क्षेत्रों की कानूनी मर्यादा का पूर्ण सम्मान किया जाना चाहिए।
              </p>
              <p className="text-success-green text-center font-bold pt-2 select-none uppercase">
                🤝 अनुबंध की सभी शर्तें पूरी पढ़ी गईं। धन्यवाद!
              </p>
            </div>

            {/* Lock explanation */}
            {!hasReadTerms && (
              <p className="text-[9px] font-bold text-red-500 text-center animate-pulse">
                नियम स्वीकार करने के लिए कृपया अनुबंध को नीचे तक स्क्रॉल करें।
              </p>
            )}

            {/* Checkbox (Disabled if not scrolled completely) */}
            <label className={`flex items-start gap-2.5 p-2 rounded-lg border transition-colors select-none ${
              hasReadTerms ? "border-orange-200 bg-orange-50/20 cursor-pointer" : "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
            }`}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={() => setAcceptedTerms(!acceptedTerms)}
                disabled={!hasReadTerms}
                className="mt-0.5 w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="text-[11px] font-bold text-text-primary font-hindi leading-tight">
                मैं उपरोक्त ५०% रेफरल कमीशन अनुबंध और सभी नियमों को स्वीकार करता हूँ।
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!acceptedTerms}
            className="w-full py-3 bg-brand-orange text-white text-xs font-bold rounded-lg shadow-md hover:bg-opacity-95 disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer select-none border border-orange-400 transition-all uppercase"
          >
            Accept Agreement & Partner Register
          </button>

        </form>

        <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted font-bold select-none uppercase border-t border-gray-100 pt-4">
          <Shield size={14} className="text-success-green" />
          <span>सुरक्षित ५०-५०% शेयरिंग मॉडल / Secure Broker Partnership</span>
        </div>

      </div>

    </div>
  );
}
