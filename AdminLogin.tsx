import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertiesContext";
import { Shield, Lock, User, AlertCircle, Clock } from "lucide-react";

export default function AdminLogin() {
  const { lang, t } = useLanguage();
  const { adminLogin, isLoggedIn, currentUser } = useAuth();
  const { showToast } = useProperties();
  const navigate = useNavigate();

  // Form input fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Lockout states
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  useEffect(() => {
    // Check if user is already logged in as admin
    if (isLoggedIn && currentUser?.role === "admin") {
      navigate("/admin");
    }

    // Check localStorage lockout status
    const lockoutTimestamp = localStorage.getItem("sahibhoomi_admin_lockout");
    if (lockoutTimestamp) {
      const remainingMs = parseInt(lockoutTimestamp) - Date.now();
      if (remainingMs > 0) {
        setLockoutTimeLeft(Math.ceil(remainingMs / 1000));
      } else {
        localStorage.removeItem("sahibhoomi_admin_lockout");
        localStorage.removeItem("sahibhoomi_admin_failed");
      }
    }
  }, [isLoggedIn, currentUser, navigate]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimeLeft > 0) {
      const interval = setInterval(() => {
        setLockoutTimeLeft((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("sahibhoomi_admin_lockout");
            localStorage.removeItem("sahibhoomi_admin_failed");
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimeLeft]);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) {
      showToast(`सिस्टम लॉक है! कृपया ${Math.ceil(lockoutTimeLeft / 60)} मिनट प्रतीक्षा करें।`, "error");
      return;
    }

    if (!username.trim() || !password.trim()) {
      showToast("कृपया सभी क्रेडेंशियल भरें! / Credentials required", "error");
      return;
    }

    setLoading(true);

    // Simulated verification against designated credentials:
    // Username: "sahibhoomi_admin"
    // Password: "Admin@SahibHoomi2025#"
    const targetUser = "sahibhoomi_admin";
    const targetPass = "Admin@SahibHoomi2025#";

    try {
      if (username === targetUser && password === targetPass) {
        // Success
        localStorage.removeItem("sahibhoomi_admin_failed");
        localStorage.removeItem("sahibhoomi_admin_lockout");
        
        await adminLogin(username);
        showToast("एडमिन लॉगिन सफल! आपका स्वागत है। / Admin access granted.", "success");
        navigate("/admin");
      } else {
        // Failed attempt, increase counter
        const currentFailed = parseInt(localStorage.getItem("sahibhoomi_admin_failed") || "0") + 1;
        localStorage.setItem("sahibhoomi_admin_failed", currentFailed.toString());

        if (currentFailed >= 5) {
          // Lockout for 30 minutes (1800000 ms)
          const lockoutTime = Date.now() + 1800000;
          localStorage.setItem("sahibhoomi_admin_lockout", lockoutTime.toString());
          setLockoutTimeLeft(1800);
          showToast("सुरक्षा उल्लंघन! लगातार ५ असफल प्रयासों के बाद खाता ३० मिनट के लिए लॉक कर दिया गया है।", "error");
        } else {
          showToast(`गलत क्रेडेंशियल! आपके पास ${5 - currentFailed} प्रयास शेष हैं।`, "error");
        }
      }
    } catch (err) {
      showToast("प्रवेश विफलता। / Database validation failure.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-brand-blue py-16 px-4 flex flex-col justify-center min-h-[calc(100vh-140px)]" id="admin-login-page">
      
      {/* Centered Panel */}
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl soft-shadow p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center mb-3">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold font-hindi text-text-primary">प्रशासनिक लॉगिन पैनल</h2>
          <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
            Sahibhoomi Core System Panel
          </p>
        </div>

        {/* Lockout Screen */}
        {lockoutTimeLeft > 0 ? (
          <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-center space-y-3 animate-pulse">
            <Clock size={32} className="text-red-500 mx-auto" />
            <h4 className="font-extrabold text-sm text-red-700 font-hindi">सिस्टम सुरक्षा लॉक</h4>
            <p className="text-xs text-red-600 font-semibold leading-relaxed">
              लगातार ५ गलत पासवर्ड दर्ज करने के कारण इस आईपी/ब्राउज़र को ३० मिनट के लिए ब्लॉक कर दिया गया है।
            </p>
            <div className="text-lg font-extrabold text-red-700 font-mono">
              {Math.floor(lockoutTimeLeft / 60)}:{(lockoutTimeLeft % 60).toString().padStart(2, "0")}
            </div>
          </div>
        ) : (
          /* Normal Inputs Form */
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            
            {/* Username */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">एडमिन यूजरनेम / Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="sahibhoomi_admin"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">सुरक्षित पासवर्ड / Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-orange text-white text-xs font-bold rounded-lg shadow-md hover:bg-opacity-95 disabled:bg-gray-200 cursor-pointer border border-orange-400 uppercase font-sans"
            >
              {loading ? "सत्यापन चल रहा है..." : "प्रवेश करें / Login Administrative"}
            </button>

          </form>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[9px] text-text-muted font-bold select-none uppercase border-t border-gray-100 pt-4">
          <AlertCircle size={12} className="text-brand-orange animate-bounce" />
          <span>सुरक्षित एसएसएल निगरानी सक्रिय है</span>
        </div>

      </div>

    </div>
  );
}
