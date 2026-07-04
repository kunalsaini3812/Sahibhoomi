import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../context/PropertiesContext";
import { useAuth } from "../context/AuthContext";
import { Property, ChatRoom, ChatMessage } from "../types";
import { MapPin, Phone, ShieldCheck, Heart, Share2, Ruler, Compass, Calendar, HelpCircle, Send, MessageSquare, Lock, Sparkles, MoveLeft, RefreshCw } from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { lang, t } = useLanguage();
  const { listings, isSaved, toggleSaveProperty, formatPrice, convertArea, showToast } = useProperties();
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // 360 viewer state
  const [show360Modal, setShow360Modal] = useState(false);
  const [rotateIndex, setRotateIndex] = useState(0);

  // Area conversion state
  const [selectedUnit, setSelectedUnit] = useState("sq ft");
  const [convertedResult, setConvertedResult] = useState<any>(null);

  // Chat conversation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [roomId, setRoomId] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Find the property
  useEffect(() => {
    if (id && listings.length > 0) {
      const found = listings.find((p) => p.id === id);
      if (found) {
        setProperty(found);
        
        // Load initial converted area
        const conversion = convertArea(found.area, "gaj");
        setConvertedResult(conversion);
        setSelectedUnit("gaj");
      }
    }
  }, [id, listings]);

  // Load chat messages
  const fetchRoomMessages = async () => {
    if (!property || !currentUser) return;
    try {
      const email = currentUser.email;
      const targetRoomId = `room_${property.id}_${email.split("@")[0]}`;
      const res = await fetch(`/api/chats/room/${targetRoomId}?role=${currentUser.role}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages);
        setRoomId(data.roomId);
      } else {
        // Chat room doesn't exist yet on backend, we'll initialize with seller welcome
        const initialSellerWelcome: ChatMessage = {
          id: "welcome",
          senderEmail: property.seller.email,
          senderName: property.seller.name,
          senderRole: "seller",
          text: lang === "hi" 
            ? `राम राम जी! मैं ${property.seller.name} हूँ। क्या आप इस संपत्ति के बारे में कुछ और जानकारी चाहते हैं?` 
            : `Ram Ram! I am ${property.seller.name}. Do you want to know more details about this property?`,
          timestamp: new Date().toISOString()
        };
        setChatMessages([initialSellerWelcome]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (property && currentUser) {
      fetchRoomMessages();
    }
  }, [property, currentUser]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center" id="not-found-page">
        <h2 className="text-2xl font-bold text-brand-blue mb-2 font-hindi">कोई संपत्ति नहीं मिली 😔</h2>
        <p className="text-text-muted text-xs font-semibold mb-6">Either it was removed or the link is broken.</p>
        <Link to="/" className="px-5 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-lg shadow">
          वापस होम पेज पर जाएं
        </Link>
      </div>
    );
  }

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    const result = convertArea(property.area, unit);
    setConvertedResult(result);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareTitle = lang === "hi" ? property.title : property.title_en;
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: `SahibHoomi पर यह बिकाऊ प्रॉपर्टी देखें: ${shareTitle}`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast("लिंक कॉपी कर लिया गया है! / Link copied to clipboard!", "success");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    if (!isLoggedIn || !currentUser) {
      showToast("कृपया पहले लॉगिन करें! / Please login to chat", "error");
      navigate("/auth");
      return;
    }

    const textToSend = chatInput;
    setChatInput("");

    try {
      const res = await fetch("/api/chats/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          propertyTitle: property.title,
          buyerEmail: currentUser.email,
          sellerEmail: property.seller.email,
          text: textToSend,
          senderEmail: currentUser.email,
          senderName: currentUser.name,
          senderRole: currentUser.role
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Append sent message to chat state
        setChatMessages((prev) => [...prev, data.message]);
        showToast("संदेश भेजा गया / Message sent", "success");
      } else {
        showToast("संदेश भेजने में विफल / Failed to send message", "error");
      }
    } catch (e) {
      showToast("त्रुटि / Communication failure", "error");
    }
  };

  const handleBookMeeting = () => {
    if (!isLoggedIn) {
      showToast("कृपया पहले लॉगिन करें! / Please login to book a meeting", "error");
      navigate("/auth");
      return;
    }
    showToast("मीटिंग अनुरोध सफलतापूर्वक भेजा गया! मालिक आपसे संपर्क करेंगे।", "success");
    
    // Auto-generate booking chat message
    setChatInput(lang === "hi" ? "📅 मैं इस प्रॉपर्टी को देखने के लिए मीटिंग बुक करना चाहता हूँ।" : "📅 I would like to book a meeting to inspect this property.");
  };

  const displayTitle = lang === "hi" ? property.title : property.title_en;

  // Commission Calculations (1% buyer, 1% seller)
  const buyerCommission = property.price * 0.01;
  const sellerCommission = property.price * 0.01;
  const totalCommission = buyerCommission + sellerCommission;

  return (
    <div className="flex-1 bg-bg-secondary py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8" id="property-detail-page">
      
      {/* Back button */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-orange mb-6 transition-colors">
        <MoveLeft size={16} />
        <span>होम पेज पर वापस जाएं / Back to Home</span>
      </Link>

      {/* Main Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (65%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gallery Block */}
          <div className="bg-white rounded-xl overflow-hidden soft-shadow border border-gray-100 p-4">
            <div className="relative h-72 sm:h-[400px] w-full rounded-lg overflow-hidden bg-gray-100 select-none">
              
              {/* Rotating 360 Mock Frame */}
              {show360Modal ? (
                <div className="absolute inset-0 bg-brand-blue flex flex-col items-center justify-center p-6 text-white text-center">
                  <div className="relative w-48 h-48 rounded-full border-4 border-dashed border-brand-orange flex items-center justify-center animate-spin duration-[6000ms]">
                    <Compass size={48} className="text-brand-orange" />
                  </div>
                  <h4 className="font-bold text-lg font-hindi mt-6">360° वर्चुअल कछार कूप नजारा</h4>
                  <p className="text-xs text-blue-200 mt-1 max-w-sm">
                    {lang === "hi" 
                      ? "खेत के ट्यूबवेल और चारों कोनों का संपूर्ण दृश्य लोड हो रहा है... माउस ड्रैग करें।" 
                      : "Rotating panoramic farmland survey loaded dynamically. Drag mouse to turn."}
                  </p>
                  <button 
                    onClick={() => setShow360Modal(false)}
                    className="mt-6 px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-lg hover:bg-opacity-90"
                  >
                    नियमित फोटो पर जाएं
                  </button>
                </div>
              ) : (
                <img
                  src={property.images[activeImageIndex] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"}
                  alt={displayTitle}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Verified Badge Overlay */}
              {property.verified && (
                <div className="absolute top-4 left-4 bg-success-green text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md select-none">
                  <ShieldCheck size={14} />
                  <span>{t("verified")}</span>
                </div>
              )}

              {/* 360 CTA Button Overlay */}
              <button
                onClick={() => setShow360Modal(!show360Modal)}
                className="absolute bottom-4 right-4 px-4 py-2 bg-brand-orange text-white text-xs font-bold rounded-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer glow-orange uppercase select-none"
              >
                <Compass size={14} />
                <span>{t("view_360")}</span>
              </button>
            </div>

            {/* Thumbnail selector */}
            <div className="flex gap-2.5 mt-3">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShow360Modal(false);
                    setActiveImageIndex(idx);
                  }}
                  className={`w-16 h-12 rounded border-2 overflow-hidden transition-all cursor-pointer ${
                    activeImageIndex === idx && !show360Modal ? "border-brand-orange scale-105" : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Heading Details */}
          <div className="bg-white rounded-xl p-6 soft-shadow border border-gray-100 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary font-hindi leading-snug">
                  {displayTitle}
                </h1>
                
                {/* Location row */}
                <div className="flex items-center gap-1 text-xs text-text-muted font-bold mt-2 select-none">
                  <MapPin size={16} className="text-brand-blue" />
                  <span>{property.location}, बदायूँ, उत्तर प्रदेश (Uttar Pradesh)</span>
                </div>
              </div>

              {/* Price display */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-5 py-3 text-center sm:text-right flex-shrink-0">
                <span className="block text-[10px] font-bold text-brand-orange uppercase tracking-wider">
                  {lang === "hi" ? "अंतिम कीमत (कमीशन रहित)" : "Listed Price"}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-brand-orange block font-sans">
                  {formatPrice(property.price)}
                </span>
              </div>
            </div>

            {/* Quick specifications specs bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 bg-gray-50/50 rounded-lg px-4">
              <div>
                <span className="block text-[10px] font-bold text-text-muted uppercase mb-0.5">{lang === "hi" ? "क्षेत्रफल" : "Total Area"}</span>
                <span className="text-xs font-bold text-brand-blue">{property.area}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-text-muted uppercase mb-0.5">{lang === "hi" ? "दिशा" : "Facing Direction"}</span>
                <span className="text-xs font-bold text-brand-blue">{property.facing || "North-East"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-text-muted uppercase mb-0.5">{lang === "hi" ? "सत्यापन स्थिति" : "Verification"}</span>
                <span className="text-xs font-bold text-success-green flex items-center gap-0.5">
                  <ShieldCheck size={12} /> {property.verified ? (lang === "hi" ? "सत्यापित" : "Verified") : (lang === "hi" ? "सत्यापन बाकी" : "Pending")}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-text-muted uppercase mb-0.5">{lang === "hi" ? "श्रेणी" : "Category"}</span>
                <span className="text-xs font-bold text-brand-blue uppercase">{property.type}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <h3 className="font-extrabold text-sm text-text-primary font-hindi flex items-center gap-1.5">
                <Sparkles size={16} className="text-brand-orange" />
                {t("prop_desc")}
              </h3>
              <p className="text-xs text-text-muted font-medium font-hindi leading-relaxed whitespace-pre-line bg-blue-50/20 p-4 rounded-lg border border-blue-50/30">
                {property.description}
              </p>
            </div>

            {/* Amenities Tags */}
            <div className="space-y-2 pt-2">
              <h3 className="font-extrabold text-sm text-text-primary font-hindi">
                {t("amenities")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gray-100 text-text-primary rounded-lg text-xs font-semibold hover:bg-brand-blue hover:text-white transition-all cursor-default"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Area Unit Converter Widget */}
          <div className="bg-white rounded-xl p-6 soft-shadow border border-gray-100 space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary font-hindi flex items-center justify-between">
              <span>क्षेत्रफल परिवर्तक (Area Unit Converter)</span>
              <span className="text-[10px] bg-brand-blue text-white px-2 py-0.5 rounded">Bigha Tool</span>
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              {["sq ft", "gaj", "bigha_pucca", "bigha_kachcha", "acre"].map((unit) => (
                <button
                  key={unit}
                  onClick={() => handleUnitChange(unit)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all uppercase ${
                    selectedUnit === unit 
                      ? "bg-brand-orange text-white" 
                      : "bg-gray-100 text-text-muted hover:bg-gray-200"
                  }`}
                >
                  {unit === "bigha_pucca" ? "Bigha (Pucca)" : unit === "bigha_kachcha" ? "Bigha (Kachcha)" : unit}
                </button>
              ))}
            </div>

            {convertedResult && (
              <div className="p-4 bg-orange-50/30 border border-orange-100 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-text-muted font-bold block uppercase">
                    रूपांतरित क्षेत्रफल / Converted Area
                  </span>
                  <span className="text-lg font-extrabold text-brand-orange">
                    {convertedResult.value} {convertedResult.unit}
                  </span>
                </div>
                <div className="text-[10px] text-brand-blue font-bold text-right max-w-[180px] leading-relaxed">
                  {convertedResult.tooltip}
                </div>
              </div>
            )}
          </div>

          {/* Commission Calculator Widget */}
          <div className="bg-white rounded-xl p-6 soft-shadow border border-gray-100 space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary font-hindi flex items-center gap-2">
              <ShieldCheck size={18} className="text-success-green" />
              <span>{t("commission_calc_title")} (Flat 1%)</span>
            </h3>
            
            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] text-text-muted block font-bold uppercase mb-1">Buyer Pays (1%)</span>
                <span className="text-sm font-extrabold text-brand-blue">{formatPrice(buyerCommission)}</span>
              </div>
              <div className="border-t sm:border-t-0 sm:border-x border-gray-100 pt-3 sm:pt-0">
                <span className="text-[10px] text-text-muted block font-bold uppercase mb-1">Seller Pays (1%)</span>
                <span className="text-sm font-extrabold text-brand-blue">{formatPrice(sellerCommission)}</span>
              </div>
              <div className="border-t sm:border-t-0 pt-3 sm:pt-0">
                <span className="text-[10px] text-brand-orange block font-bold uppercase mb-1">Total platform fee</span>
                <span className="text-sm font-extrabold text-brand-orange">{formatPrice(totalCommission)}</span>
              </div>
            </div>
            
            <p className="text-[10px] text-text-muted font-semibold text-center italic font-hindi">
              "सफल सौदा होने पर ही 1% शुल्क लागू होता है। कोई छुपा हुआ सेवा कर या अग्रिम शुल्क नहीं।"
            </p>
          </div>

          {/* SahibHoomi Safe Promise */}
          <div className="border-2 border-brand-blue rounded-xl p-5 bg-blue-50/20 space-y-2">
            <h4 className="font-extrabold text-xs sm:text-sm text-brand-blue font-hindi uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={18} />
              {t("trust_promise_title")}
            </h4>
            <p className="text-xs text-text-muted font-medium font-hindi leading-relaxed">
              {t("trust_promise_body")}
            </p>
          </div>

          {/* Visit specific link below all details */}
          <div className="text-center py-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <Link
              to="/"
              className="text-xs font-bold text-brand-blue hover:text-brand-orange underline underline-offset-4 uppercase tracking-wider transition-colors"
            >
              {property.type === "khet" && `🌾 Visit this Khet / इस खेत पर जाएं →`}
              {property.type === "makan" && `🏠 Visit this Home / इस मकान पर जाएं →`}
              {property.type === "plot" && `📐 Visit this Plot / इस प्लॉट पर जाएं →`}
              {property.type === "dukan" && `🏪 Visit this Dukan / इस दुकान पर जाएं →`}
            </Link>
          </div>

        </div>

        {/* Right Column (35% sticky) */}
        <div className="lg:sticky lg:top-24 space-y-6">
          
          {/* Chat box card */}
          <div className="bg-white rounded-xl border border-gray-100 soft-shadow overflow-hidden flex flex-col h-[400px]">
            {/* Seller profile header */}
            <div className="bg-brand-blue text-white p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-xs select-none">
                {property.seller.initials || "RK"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs text-white truncate leading-tight">
                    {property.seller.name}
                  </h4>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                </div>
                <p className="text-[9px] text-blue-200 font-semibold uppercase tracking-wider">
                  {property.type === "khet" ? (lang === "hi" ? "किसान" : "Farmer") : (lang === "hi" ? "मालिक" : "Owner")}
                </p>
              </div>
            </div>

            {/* Warning bar */}
            <div className="bg-orange-50 border-b border-orange-100 px-3 py-1.5 text-[10px] text-brand-orange font-bold font-hindi text-center">
              📌 {t("chat_warning")}
            </div>

            {/* Conversation Log */}
            <div className="flex-1 p-3 overflow-y-auto bg-gray-50 space-y-3">
              {chatMessages.map((msg, idx) => {
                const isMe = isLoggedIn && currentUser && msg.senderEmail.toLowerCase() === currentUser.email.toLowerCase();
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-[8px] text-text-muted font-bold mb-0.5 px-1">{msg.senderName.split(" ")[0]}</span>
                    <div className={`max-w-[85%] rounded-xl p-2.5 text-xs font-semibold leading-relaxed shadow-sm ${
                      isMe 
                        ? "bg-brand-orange text-white rounded-tr-none" 
                        : "bg-white text-text-primary border border-gray-100 rounded-tl-none"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input send bar */}
            <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-100 flex items-center gap-1.5 bg-white">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === "hi" ? "लिखें..." : "Type here..."}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
              />
              <button
                type="submit"
                className="p-2 bg-brand-blue text-white rounded-lg hover:bg-opacity-95 transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* Actions panel */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 soft-shadow space-y-4">
            
            {/* Meeting book button */}
            <button
              onClick={handleBookMeeting}
              className="w-full py-3 bg-brand-orange text-white text-xs font-bold rounded-lg shadow-md hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 uppercase cursor-pointer select-none border border-orange-400"
            >
              <Calendar size={16} />
              <span>{t("book_meeting")}</span>
            </button>

            <div className="flex items-center justify-center gap-1 text-[10px] text-text-muted font-bold select-none uppercase">
              <Lock size={12} className="text-success-green" />
              <span>{t("encrypted_communication")}</span>
            </div>

            {/* Report listing button */}
            <button
              onClick={() => {
                if (!isLoggedIn || !currentUser) {
                  showToast("कृपया पहले लॉगिन करें! / Login required", "error");
                  return;
                }
                const reason = prompt(lang === "hi" ? "रिपोर्ट करने का कारण बताएं (जैसे: बिका हुआ, गलत मूल्य, फर्जी):" : "Why are you reporting this? (e.g. Sold, Fake, Wrong details):");
                if (reason) {
                  fetch(`/api/listings/${property.id}/report`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: currentUser.email, reason })
                  })
                  .then(res => {
                    if (res.ok) showToast("रिपोर्ट दर्ज कर ली गई है। / Reported successfully", "info");
                  });
                }
              }}
              className="w-full text-center text-[10px] font-bold text-red-500 hover:text-red-700 uppercase transition-colors tracking-wider"
            >
              ⚠️ इस संपत्ति की रिपोर्ट करें / Report this listing
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
