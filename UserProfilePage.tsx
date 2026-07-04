import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertiesContext";
import PropertyCard from "../components/PropertyCard";
import { User, LogOut, Heart, FileText, Landmark, Users, CreditCard, Clock, AlertCircle } from "lucide-react";

export default function UserProfilePage() {
  const { lang, t } = useLanguage();
  const { currentUser, logout, isLoggedIn } = useAuth();
  const { listings, savedProperties, formatPrice } = useProperties();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  // Redirect if not logged in
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" id="profile-unauthorized">
        <AlertCircle size={40} className="text-brand-orange animate-bounce mb-3" />
        <h3 className="font-extrabold text-base text-text-primary font-hindi">कृपया पहले लॉगिन करें</h3>
        <p className="text-xs text-text-muted mt-1 mb-6">Unauthorized access to user profile dashboard.</p>
        <Link to="/auth" className="px-5 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-lg shadow">
          लॉगिन करें / Log In
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // 1. Get properties bookmarked by user
  const bookmarkedProperties = listings.filter((p) => savedProperties.includes(p.id));

  // 2. Get properties posted by user (if seller)
  const myProperties = listings.filter(
    (p) => p.seller.email.toLowerCase() === currentUser.email.toLowerCase()
  );

  // Mock Broker Dashboard data
  const referredDeals = [
    {
      id: "deal_1",
      propertyTitle: "उझानी कछार रोड २ बीघा उपजाऊ खेती खेत",
      buyerName: "रमेश कुमार (Ramesh Kumar)",
      propertyPrice: 2000000, // 20 Lakh
      totalPlatformFee: 20000, // 1% commission
      brokerShare: 10000, // 50% split
      payoutStatus: "Paid",
      date: "2025-05-14"
    },
    {
      id: "deal_2",
      propertyTitle: "दातागंज मेन मार्केट पक्की दुकान",
      buyerName: "रविंद्र सिंह (Ravindra Singh)",
      propertyPrice: 1500000, // 15 Lakh
      totalPlatformFee: 15000,
      brokerShare: 7500,
      payoutStatus: "Processing",
      date: "2025-06-21"
    },
    {
      id: "deal_3",
      propertyTitle: "सिविल लाइंस बदायूँ ३ बीएचके शानदार मकान",
      buyerName: "सुनील पाठक (Sunil Pathak)",
      propertyPrice: 4500000, // 45 Lakh
      totalPlatformFee: 45000,
      brokerShare: 22500,
      payoutStatus: "Unpaid",
      date: "2025-06-28"
    }
  ];

  // Total broker earnings
  const totalEarned = referredDeals
    .filter((d) => d.payoutStatus === "Paid")
    .reduce((sum, d) => sum + d.brokerShare, 0);

  const totalProcessing = referredDeals
    .filter((d) => d.payoutStatus === "Processing" || d.payoutStatus === "Unpaid")
    .reduce((sum, d) => sum + d.brokerShare, 0);

  return (
    <div className="flex-1 bg-bg-secondary py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8" id="profile-page">
      
      {/* Primary Grid Layout: Profile Sidebar (1 column) + Content Panel (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Profile Sidebar (1 Column) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 soft-shadow flex flex-col items-center text-center">
          
          <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center font-extrabold text-lg select-none mb-4 uppercase shadow">
            {currentUser.name ? currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
          </div>

          <h2 className="font-extrabold text-base text-text-primary font-hindi truncate max-w-full leading-tight">
            {currentUser.name}
          </h2>
          
          <p className="text-[10px] bg-blue-50 text-brand-blue px-3 py-1 rounded-full font-bold uppercase mt-2 select-none tracking-wider">
            {currentUser.role === "broker" ? (lang === "hi" ? "ब्रोकर पार्टनर / Partner" : "Broker Partner") : currentUser.role}
          </p>

          <div className="w-full border-t border-gray-100 my-5 pt-4 space-y-3.5 text-left text-xs font-semibold text-text-muted">
            <p className="truncate"><span className="text-[10px] font-bold text-brand-blue block uppercase">Gmail Email</span>{currentUser.email}</p>
            {currentUser.phone && <p><span className="text-[10px] font-bold text-brand-blue block uppercase">Mobile Phone</span>{currentUser.phone}</p>}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full mt-auto py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>{t("nav_logout")}</span>
          </button>

        </div>

        {/* Content Panel (3 Columns) */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* SPECIAL SECTION: Broker Dashboard */}
          {currentUser.role === "broker" && (
            <div className="space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-gray-100 soft-shadow">
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-base text-text-primary font-hindi">
                    ब्रोकर पार्टनर डैशबोर्ड (Broker Affiliate Dashboard)
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">Referred Deals & Payout Trackings</p>
                </div>
                
                <span className="bg-orange-50 border border-orange-100 text-brand-orange text-[10px] font-extrabold px-3.5 py-1.5 rounded-full select-none uppercase">
                  🤝 50% commission split active
                </span>
              </div>

              {/* Stats overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl">
                  <span className="text-[10px] text-success-green block font-bold uppercase mb-1">कुल प्राप्त कमीशन / Paid Out</span>
                  <span className="text-lg font-extrabold text-success-green font-sans">{formatPrice(totalEarned)}</span>
                </div>
                <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl">
                  <span className="text-[10px] text-brand-orange block font-bold uppercase mb-1">प्रक्रिया में / Processing</span>
                  <span className="text-lg font-extrabold text-brand-orange font-sans">{formatPrice(totalProcessing)}</span>
                </div>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <span className="text-[10px] text-brand-blue block font-bold uppercase mb-1">कुल सौदे रेफर / Referred Deals</span>
                  <span className="text-lg font-extrabold text-brand-blue font-sans">{referredDeals.length}</span>
                </div>
              </div>

              {/* Referred Deals Table */}
              <div className="space-y-3 pt-3">
                <h4 className="font-extrabold text-xs text-brand-blue font-hindi uppercase tracking-wider">
                  रेफर किए गए सौदों की सूची (Referred Deals History):
                </h4>

                <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-brand-blue uppercase text-[10px] font-extrabold">
                        <th className="p-4">सौदा विवरण / Property</th>
                        <th className="p-4">खरीदार / Buyer</th>
                        <th className="p-4">सौदा राशि / Deal Value</th>
                        <th className="p-4">कमीशन (५०%) / My Share</th>
                        <th className="p-4">स्थिति / Payout Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-text-primary">
                      {referredDeals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-gray-50/50">
                          <td className="p-4 font-hindi truncate max-w-[200px]">{deal.propertyTitle}</td>
                          <td className="p-4 truncate">{deal.buyerName}</td>
                          <td className="p-4 font-sans">{formatPrice(deal.propertyPrice)}</td>
                          <td className="p-4 font-sans text-brand-orange font-extrabold">{formatPrice(deal.brokerShare)}</td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-[9px] font-bold uppercase ${
                              deal.payoutStatus === "Paid" ? "bg-green-100 text-success-green" :
                              deal.payoutStatus === "Processing" ? "bg-orange-100 text-brand-orange" : "bg-gray-100 text-text-muted"
                            }`}>
                              {deal.payoutStatus === "Paid" ? "Paid" :
                               deal.payoutStatus === "Processing" ? "Processing" : "Unpaid"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* SECTION: My Listed Properties (For Sellers) */}
          {currentUser.role === "seller" && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-text-primary font-hindi border-l-4 border-brand-orange pl-3">
                मेरे द्वारा सूचीबद्ध संपत्तियां (My Listed Properties):
              </h3>

              {myProperties.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center soft-shadow">
                  <span className="text-3xl">🏠</span>
                  <h4 className="font-extrabold text-sm text-text-primary font-hindi mt-3 mb-1">
                    कोई संपत्ति सूचीबद्ध नहीं है
                  </h4>
                  <p className="text-[11px] text-text-muted mb-4 font-semibold">List property today to reach hundreds of Budaun buyers.</p>
                  <Link to="/post-property" className="px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-lg shadow cursor-pointer">
                    संपत्ति पोस्ट करें / Post Now
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {myProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION: Saved / Bookmarked properties */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-text-primary font-hindi border-l-4 border-brand-orange pl-3 flex items-center gap-1.5 select-none">
              <Heart size={18} className="text-red-500 fill-red-500" />
              <span>{t("saved_title")} ({bookmarkedProperties.length})</span>
            </h3>

            {bookmarkedProperties.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center soft-shadow">
                <span className="text-3xl">❤️</span>
                <h4 className="font-extrabold text-sm text-text-primary font-hindi mt-3 mb-1">
                  {lang === "hi" ? "कोई सहेजी गई संपत्ति नहीं है" : "No saved properties yet"}
                </h4>
                <p className="text-[11px] text-text-muted font-semibold">Click heart icons on property cards to save them here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {bookmarkedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
