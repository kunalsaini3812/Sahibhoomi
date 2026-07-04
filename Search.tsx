import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../context/PropertiesContext";
import PropertyCard from "../components/PropertyCard";
import { Filter, SlidersHorizontal, ArrowUpDown, RefreshCw, X } from "lucide-react";

export default function Search() {
  const { lang, t } = useLanguage();
  const { listings, isLoading } = useProperties();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Mobile filter sidebar state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const locations = [
    "Civil Lines Budaun", "Ujhani", "Dataganj", "Bisauli", "Faridpur", 
    "Islamnagar", "Wazirganj", "Gunnaur", "Saidpur", "Sahaswan", 
    "Kakrala", "Bilsi"
  ];

  // Update filter fields if search parameters in URL change
  useEffect(() => {
    setLocation(searchParams.get("location") || "");
    setType(searchParams.get("type") || "");
  }, [searchParams]);

  // Clean filters
  const handleClearFilters = () => {
    setLocation("");
    setType("");
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setSortBy("newest");
    setSearchParams({});
  };

  // Filter listings
  const filteredListings = listings
    .filter((p) => {
      // 1. Filter by location
      if (location && !p.location.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }
      // 2. Filter by category type
      if (type && p.type !== type) {
        return false;
      }
      // 3. Filter by min price
      if (minPrice && p.price < parseFloat(minPrice)) {
        return false;
      }
      // 4. Filter by max price
      if (maxPrice && p.price > parseFloat(maxPrice)) {
        return false;
      }
      // 5. Filter by area keyword
      if (minArea && !p.area.toLowerCase().includes(minArea.toLowerCase())) {
        return false;
      }
      return p.status === "active";
    })
    // Sort listings
    .sort((a, b) => {
      if (sortBy === "price_asc") {
        return a.price - b.price;
      }
      if (sortBy === "price_desc") {
        return b.price - a.price;
      }
      // Default: newest first
      return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
    });

  return (
    <div className="flex-1 bg-bg-secondary py-8 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8" id="search-page">
      
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary font-hindi tracking-tight">
            {lang === "hi" ? "संपत्ति खोज परिणाम" : "Properties Search Results"}
          </h1>
          <p className="text-[11px] text-text-muted font-bold mt-1">
            {filteredListings.length} {lang === "hi" ? "संपत्तियां उपलब्ध हैं" : "listings found matching criteria"}
          </p>
        </div>

        {/* Sorting options dropdown */}
        <div className="flex items-center gap-2.5">
          <label className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-muted font-bold select-none uppercase">
            <ArrowUpDown size={14} />
            <span>{t("sort_by")}:</span>
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary cursor-pointer shadow-sm"
          >
            <option value="newest">{t("sort_newest")}</option>
            <option value="price_asc">{t("sort_price_asc")}</option>
            <option value="price_desc">{t("sort_price_desc")}</option>
          </select>

          {/* Mobile Filter Trigger Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden p-2 bg-white border border-gray-200 rounded-lg text-brand-blue flex items-center justify-center cursor-pointer shadow-sm"
            title="Filters"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Primary Layout Columns (Sidebar + Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar (1 column) */}
        <aside className="hidden md:block md:col-span-1 bg-white p-5 rounded-xl border border-gray-100 soft-shadow space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-extrabold text-sm text-text-primary font-hindi flex items-center gap-1.5 uppercase tracking-wider select-none">
              <SlidersHorizontal size={16} className="text-brand-orange" />
              <span>{t("filter_title")}</span>
            </h3>
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-bold text-brand-orange hover:underline cursor-pointer flex items-center gap-1 select-none"
            >
              <RefreshCw size={10} />
              <span>Clear</span>
            </button>
          </div>

          {/* Location filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("filter_location")}</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange cursor-pointer"
            >
              <option value="">{lang === "hi" ? "— सभी इलाके —" : "— All Areas —"}</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Type Category Filter */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("filter_type")}</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange cursor-pointer"
            >
              <option value="">{lang === "hi" ? "— सभी प्रकार —" : "— All Categories —"}</option>
              <option value="khet">{lang === "hi" ? "खेती की जमीन (खेत)" : "Khet (Farm)"}</option>
              <option value="makan">{lang === "hi" ? "मकान / घर" : "Makan (Home)"}</option>
              <option value="plot">{lang === "hi" ? "प्लॉट / खाली प्लॉट" : "Plot (Land)"}</option>
              <option value="dukan">{lang === "hi" ? "दुकान / व्यापारिक" : "Dukan (Commercial)"}</option>
            </select>
          </div>

          {/* Price Range inputs */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("filter_price")}</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange"
              />
            </div>
          </div>

          {/* Area Keyword search */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("filter_area")}</label>
            <input
              type="text"
              placeholder="जैसे: Bigha, sq ft, Gaj"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange"
            />
          </div>

        </aside>

        {/* Results Grid (3 columns) */}
        <main className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-gray-100 border border-gray-200 rounded-xl h-[380px] animate-pulse"></div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center max-w-lg mx-auto shadow-sm">
              <span className="text-4xl">😔</span>
              <h3 className="font-extrabold text-base text-text-primary font-hindi mt-4 mb-2">
                {t("no_results")}
              </h3>
              <p className="text-xs text-text-muted font-semibold mb-6">
                कोई संपत्ति नहीं मिली। कृपया अपने फ़िल्टर को साफ़ करें और पुन: प्रयास करें।
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-brand-blue text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                सभी फ़िल्टर साफ़ करें / Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </main>

      </div>

      {/* Mobile Filter Overlay Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end animate-fade-in md:hidden">
          <div className="w-[80vw] bg-white h-full p-6 flex flex-col justify-between shadow-2xl animate-slide-in">
            
            <div className="space-y-6 overflow-y-auto flex-1 pb-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-sm text-text-primary font-hindi flex items-center gap-1.5 uppercase select-none">
                  <SlidersHorizontal size={16} className="text-brand-orange" />
                  <span>{t("filter_title")}</span>
                </h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-black cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Location filter */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("filter_location")}</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-brand-orange cursor-pointer"
                >
                  <option value="">{lang === "hi" ? "— सभी इलाके —" : "— All Areas —"}</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("filter_type")}</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none"
                >
                  <option value="">{lang === "hi" ? "— सभी प्रकार —" : "— All Categories —"}</option>
                  <option value="khet">Khet</option>
                  <option value="makan">Makan</option>
                  <option value="plot">Plot</option>
                  <option value="dukan">Dukan</option>
                </select>
              </div>

              {/* Price range */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("filter_price")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Area unit search */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-brand-blue uppercase tracking-wider">{t("filter_area")}</label>
                <input
                  type="text"
                  placeholder="Bigha, Gaj, Sq ft"
                  value={minArea}
                  onChange={(e) => setMinArea(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                />
              </div>

            </div>

            {/* Bottom buttons */}
            <div className="space-y-3 pt-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => {
                  handleClearFilters();
                  setShowMobileFilters(false);
                }}
                className="w-full py-2.5 bg-gray-100 text-text-primary text-xs font-bold rounded-lg cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-2.5 bg-brand-orange text-white text-xs font-bold rounded-lg shadow cursor-pointer"
              >
                {lang === "hi" ? "फ़िल्टर लागू करें" : "Apply Filters"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
