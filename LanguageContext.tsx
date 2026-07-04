import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "hi" | "en";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: { [key: string]: { hi: string; en: string } } = {
  // Navigation
  logo_sub: { hi: "SahibHoomi.com", en: "SahibHoomi.com" },
  nav_khet: { hi: "खेती / खेत", en: "Khet / Farm" },
  nav_makan: { hi: "मकान / घर", en: "Makan / Home" },
  nav_plot: { hi: "प्लॉट / खाली जमीन", en: "Plot / Land" },
  nav_dukan: { hi: "दुकान / व्यापारिक", en: "Dukan / Commercial" },
  nav_post_property: { hi: "संपत्ति सूचीबद्ध करें", en: "List Property" },
  nav_login: { hi: "लॉगिन / साइन-इन", en: "Login / Sign-in" },
  nav_logout: { hi: "लॉगआउट", en: "Logout" },
  nav_profile: { hi: "प्रोफ़ाइल", en: "Profile" },
  nav_admin: { hi: "एडमिन पैनल", en: "Admin Panel" },

  // Hero Section
  hero_title: { hi: "बदायूँ की अपनी प्रॉपर्टी वेबसाइट", en: "Budaun's Own Property Website" },
  hero_subtitle: { hi: "खेत, मकान, प्लॉट और दुकान — सब एक जगह", en: "Khet, Makan, Plot, and Dukan — All in One Place" },
  search_location: { hi: "इलाका चुनें / Select Area", en: "Select Location" },
  search_type: { hi: "प्रॉपर्टी का प्रकार", en: "Property Type" },
  search_btn: { hi: "संपत्ति खोजें", en: "Search Properties" },
  all_locations: { hi: "सभी इलाके", en: "All Areas" },

  // Categories
  cat_heading: { hi: "श्रेणियाँ देखें", en: "Explore Categories" },
  cat_khet_title: { hi: "खेती की जमीन (खेत)", en: "Khet (Agricultural Farmland)" },
  cat_makan_title: { hi: "घर-निवास (मकान)", en: "Makan (Residential Homes)" },
  cat_plot_title: { hi: "प्लॉट / आवासीय भूमि", en: "Plot (Residential Lands)" },
  cat_dukan_title: { hi: "व्यापारिक दुकान", en: "Dukan (Commercial Shops)" },

  // Commission Banner
  commission_title: { hi: "सपाट कमीशन शुल्क (Flat Commission)", en: "Flat Commission Fee" },
  commission_body: { hi: "कोई छुपा शुल्क नहीं। बायर और सेलर दोनों से केवल 1% — पारदर्शी और न्यायसंगत।", en: "No hidden charges. Just 1% from buyer and 1% from seller — transparent and fair." },
  commission_badge: { hi: "100% सत्यापित और सुरक्षित", en: "100% Verified & Secure" },

  // Featured listings
  featured_title: { hi: "चुनिंदा संपत्तियाँ", en: "Featured Listings" },
  verified: { hi: "सत्यापित", en: "Verified" },
  pending_approval: { hi: "सत्यापन लंबित", en: "Pending Approval" },
  chat_now: { hi: "अभी चैट करें", en: "Chat Now" },
  visit_khet: { hi: "इस खेत पर जाएं →", en: "Visit this Khet →" },
  visit_makan: { hi: "इस मकान पर जाएं →", en: "Visit this Home →" },
  visit_plot: { hi: "इस प्लॉट पर जाएं →", en: "Visit this Plot →" },
  visit_dukan: { hi: "इस दुकान पर जाएं →", en: "Visit this Dukan →" },

  // Trust Features
  trust_heading: { hi: "साहिबभूमि सुरक्षा एवं विश्वास", en: "Sahibhoomi Security & Trust" },
  trust_feat1_title: { hi: "सत्यापित जानकारी", en: "Verified Information" },
  trust_feat1_desc: { hi: "हर लिस्टिंग की हमारी टीम भौतिक रूप से जाँच और कागजात का सत्यापन करती है।", en: "Our team physically inspects and verifies deeds for every property." },
  trust_feat2_title: { hi: "सुरक्षित इन-ऐप चैट", en: "Safe In-App Chat" },
  trust_feat2_desc: { hi: "आपके संपर्क विवरण सुरक्षित हैं। बिना नंबर साझा किए सुरक्षित बातचीत करें।", en: "Your contact details are hidden. Chat safely without exposing your number." },
  trust_feat3_title: { hi: "360° वर्चुअल टूर", en: "360° Virtual Tour" },
  trust_feat3_desc: { hi: "बिना समय गंवाए घर बैठे ही खेतों और मकानों का चारों तरफ का नजारा देखें।", en: "Look around agricultural lands and homes from comfort of your home." },

  // Footer
  footer_tagline: { hi: "बदायूँ का सबसे विश्वसनीय और पारदर्शी प्रॉपर्टी नेटवर्क। 1% सपाट शुल्क पर काम करने वाली पहली यूपी-बदायूँ आधारित वेबसाइट।", en: "Budaun's most trusted and transparent property network. First UP-Budaun based platform operating on 1% flat fee." },
  footer_quick_links: { hi: "त्वरित लिंक", en: "Quick Links" },
  footer_legal: { hi: "कानूनी जानकारी / निजता नीति / सेवा की शर्तें", en: "Legal Policy / Privacy / Terms of Service" },
  footer_contact: { hi: "संपर्क सूत्र: support@sahibhoomi.com, सिविल लाइंस, बदायूँ, उत्तर प्रदेश", en: "Contact: support@sahibhoomi.com, Civil Lines, Budaun, Uttar Pradesh" },
  footer_copy: { hi: "© 2025 SahibHoomi। 1% पारदर्शी कमीशन। सर्व अधिकार सुरक्षित।", en: "© 2025 SahibHoomi. 1% Transparent Commission. All rights reserved." },

  // Detail Page
  view_360: { hi: "360° नज़ारा देखें / 360° View", en: "View 360° Tour" },
  prop_desc: { hi: "संपत्ति का विवरण", en: "Property Description" },
  prop_specs: { hi: "संपत्ति के विशेष मापदंड", en: "Property Specifications" },
  amenities: { hi: "सुविधाएं और लाभ", en: "Amenities & Features" },
  trust_promise_title: { hi: "साहिबभूमि सुरक्षित सौदा प्रतिज्ञा", en: "Sahibhoomi Safe Transaction Promise" },
  trust_promise_body: { hi: "3-चरणीय सत्यापन प्रक्रिया और केवल 1% पारदर्शी कमीशन के साथ बिना किसी धोखाधड़ी के सुरक्षित डील करें।", en: "Deal safely with our 3-step physical verification and 1% flat transparent commission." },
  commission_calc_title: { hi: "कमिशन कैलकुलेटर", en: "Commission Calculator" },
  chat_warning: { hi: "यह चैट SahibHoomi द्वारा मॉनिटर की जाती है। फ़ोन नंबर छुपाए गए हैं।", en: "This chat is monitored by SahibHoomi. Phone numbers are hidden." },
  encrypted_communication: { hi: "सुरक्षित एन्क्रिप्टेड वार्तालाप", en: "Secure Encrypted Communication" },
  book_meeting: { hi: "मीटिंग बुक करें", en: "Request Meeting" },

  // Filter Page
  filter_title: { hi: "संपत्ति फ़िल्टर करें", en: "Filter Properties" },
  filter_location: { hi: "इलाका (बदायूँ)", en: "Location (Budaun)" },
  filter_type: { hi: "श्रेणी", en: "Property Category" },
  filter_price: { hi: "कीमत सीमा (₹)", en: "Price Range (₹)" },
  filter_area: { hi: "क्षेत्रफल (Bigha/Sq ft/Gaj)", en: "Area (Bigha/Sq ft/Gaj)" },
  sort_by: { hi: "सॉर्ट करें", en: "Sort By" },
  sort_newest: { hi: "नवीनतम / Newest", en: "Newest" },
  sort_price_asc: { hi: "कीमत: कम से अधिक", en: "Price: Low to High" },
  sort_price_desc: { hi: "कीमत: अधिक से कम", en: "Price: High to Low" },
  no_results: { hi: "कोई संपत्ति नहीं मिली 😔 — अपना फ़िल्टर बदलें", en: "No properties found 😔 — Please modify your filters" },

  // Post Property Page
  post_title: { hi: "नई संपत्ति सूचीबद्ध करें", en: "Post New Property" },
  post_step1: { hi: "संपत्ति प्रकार", en: "Property Type" },
  post_step2: { hi: "विवरण और स्थान", en: "Details & Location" },
  post_step3: { hi: "फोटो एवं वीडियो", en: "Photos & Media" },
  step: { hi: "चरण", en: "Step" },
  next: { hi: "आगे बढ़ें", en: "Next" },
  prev: { hi: "पीछे जाएं", en: "Back" },
  price_label: { hi: "कीमत (रुपये में)", en: "Price (in Rupees)" },
  price_placeholder: { hi: "जैसे: 5,00,000", en: "e.g. 5,00,000" },
  desc_placeholder: { hi: "अपनी प्रॉपर्टी के बारे में विस्तार से बताएं... (पानी की सुविधा, रोड की चौड़ाई, रजिस्ट्री आदि)", en: "Describe your property in detail... (water access, road width, registry, etc.)" },
  area_label: { hi: "क्षेत्रफल", en: "Property Area" },
  submit_property: { hi: "प्रॉपर्टी पोस्ट करें", en: "Post Property" },
  success_posted: { hi: "आपकी संपत्ति सफलतापूर्वक दर्ज कर ली गई है! एडमिन सत्यापन के बाद यह लाइव हो जाएगी।", en: "Property submitted successfully! It will go live after admin verification." }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("sahibhoomi_lang");
    return (saved === "en" || saved === "hi") ? saved : "hi";
  });

  useEffect(() => {
    localStorage.setItem("sahibhoomi_lang", lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === "hi" ? "en" : "hi"));
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][lang];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
