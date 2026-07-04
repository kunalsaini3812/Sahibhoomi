import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../context/PropertiesContext";
import { useAuth } from "../context/AuthContext";
import { Trees, Home, Landmark, ShoppingBag, Check, Upload, Sparkles, HelpCircle, AlertTriangle } from "lucide-react";

export default function PostProperty() {
  const { lang, t } = useLanguage();
  const { addProperty, showToast } = useProperties();
  const { currentUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // If not logged in, redirect to auth
  if (!isLoggedIn || !currentUser) {
    showToast("कृपया संपत्ति पोस्ट करने के लिए पहले लॉगिन करें! / Login required", "info");
    return <Navigate to="/auth" replace />;
  }

  // Stepper state (1, 2, or 3)
  const [step, setStep] = useState(1);

  // Form Fields State
  const [type, setType] = useState<"khet" | "makan" | "plot" | "dukan">("khet");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  
  // Category-specific fields
  const [khasra, setKhasra] = useState(""); // Khet
  const [irrigation, setIrrigation] = useState("Tube-well"); // Khet
  const [bhk, setBhk] = useState("2 BHK"); // Makan
  const [floors, setFloors] = useState("1"); // Makan/Dukan
  const [age, setAge] = useState(""); // Makan
  const [facing, setFacing] = useState("East"); // Plot/Makan
  const [rent, setRent] = useState(""); // Dukan
  
  // Media states
  const [images, setImages] = useState<string[]>([]);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [has360, setHas360] = useState(false);

  // Agreement states
  const [agreements, setAgreements] = useState({
    owner: false,
    legal: false,
    noDispute: false,
    security: false,
    verification: false,
    suspension: false
  });

  const locations = [
    "Civil Lines Budaun", "Ujhani", "Dataganj", "Bisauli", "Faridpur", 
    "Islamnagar", "Wazirganj", "Gunnaur", "Saidpur", "Sahaswan", 
    "Kakrala", "Bilsi"
  ];

  const handleAgreementChange = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMockUpload = (mediaType: "photo" | "video" | "360") => {
    if (mediaType === "photo") {
      setHasPhoto(true);
      // Seed some realistic mock property image links depending on selected category
      let mockImg = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600";
      if (type === "khet") mockImg = "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600";
      if (type === "makan") mockImg = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600";
      if (type === "dukan") mockImg = "https://images.unsplash.com/photo-1604754742629-3e5728249d73?w=600";
      if (type === "plot") mockImg = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600";
      setImages([mockImg]);
      showToast("फोटो अपलोड हो गई है! / Photos uploaded successfully!", "success");
    } else if (mediaType === "video") {
      setHasVideo(true);
      showToast("वीडियो सफलतापूर्वक जुड़ गया! / Video uploaded!", "success");
    } else if (mediaType === "360") {
      setHas360(true);
      showToast("Premium 360° Tour generated successfully!", "success");
    }
  };

  const handleNextStep = () => {
    if (step === 1 && !type) {
      showToast("कृपया पहले प्रॉपर्टी का प्रकार चुनें! / Select property type", "error");
      return;
    }
    if (step === 2) {
      if (!title || !location || !price || !area || !description) {
        showToast("कृपया सभी विवरण भरें! / Please fill all required fields", "error");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify all agreement checkmarks are checked
    const allChecked = Object.values(agreements).every(v => v === true);
    if (!allChecked) {
      showToast("कृपया नियमों और कानूनी समझौतों के सभी बॉक्स को चेक करें! / Accept all terms", "error");
      return;
    }

    const sellerInfo = {
      name: currentUser.name,
      initials: currentUser.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
      email: currentUser.email,
      phone: currentUser.phone || "9999999999"
    };

    // Gather features based on specific details
    const featuresList = [];
    if (type === "khet") {
      featuresList.push(irrigation);
      featuresList.push("Road Accessible");
    } else if (type === "makan") {
      featuresList.push(bhk);
      featuresList.push(`${floors} Floors`);
      if (facing) featuresList.push(`${facing} Facing`);
    } else if (type === "plot") {
      featuresList.push(`${facing} Facing`);
      featuresList.push("Main Road Touch");
    } else if (type === "dukan") {
      featuresList.push(`${floors} Floor`);
      if (rent) featuresList.push(`₹${rent}/mo Rent`);
    }

    const propertyPayload = {
      type,
      title,
      title_en: titleEn || title,
      location: `${location}, Budaun`,
      price: parseFloat(price),
      area,
      description,
      seller: sellerInfo,
      features: featuresList,
      khasra: khasra || undefined,
      bhk: type === "makan" ? bhk : undefined,
      floors: (type === "makan" || type === "dukan") ? floors : undefined,
      age: type === "makan" ? age : undefined,
      facing: (type === "makan" || type === "plot") ? facing : undefined,
      rent: type === "dukan" ? parseFloat(rent) : undefined,
      images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"]
    };

    const result = await addProperty(propertyPayload);
    if (result) {
      navigate("/");
    }
  };

  return (
    <div className="flex-1 bg-bg-secondary py-10 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8" id="post-property-page">
      
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-hindi tracking-tight">
          {t("post_title")}
        </h1>
        <p className="text-xs text-text-muted font-bold mt-1 uppercase tracking-widest">
          {lang === "hi" ? "1% कमीशन प्लेटफॉर्म पर सूचीबद्ध करें" : "List on 1% Commission Network"}
        </p>
      </div>

      {/* Primary 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Form area (Left 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 sm:p-8 soft-shadow border border-gray-100">
          
          {/* Stepper indicators bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 max-w-md mx-auto select-none text-center">
            
            <div className={`flex flex-col items-center flex-1 ${step >= 1 ? "text-brand-orange" : "text-gray-400"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? "bg-orange-100" : "bg-gray-100"}`}>1</span>
              <span className="text-[10px] font-bold mt-1">{t("post_step1")}</span>
            </div>
            <div className="h-[2px] bg-gray-100 flex-1 mb-4"></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 2 ? "text-brand-orange" : "text-gray-400"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? "bg-orange-100" : "bg-gray-100"}`}>2</span>
              <span className="text-[10px] font-bold mt-1">{t("post_step2")}</span>
            </div>
            <div className="h-[2px] bg-gray-100 flex-1 mb-4"></div>
            <div className={`flex flex-col items-center flex-1 ${step >= 3 ? "text-brand-orange" : "text-gray-400"}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? "bg-orange-100" : "bg-gray-100"}`}>3</span>
              <span className="text-[10px] font-bold mt-1">{t("post_step3")}</span>
            </div>

          </div>

          {/* Stepper Steps Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: Property Type selection */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-extrabold text-sm text-brand-blue font-hindi border-l-4 border-brand-orange pl-2.5">
                  अपनी संपत्ति की श्रेणी चुनें / Choose Property Category:
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Khet Card */}
                  <div
                    onClick={() => setType("khet")}
                    className={`p-5 rounded-xl border-2 cursor-pointer text-center flex flex-col items-center gap-3 transition-all ${
                      type === "khet" ? "border-brand-blue bg-blue-50/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center relative">
                      <Trees size={24} />
                      {type === "khet" && <span className="absolute top-0 right-0 w-4 h-4 bg-brand-blue text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text-primary font-hindi">खेती की जमीन (खेत)</h4>
                      <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">Khet / Farm</p>
                    </div>
                  </div>

                  {/* Makan Card */}
                  <div
                    onClick={() => setType("makan")}
                    className={`p-5 rounded-xl border-2 cursor-pointer text-center flex flex-col items-center gap-3 transition-all ${
                      type === "makan" ? "border-brand-blue bg-blue-50/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center relative">
                      <Home size={24} />
                      {type === "makan" && <span className="absolute top-0 right-0 w-4 h-4 bg-brand-blue text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text-primary font-hindi">घर-निवास (मकान)</h4>
                      <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">Makan / House</p>
                    </div>
                  </div>

                  {/* Plot Card */}
                  <div
                    onClick={() => setType("plot")}
                    className={`p-5 rounded-xl border-2 cursor-pointer text-center flex flex-col items-center gap-3 transition-all ${
                      type === "plot" ? "border-brand-blue bg-blue-50/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center relative">
                      <Landmark size={24} />
                      {type === "plot" && <span className="absolute top-0 right-0 w-4 h-4 bg-brand-blue text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text-primary font-hindi">प्लॉट / खाली भूमि</h4>
                      <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">Plot / Land</p>
                    </div>
                  </div>

                  {/* Dukan Card */}
                  <div
                    onClick={() => setType("dukan")}
                    className={`p-5 rounded-xl border-2 cursor-pointer text-center flex flex-col items-center gap-3 transition-all ${
                      type === "dukan" ? "border-brand-blue bg-blue-50/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center relative">
                      <ShoppingBag size={24} />
                      {type === "dukan" && <span className="absolute top-0 right-0 w-4 h-4 bg-brand-blue text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-text-primary font-hindi">व्यापारिक दुकान</h4>
                      <p className="text-[9px] text-text-muted font-bold uppercase mt-0.5">Dukan / Commercial</p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 2: Location & Details */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="font-extrabold text-sm text-brand-blue font-hindi border-l-4 border-brand-orange pl-2.5 mb-4">
                  विवरण और स्थान दर्ज करें / Basic Details:
                </h3>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">शीर्षक (Hindi Title) *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="जैसे: कछार रोड के पास २ बीघा उपजाऊ खेती का खेत"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">English Title (optional)</label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. 2 Bigha fertile farmland near Kachar road"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
                  />
                </div>

                {/* Location & Area Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">इलाका चुनें / Select Area *</label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange cursor-pointer"
                      required
                    >
                      <option value="">— इलाका चुनें / Choose Location —</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("area_label")} *</label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder={type === "khet" ? "जैसे: 2 Bigha Pucca" : "जैसे: 1500 sq ft or 150 Gaj"}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange"
                      required
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("price_label")} *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={t("price_placeholder")}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange"
                    required
                  />
                </div>

                {/* Specific Category Fields */}
                <div className="p-4 bg-blue-50/30 border border-blue-50 rounded-xl space-y-4">
                  <h4 className="text-[10px] font-bold text-brand-blue uppercase tracking-widest">विशेष मानदंड / Type Specific Details:</h4>
                  
                  {type === "khet" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-text-muted uppercase">खसरा नंबर / Khasra No.</label>
                        <input
                          type="text"
                          value={khasra}
                          onChange={(e) => setKhasra(e.target.value)}
                          placeholder="e.g. 445/2"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-text-muted uppercase">सिचाई सुविधा / Irrigation Type</label>
                        <select
                          value={irrigation}
                          onChange={(e) => setIrrigation(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                        >
                          <option value="Tube-well">Tube-well (नलकूप)</option>
                          <option value="Canal Irrigation">Canal (नहर सिचाईं)</option>
                          <option value="Boring Available">Boring (बोरिंग उपलब्ध)</option>
                          <option value="Rainfed">Rainfed (वर्षा आधारित)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {type === "makan" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-text-muted uppercase">कमरे / BHK</label>
                        <select value={bhk} onChange={(e) => setBhk(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs">
                          <option value="1 BHK">1 BHK</option>
                          <option value="2 BHK">2 BHK</option>
                          <option value="3 BHK">3 BHK</option>
                          <option value="4 BHK">4 BHK</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-text-muted uppercase">मंजिल / Floors</label>
                        <input type="number" value={floors} onChange={(e) => setFloors(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-text-muted uppercase">मकान की उम्र / Age (Yrs)</label>
                        <input type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="जैसे: 2 years" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                      </div>
                    </div>
                  )}

                  {(type === "plot" || type === "makan") && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-text-muted uppercase">प्लॉट का मुख / Facing Direction</label>
                      <select value={facing} onChange={(e) => setFacing(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs">
                        <option value="East">East (पूर्व)</option>
                        <option value="West">West (पश्चिम)</option>
                        <option value="North">North (उत्तर)</option>
                        <option value="South">South (दक्षिण)</option>
                      </select>
                    </div>
                  )}

                  {type === "dukan" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-text-muted uppercase">फ्लोर नंबर / Floor No.</label>
                        <input type="text" value={floors} onChange={(e) => setFloors(e.target.value)} placeholder="e.g. Ground Floor" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-text-muted uppercase">मासिक किराया (यदि किराए पर हो)</label>
                        <input type="number" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="₹ Monthly rent" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs" />
                      </div>
                    </div>
                  )}

                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">प्रॉपर्टी का विवरण / Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("desc_placeholder")}
                    rows={4}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary"
                    required
                  ></textarea>
                </div>

              </div>
            )}

            {/* STEP 3: Photos, Videos & Legal Checkboxes */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Media Boxes */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-sm text-brand-blue font-hindi border-l-4 border-brand-orange pl-2.5 mb-4">
                    मीडिया फ़ाइलें अपलोड करें / Add Photos & Media:
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Add Photos */}
                    <div
                      onClick={() => handleMockUpload("photo")}
                      className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                        hasPhoto ? "border-success-green bg-green-50/10" : "border-gray-200 hover:border-brand-orange"
                      }`}
                    >
                      <Upload size={24} className={hasPhoto ? "text-success-green" : "text-gray-400"} />
                      <span className="text-xs font-bold text-text-primary mt-2">📷 Add Photos</span>
                      <span className="text-[9px] text-text-muted mt-1 uppercase">Images (.jpg, .png)</span>
                      {hasPhoto && <span className="mt-2 text-[9px] text-success-green font-bold">✓ Uploaded</span>}
                    </div>

                    {/* Add Video */}
                    <div
                      onClick={() => handleMockUpload("video")}
                      className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                        hasVideo ? "border-success-green bg-green-50/10" : "border-gray-200 hover:border-brand-orange"
                      }`}
                    >
                      <Upload size={24} className={hasVideo ? "text-success-green" : "text-gray-400"} />
                      <span className="text-xs font-bold text-text-primary mt-2">🎬 Add Video</span>
                      <span className="text-[9px] text-text-muted mt-1 uppercase">Short Walkthrough</span>
                      {hasVideo && <span className="mt-2 text-[9px] text-success-green font-bold">✓ Uploaded</span>}
                    </div>

                    {/* Premium 360 View */}
                    <div
                      onClick={() => handleMockUpload("360")}
                      className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                        has360 ? "border-success-green bg-green-50/10" : "border-gray-200 hover:border-brand-orange"
                      }`}
                    >
                      <Sparkles size={24} className={has360 ? "text-brand-orange animate-pulse" : "text-gray-400"} />
                      <span className="text-xs font-bold text-brand-orange mt-2">🔄 360° View (Premium)</span>
                      <span className="text-[9px] text-text-muted mt-1 uppercase">Farmland Panorama</span>
                      {has360 && <span className="mt-2 text-[9px] text-brand-orange font-bold">✓ Simulated Live</span>}
                    </div>

                  </div>
                </div>

                {/* Legal Agreements checkboxes */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <h4 className="font-extrabold text-xs text-brand-blue font-hindi uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-brand-orange" />
                    <span>नियम एवं कानूनी शर्तें (Agreements & Terms) *</span>
                  </h4>

                  <div className="bg-orange-50/20 p-4 border border-orange-100 rounded-xl space-y-3">
                    
                    {/* Item 1 */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreements.owner}
                        onChange={() => handleAgreementChange("owner")}
                        className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs font-medium text-text-primary font-hindi leading-tight">
                        मैं पुष्टि करता/करती हूँ कि मैं इस संपत्ति का वास्तविक स्वामी हूँ। (Confirm owner status)
                      </span>
                    </label>

                    {/* Item 2 */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreements.legal}
                        onChange={() => handleAgreementChange("legal")}
                        className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs font-medium text-text-primary font-hindi leading-tight">
                        प्रदान की गई सभी जानकारी कानूनी रूप से सही है। (Legally correct)
                      </span>
                    </label>

                    {/* Item 3 */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreements.noDispute}
                        onChange={() => handleAgreementChange("noDispute")}
                        className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs font-medium text-text-primary font-hindi leading-tight">
                        संपत्ति पर कोई कानूनी विवाद या बकाया ऋण नहीं है। (No active dispute or loan)
                      </span>
                    </label>

                    {/* Item 4 */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreements.security}
                        onChange={() => handleAgreementChange("security")}
                        className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs font-medium text-text-primary font-hindi leading-tight">
                        मैं प्लेटफॉर्म के सुरक्षा मानकों का पालन करने के लिए सहमत हूँ। (Accept safety rules)
                      </span>
                    </label>

                    {/* Item 5 */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreements.verification}
                        onChange={() => handleAgreementChange("verification")}
                        className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs font-medium text-text-primary font-hindi leading-tight">
                        दस्तावेज़ों के सत्यापन के लिए मैं सहयोग करूँगा/करूँगी। (Cooperate in verification)
                      </span>
                    </label>

                    {/* Item 6 */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreements.suspension}
                        onChange={() => handleAgreementChange("suspension")}
                        className="mt-1 w-4 h-4 text-brand-orange focus:ring-brand-orange border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs font-medium text-text-primary font-hindi leading-tight text-red-600">
                        झूठी जानकारी देने पर मेरा खाता निलंबित किया जा सकता है। (Risk account suspension for fake data)
                      </span>
                    </label>

                  </div>
                </div>

                {/* 1% Commission Warning footer */}
                <div className="bg-blue-50 text-brand-blue border border-blue-100 p-4 rounded-xl flex items-center gap-2 text-xs font-bold font-hindi">
                  ℹ️ सफल डील होने पर केवल 1% कमीशन लागू होगा।
                </div>

              </div>
            )}

            {/* Stepper Navigation buttons footer */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 bg-gray-100 text-text-primary text-xs font-bold rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  {t("prev")}
                </button>
              ) : (
                <div></div>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-opacity-95 shadow-md transition-all"
                >
                  {t("next")}
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-opacity-95 shadow-md transition-all"
                >
                  {t("submit_property")}
                </button>
              )}
            </div>

          </form>

        </div>

        {/* Tips sidebar (1 column right) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 soft-shadow space-y-4">
            <h4 className="font-extrabold text-xs sm:text-sm text-brand-blue font-hindi uppercase tracking-wider select-none border-b border-gray-100 pb-2">
              💡 उपयोगी सुझाव / Listing Tips
            </h4>
            
            <ul className="space-y-3.5 text-xs text-text-muted font-semibold leading-relaxed font-hindi">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 flex-shrink-0"></span>
                <span>साफ और चौड़ी फोटो से जल्दी खरीदार आकर्षित होते हैं।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 flex-shrink-0"></span>
                <span className="text-brand-orange">360° व्यू देने वाली संपत्तियों को 3 गुना ज्यादा रिस्पॉन्स मिलता है।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 flex-shrink-0"></span>
                <span>अपने खसरा नंबर या भवन की उम्र सही दर्ज करें ताकि एडमिन इसे जल्दी सत्यापित कर सकें।</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
