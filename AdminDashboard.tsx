import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useProperties } from "../context/PropertiesContext";
import { Property, ChatRoom } from "../types";
import { Shield, Trees, Users, UserCheck, AlertTriangle, MessageSquare, Check, ShieldAlert, X, ShieldCheck, Eye, Trash2, Edit3, Landmark, DollarSign, ListFilter } from "lucide-react";

export default function AdminDashboard() {
  const { lang, t } = useLanguage();
  const { currentUser, isLoggedIn, adminLogout } = useAuth();
  const { listings, deleteProperty, fetchListings, showToast, formatPrice } = useProperties();
  const navigate = useNavigate();

  // Redirect if not admin
  if (!isLoggedIn || !currentUser || currentUser.role !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }

  // Active sub-tab state: "properties" | "users" | "brokers" | "reports" | "chats"
  const [activeTab, setActiveTab] = useState<"properties" | "users" | "brokers" | "reports" | "chats">("properties");

  // Admin states
  const [users, setUsers] = useState<any[]>([]);
  const [brokers, setBrokers] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  
  // Selected Chat for Unmasked Inspection Modal
  const [selectedInspectChat, setSelectedInspectChat] = useState<ChatRoom | null>(null);

  // Fetch all admin datasets
  const fetchAdminData = async () => {
    try {
      // 1. Fetch Users
      const resUsers = await fetch("/api/admin/users");
      if (resUsers.ok) setUsers(await resUsers.json());

      // 2. Fetch Brokers
      const resBrokers = await fetch("/api/admin/brokers");
      if (resBrokers.ok) setBrokers(await resBrokers.json());

      // 3. Fetch Reports
      const resReports = await fetch("/api/admin/reports");
      if (resReports.ok) setReports(await resReports.json());

      // 4. Fetch Chats
      const resChats = await fetch("/api/admin/chats");
      if (resChats.ok) setChatRooms(await resChats.json());
    } catch (e) {
      console.error("Error fetching admin datasets", e);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchListings();
  }, [activeTab]);

  // Handle Verify property toggle status
  const handleToggleVerify = async (propId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/listings/${propId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !currentStatus })
      });

      if (res.ok) {
        showToast("प्रॉपर्टी सत्यापन स्थिति अपडेट की गई! / Verification updated", "success");
        fetchListings(); // reload listings
      } else {
        showToast("सत्यापन अपडेट विफल / Failed to update verification status", "error");
      }
    } catch (e) {
      showToast("नेटवर्क त्रुटि / Connection error", "error");
    }
  };

  // Handle Delete property listing
  const handleDeleteProperty = async (propId: string) => {
    if (window.confirm(lang === "hi" ? "क्या आप सचमुच इस प्रॉपर्टी को हटाना चाहते हैं?" : "Are you sure you want to delete this property?")) {
      const success = await deleteProperty(propId);
      if (success) {
        showToast("सफलतापूर्वक हटा दिया गया! / Purged successfully", "success");
      }
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userEmail: string) => {
    if (window.confirm("Delete this user account?")) {
      try {
        const res = await fetch(`/api/admin/users/${userEmail}`, { method: "DELETE" });
        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.email !== userEmail));
          showToast("यूज़र खाता हटा दिया गया है। / User deleted", "success");
        }
      } catch (e) {
        showToast("Error", "error");
      }
    }
  };

  // Handle Dismiss Report
  const handleDismissReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        showToast("रिपोर्ट खारिज कर दी गई। / Report dismissed.", "info");
      }
    } catch (e) {
      showToast("Error", "error");
    }
  };

  // Handle Broker Commission Status change
  const handleChangeBrokerPayout = async (brokerEmail: string, dealId: string, newStatus: string) => {
    showToast(`पायआउट स्थिति को ${newStatus} में बदल दिया गया है!`, "success");
    // Dynamically update state mock
    setBrokers((prev) =>
      prev.map((br) => {
        if (br.email === brokerEmail) {
          return {
            ...br,
            referredDeals: br.referredDeals.map((dl: any) =>
              dl.id === dealId ? { ...dl, payoutStatus: newStatus } : dl
            )
          };
        }
        return br;
      })
    );
  };

  return (
    <div className="flex-1 bg-bg-secondary py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8" id="admin-dashboard-page">
      
      {/* Header bar banner */}
      <div className="bg-brand-blue text-white rounded-xl p-6 mb-8 soft-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center shadow">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold font-hindi">
              साहिबभूमि प्रशासनिक नियंत्रण केंद्र
            </h1>
            <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest mt-0.5">
              Sahibhoomi Core System Admin Console (1% Fee Tracker)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            adminLogout();
            navigate("/");
          }}
          className="px-4 py-2 bg-brand-orange hover:bg-opacity-95 text-white text-xs font-bold rounded-lg cursor-pointer select-none border border-orange-400"
        >
          कंट्रोल पैनल से बाहर आएं / Sign Out
        </button>
      </div>

      {/* Sub-tabs layout selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 select-none border-b border-gray-100">
        
        {/* Properties tab button */}
        <button
          onClick={() => setActiveTab("properties")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === "properties" ? "bg-brand-blue text-white shadow" : "bg-white text-text-muted hover:bg-gray-100"
          }`}
        >
          <Landmark size={14} />
          <span>प्रॉपर्टीज ({listings.length})</span>
        </button>

        {/* Users tab button */}
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === "users" ? "bg-brand-blue text-white shadow" : "bg-white text-text-muted hover:bg-gray-100"
          }`}
        >
          <Users size={14} />
          <span>यूज़र्स ({users.length})</span>
        </button>

        {/* Brokers tab button */}
        <button
          onClick={() => setActiveTab("brokers")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === "brokers" ? "bg-brand-blue text-white shadow" : "bg-white text-text-muted hover:bg-gray-100"
          }`}
        >
          <UserCheck size={14} />
          <span>ब्रोकर पार्टनर्स ({brokers.length})</span>
        </button>

        {/* Reports tab button */}
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === "reports" ? "bg-brand-blue text-white shadow" : "bg-white text-text-muted hover:bg-gray-100"
          }`}
        >
          <AlertTriangle size={14} className={reports.length > 0 ? "text-brand-orange animate-bounce" : ""} />
          <span>शिकायतें / Reports ({reports.length})</span>
        </button>

        {/* Chats monitor tab button */}
        <button
          onClick={() => setActiveTab("chats")}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
            activeTab === "chats" ? "bg-brand-blue text-white shadow" : "bg-white text-text-muted hover:bg-gray-100"
          }`}
        >
          <MessageSquare size={14} />
          <span>चैट मॉनिटर ({chatRooms.length})</span>
        </button>

      </div>

      {/* SUB-PANEL CONTENT ACCORDING TO ACTIVE TAB */}
      
      {/* 1. PROPERTIES MANAGER PANEL */}
      {activeTab === "properties" && (
        <div className="bg-white rounded-xl border border-gray-100 soft-shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-brand-blue font-hindi uppercase">प्रॉपर्टीज सूची एवं सत्यापन (Properties Manager)</h3>
            <span className="text-[10px] bg-blue-50 text-brand-blue font-extrabold px-3 py-1 rounded-full uppercase">1% Fee System</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-brand-blue uppercase text-[10px] font-extrabold">
                  <th className="p-4">प्रॉपर्टी शीर्षक / Title</th>
                  <th className="p-4">श्रेणी / Type</th>
                  <th className="p-4">इलाका / Area</th>
                  <th className="p-4">मूल्य / Price</th>
                  <th className="p-4">मालिक / Seller</th>
                  <th className="p-4">सत्यापन स्थिति / Verified Status</th>
                  <th className="p-4 text-center">क्रियाएं / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-text-primary">
                {listings.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-hindi truncate max-w-[220px]">{prop.title}</td>
                    <td className="p-4 uppercase">{prop.type}</td>
                    <td className="p-4">{prop.location}</td>
                    <td className="p-4 font-sans text-brand-orange font-bold">{formatPrice(prop.price)}</td>
                    <td className="p-4">
                      <p className="leading-tight">{prop.seller.name}</p>
                      <p className="text-[10px] text-text-muted font-bold">{prop.seller.email}</p>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVerify(prop.id, prop.verified)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                          prop.verified 
                            ? "bg-green-100 text-success-green" 
                            : "bg-orange-100 text-brand-orange hover:bg-orange-200"
                        }`}
                      >
                        {prop.verified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                        <span>{prop.verified ? "सत्यापित / Verified" : "सत्यापित करें / Verify Now"}</span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteProperty(prop.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Delete Property"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. USERS LIST PANEL */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-gray-100 soft-shadow p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-brand-blue font-hindi uppercase">पंजीकृत यूज़र्स सूची (Registered Users)</h3>
          
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-brand-blue uppercase text-[10px] font-extrabold">
                  <th className="p-4">यूज़र नाम / Name</th>
                  <th className="p-4">जीमेल पता / Email</th>
                  <th className="p-4">मोबाइल फोन / Phone</th>
                  <th className="p-4">पंजीकृत भूमिका / Role</th>
                  <th className="p-4 text-center">क्रियाएं / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-text-primary">
                {users.map((user) => (
                  <tr key={user.email} className="hover:bg-gray-50/50">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4 font-mono">{user.email}</td>
                    <td className="p-4 font-sans">{user.phone || "—"}</td>
                    <td className="p-4 uppercase">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold ${
                        user.role === "admin" ? "bg-red-100 text-red-600" :
                        user.role === "broker" ? "bg-blue-100 text-brand-blue" : "bg-gray-100 text-text-muted"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Purge User Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. BROKER PARTNERS PANEL */}
      {activeTab === "brokers" && (
        <div className="bg-white rounded-xl border border-gray-100 soft-shadow p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-brand-blue font-hindi uppercase">ब्रोकर कमीशन रेफरल ट्रैकर (Broker Partners Manager)</h3>
          
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-brand-blue uppercase text-[10px] font-extrabold">
                  <th className="p-4">ब्रोकर पार्टनर / Name</th>
                  <th className="p-4">मोबाइल फोन / Phone</th>
                  <th className="p-4">रेफर किया गया सौदा / Deal Detail</th>
                  <th className="p-4">सौदा मूल्य / Price</th>
                  <th className="p-4">ब्रोकर शेयर (५०%) / Share</th>
                  <th className="p-4">भुगतान स्थिति / Payout Status</th>
                  <th className="p-4 text-center">स्थिति बदलें / Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-text-primary">
                {brokers.map((broker) => (
                  <React.Fragment key={broker.email}>
                    {broker.referredDeals && broker.referredDeals.map((deal: any, idx: number) => (
                      <tr key={deal.id} className="hover:bg-gray-50/50">
                        {idx === 0 ? (
                          <td className="p-4 border-r border-gray-50" rowSpan={broker.referredDeals.length}>
                            <p className="font-bold leading-snug">{broker.name}</p>
                            <p className="text-[10px] text-text-muted">{broker.email}</p>
                          </td>
                        ) : null}
                        {idx === 0 ? (
                          <td className="p-4 font-sans" rowSpan={broker.referredDeals.length}>{broker.phone}</td>
                        ) : null}
                        <td className="p-4 font-hindi truncate max-w-[180px]">{deal.propertyTitle}</td>
                        <td className="p-4 font-sans">{formatPrice(deal.propertyPrice)}</td>
                        <td className="p-4 font-sans text-brand-orange font-bold">{formatPrice(deal.brokerShare)}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-[9px] font-bold uppercase ${
                            deal.payoutStatus === "Paid" ? "bg-green-100 text-success-green" :
                            deal.payoutStatus === "Processing" ? "bg-orange-100 text-brand-orange" : "bg-gray-100 text-text-muted"
                          }`}>
                            {deal.payoutStatus}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={deal.payoutStatus}
                            onChange={(e) => handleChangeBrokerPayout(broker.email, deal.id, e.target.value)}
                            className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] font-bold text-text-primary"
                          >
                            <option value="Unpaid">Unpaid</option>
                            <option value="Processing">Processing</option>
                            <option value="Paid">Paid</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. REPORTS / COMPLAINTS PANEL */}
      {activeTab === "reports" && (
        <div className="bg-white rounded-xl border border-gray-100 soft-shadow p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-brand-blue font-hindi uppercase">शिकायत टिकट सूची (Property Violation Reports)</h3>
          
          {reports.length === 0 ? (
            <p className="text-center py-8 text-xs font-semibold text-text-muted">कोई शिकायत दर्ज नहीं है। / No outstanding reports.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 bg-red-50/20 border border-red-100 rounded-xl flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] bg-red-100 text-red-600 font-extrabold px-2.5 py-0.5 rounded-full inline-block uppercase">Complaint Ticket</p>
                    <h4 className="font-bold text-xs text-text-primary">
                      Property ID: <span className="font-mono text-brand-blue font-semibold">{rep.propertyId}</span>
                    </h4>
                    <p className="text-xs text-text-muted font-semibold">Reported by: <span className="font-mono">{rep.email}</span></p>
                    <p className="text-xs text-text-primary font-hindi font-semibold bg-white p-3 rounded-lg border border-red-100/50">
                      📣 "{rep.reason}"
                    </p>
                  </div>

                  <div className="flex gap-2.5 flex-shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleDismissReport(rep.id)}
                      className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-text-primary text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteProperty(rep.propertyId);
                        handleDismissReport(rep.id);
                      }}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Delete Property</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. CHATS MONITOR (UNMASKED ACCESS) */}
      {activeTab === "chats" && (
        <div className="bg-white rounded-xl border border-gray-100 soft-shadow p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-brand-blue font-hindi uppercase">🛡️ प्रशासनिक चैट मॉनिटर (Administrative Communications Control)</h3>
              <p className="text-[10px] text-red-500 font-bold uppercase mt-0.5 animate-pulse">🔒 Unmasked Original Data logs Enabled</p>
            </div>
            
            <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase select-none">
              Secured Root Access
            </span>
          </div>

          <p className="text-[11px] text-text-muted font-semibold leading-relaxed font-hindi">
            "एडमिन सौदों की बातचीत की लाइव निगरानी कर सकते हैं ताकि खरीदारों और विक्रेताओं के बीच सीधा संपर्क कराकर १% फ्लैट कमीशन प्राप्त किया जा सके। फोन नंबर अनमास्क दिखाई दे रहे हैं।"
          </p>

          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-brand-blue uppercase text-[10px] font-extrabold">
                  <th className="p-4">चैट रूम / Room ID</th>
                  <th className="p-4">प्रॉपर्टी / Property Name</th>
                  <th className="p-4">खरीदार ईमेल / Buyer</th>
                  <th className="p-4">विक्रेता ईमेल / Seller</th>
                  <th className="p-4">कुल संदेश / Count</th>
                  <th className="p-4 text-center">लॉग्स देखें / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-text-primary">
                {chatRooms.map((room) => (
                  <tr key={room.roomId} className="hover:bg-gray-50/50">
                    <td className="p-4 font-mono text-[10px] text-brand-blue font-bold">{room.roomId}</td>
                    <td className="p-4 font-hindi truncate max-w-[160px]">{room.propertyTitle}</td>
                    <td className="p-4 font-mono">{room.buyerEmail}</td>
                    <td className="p-4 font-mono">{room.sellerEmail}</td>
                    <td className="p-4 font-sans">{room.messages.length} msg</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedInspectChat(room)}
                        className="px-3 py-1.5 bg-brand-blue hover:bg-opacity-95 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer mx-auto shadow-sm"
                      >
                        <Eye size={12} />
                        <span>Inspect Unmasked</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UNMASKED CHAT INSPECTION MODAL DRAWER */}
      {selectedInspectChat && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full h-[550px] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-brand-blue text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-brand-orange animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-xs text-white">अनमास्क्ड बातचीत रिकॉर्ड (Original Unmasked Conversation Log)</h4>
                  <p className="text-[9px] text-blue-200 uppercase tracking-wider mt-0.5">Admin Security Access Override</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInspectChat(null)}
                className="text-white hover:text-red-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Subtext Warning Banner */}
            <div className="bg-red-50 border-b border-red-100 p-3 flex items-center gap-1.5 text-[10px] text-red-600 font-extrabold text-center justify-center font-hindi">
              ⚠️ ध्यान दें: इस बातचीत के फोन नंबर पूरी तरह प्रकट (UNMASKED) हैं।
            </div>

            {/* Conversation Log messages */}
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50 space-y-3">
              {selectedInspectChat.messages.map((msg, idx) => (
                <div key={idx} className="flex flex-col items-start space-y-1 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] text-brand-blue font-bold uppercase">{msg.senderName} ({msg.senderRole})</span>
                    <span className="text-[8px] text-text-muted font-mono">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  
                  {/* Unmasked original message output! */}
                  <p className="text-xs font-semibold text-text-primary whitespace-pre-wrap selection:bg-orange-100">
                    {msg.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Close footer */}
            <div className="p-3 bg-white border-t border-gray-100 text-center flex-shrink-0">
              <button
                onClick={() => setSelectedInspectChat(null)}
                className="px-5 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                लॉग बन्द करें / Close Logs
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
