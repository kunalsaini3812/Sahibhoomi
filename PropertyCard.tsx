import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Property } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../context/PropertiesContext";
import { MapPin, Heart, Share2, MessageSquare, Check, ShieldCheck, Ruler, Droplets, BedDouble, Building, HelpCircle } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  key?: string;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const { lang, t } = useLanguage();
  const { isSaved, toggleSaveProperty, formatPrice, showToast } = useProperties();
  const navigate = useNavigate();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/property/${property.id}`;
    const shareTitle = lang === "hi" ? property.title : property.title_en;

    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: `SahibHoomi पर देखें: ${shareTitle}`,
        url: shareUrl
      })
      .then(() => showToast("सफलतापूर्वक साझा किया गया! / Shared successfully!", "success"))
      .catch((err) => console.log("Error sharing", err));
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      showToast("लिंक कॉपी कर लिया गया है! / Link copied to clipboard!", "success");
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Redirect to property detail page scrolling directly to the chat section or just property detail page which has the chat
    navigate(`/property/${property.id}?chat=true`);
  };

  // Render specifications based on category
  const renderSpecRow = () => {
    if (property.type === "khet") {
      const hasWater = property.features.some(f => f.toLowerCase().includes("well") || f.toLowerCase().includes("boring") || f.toLowerCase().includes("irrigation") || f.toLowerCase().includes("water"));
      return (
        <div className="flex items-center gap-4 text-xs text-text-muted font-medium mb-3">
          <span className="flex items-center gap-1">
            <Ruler size={14} className="text-brand-blue" />
            {property.area}
          </span>
          <span className="flex items-center gap-1">
            <Droplets size={14} className="text-brand-blue" />
            {hasWater ? (lang === "hi" ? "सिंचित / सिचाईं है" : "Irrigated") : (lang === "hi" ? "असिंचित" : "Unirrigated")}
          </span>
        </div>
      );
    } else if (property.type === "makan") {
      return (
        <div className="flex items-center gap-4 text-xs text-text-muted font-medium mb-3">
          <span className="flex items-center gap-1">
            <BedDouble size={14} className="text-brand-blue" />
            {property.bhk || "2 BHK"}
          </span>
          <span className="flex items-center gap-1">
            <Building size={14} className="text-brand-blue" />
            {property.area}
          </span>
        </div>
      );
    } else {
      // Plot or Dukan
      return (
        <div className="flex items-center gap-4 text-xs text-text-muted font-medium mb-3">
          <span className="flex items-center gap-1">
            <Ruler size={14} className="text-brand-blue" />
            {property.area}
          </span>
          {property.facing && (
            <span className="text-[11px] bg-blue-50 text-brand-blue font-bold px-2 py-0.5 rounded">
              {lang === "hi" ? `दिशा: ${property.facing}` : `Facing: ${property.facing}`}
            </span>
          )}
        </div>
      );
    }
  };

  // Get dynamic visit text link based on property type
  const getVisitLinkDetails = () => {
    switch (property.type) {
      case "khet":
        return {
          label: t("visit_khet"),
          icon: "🌾"
        };
      case "makan":
        return {
          label: t("visit_makan"),
          icon: "🏠"
        };
      case "plot":
        return {
          label: t("visit_plot"),
          icon: "📐"
        };
      case "dukan":
        return {
          label: t("visit_dukan"),
          icon: "🏪"
        };
      default:
        return {
          label: "संपत्ति पर जाएं / Visit Property →",
          icon: "🏠"
        };
    }
  };

  const visitDetails = getVisitLinkDetails();
  const displayTitle = lang === "hi" ? property.title : property.title_en;

  return (
    <div className="bg-white rounded-xl overflow-hidden soft-shadow border border-gray-100 hover:border-brand-orange hover:scale-[1.02] transition-all duration-300 flex flex-col group h-full">
      
      {/* Photo Area */}
      <div className="relative h-48 w-full overflow-hidden select-none bg-gray-100">
        <img
          src={property.images[0] || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"}
          alt={displayTitle}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Verification Badge */}
        {property.verified && (
          <div className="absolute top-3 left-3 bg-success-green text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <ShieldCheck size={12} />
            <span>{t("verified")}</span>
          </div>
        )}

        {/* Saved Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveProperty(property.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
        >
          <Heart size={16} fill={isSaved(property.id) ? "#EF4444" : "none"} className={isSaved(property.id) ? "text-red-500" : ""} />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-3 right-12 w-8 h-8 rounded-full bg-white/90 text-gray-600 hover:text-brand-orange hover:bg-white flex items-center justify-center transition-all shadow-sm cursor-pointer"
        >
          <Share2 size={14} />
        </button>

        {/* Price Badge Overlay */}
        <div className="absolute bottom-3 left-3 bg-brand-orange text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md glow-orange">
          {formatPrice(property.price)}
        </div>
      </div>

      {/* Details Content */}
      <div className="p-4 flex flex-col flex-grow">
        
        {/* Title */}
        <Link to={`/property/${property.id}`} className="block mb-1.5">
          <h3 className="font-bold text-text-primary text-sm hover:text-brand-orange line-clamp-2 transition-colors min-h-[40px] leading-snug">
            {displayTitle}
          </h3>
        </Link>

        {/* Location Row */}
        <div className="flex items-center gap-1 text-xs text-text-muted font-semibold mb-2.5">
          <MapPin size={14} className="text-brand-blue flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Dynamic spec indicators */}
        {renderSpecRow()}

        {/* Seller Info row */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-brand-blue font-bold text-[10px] flex items-center justify-center">
              {property.seller.initials || "RK"}
            </div>
            <div className="text-[11px]">
              <p className="font-bold text-text-primary leading-tight">
                {property.seller.name.split(" ")[0]}
              </p>
              <p className="text-text-muted text-[9px] font-medium uppercase">
                {property.type === "khet" ? (lang === "hi" ? "किसान" : "Farmer") : (lang === "hi" ? "स्वामी" : "Owner")}
              </p>
            </div>
          </div>

          {/* Chat CTA Button */}
          <button
            onClick={handleChatClick}
            className="px-3 py-1.5 bg-brand-blue hover:bg-opacity-95 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all soft-shadow cursor-pointer"
          >
            <MessageSquare size={12} />
            <span>{t("chat_now")}</span>
          </button>
        </div>

      </div>

      {/* Visit property underline link */}
      <div className="px-4 pb-3 pt-1 border-t border-gray-50 bg-gray-50/50 text-center rounded-b-xl">
        <Link
          to={`/property/${property.id}`}
          className="text-xs font-bold text-brand-blue hover:text-brand-orange underline underline-offset-4 transition-colors"
        >
          {visitDetails.label}
        </Link>
      </div>

    </div>
  );
}
