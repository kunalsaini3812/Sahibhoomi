import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../context/PropertiesContext";
import PropertyCard from "../components/PropertyCard";
import { Trees, Home as HomeIcon, Landmark, ShoppingBag, Shield, Lock, Camera, Search, Sparkles } from "lucide-react";

export default function Home() {
  const { lang, t } = useLanguage();
  const { listings, isLoading } = useProperties();
  const navigate = useNavigate();

  // Search form state
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const locations = [
    "Civil Lines Budaun", "Ujhani", "Dataganj", "Bisauli", "Faridpur", 
    "Islamnagar", "Wazirganj", "Gunnaur", "Saidpur", "Sahaswan", 
    "Kakrala", "Bilsi"
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let queryParams = [];
    if (selectedLocation) queryParams.push(`location=${encodeURIComponent(selectedLocation)}`);
    if (selectedType) queryParams.push(`type=${selectedType}`);
    
    navigate(`/search?${queryParams.join("&")}`);
  };

  const handleCategoryClick = (type: string) => {
    navigate(`/search?type=${type}`);
  };

  // Get active verified featured properties
  const featuredProperties = listings
    .filter(p => p.status === "active")
    .slice(0, 6);

  return (
    <div className="flex-1 bg-white" id="home-page">
      
      {/* Hero Section */}
      <section className="relative min-h-[500px] flex items-center justify-center py-20 px-4 bg-cover bg-center select-none"
        style={{
          backgroundImage: `linear-gradient(rgba(27, 45, 107, 0.75), rgba(27, 45, 107, 0.75)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600')`
        }}
      >
        <div className="max-w-4xl w-full text-center text-white flex flex-col items-center">
          
          <div className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-bold px-3.5 py-1.5 rounded-full uppercase mb-6 shadow-md animate-pulse">
            <Sparkles size={14} />
            <span>{t("commission_badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-hindi leading-tight mb-4">
            {t("hero_title")}
          </h1>
          
          <p className="text-base sm:text-xl text-blue-100 font-semibold max-w-2xl mb-10 leading-relaxed font-hindi">
            {t("hero_subtitle")}
          </p>

          {/* Search Bar Form */}
          <form 
            onSubmit={handleSearch}
            className="w-full bg-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row gap-3.5 border border-gray-100 max-w-3xl"
          >
            {/* Location Dropdown */}
            <div className="flex-1 text-left">
              <label className="block text-[10px] font-bold text-brand-blue uppercase mb-1.5 tracking-wider">
                {lang === "hi" ? "इलाका चुनें" : "Select Location"}
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="">{lang === "hi" ? "— सभी इलाके —" : "— All Areas —"}</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Type Dropdown */}
            <div className="flex-1 text-left border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-3.5">
              <label className="block text-[10px] font-bold text-brand-blue uppercase mb-1.5 tracking-wider">
                {lang === "hi" ? "प्रॉपर्टी श्रेणी" : "Property Category"}
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="">{lang === "hi" ? "— सभी प्रकार —" : "— All Types —"}</option>
                <option value="khet">{lang === "hi" ? "खेती की जमीन (खेत)" : "Khet (Farm)"}</option>
                <option value="makan">{lang === "hi" ? "मकान / घर" : "Makan (Home)"}</option>
                <option value="plot">{lang === "hi" ? "प्लॉट / खाली प्लॉट" : "Plot (Land)"}</option>
                <option value="dukan">{lang === "hi" ? "दुकान / व्यापारिक" : "Dukan (Commercial)"}</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="px-6 py-3.5 bg-brand-orange text-white text-xs font-bold rounded-lg hover:bg-opacity-95 transition-all flex items-center justify-center gap-1.5 font-sans shadow-md cursor-pointer mt-2 md:mt-0"
            >
              <Search size={16} />
              <span>{lang === "hi" ? "संपत्ति खोजें" : "Search Properties"}</span>
            </button>
          </form>

        </div>
      </section>

      {/* Explore Categories Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-hindi tracking-tight mb-2">
            {t("cat_heading")}
          </h2>
          <div className="w-16 h-1 bg-brand-orange mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category Cards */}
          <div 
            onClick={() => handleCategoryClick("khet")}
            className="group relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:border-brand-orange border-2 border-transparent cursor-pointer transition-all duration-300 transform hover:scale-[1.03]"
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400')` }}></div>
            <div className="absolute inset-0 bg-brand-blue/70 group-hover:bg-brand-blue/60 transition-colors"></div>
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
              <Trees size={32} className="text-brand-orange" />
              <div>
                <h3 className="font-bold text-sm font-hindi leading-tight">{t("cat_khet_title")}</h3>
                <p className="text-[10px] text-orange-200 mt-1 uppercase font-semibold">Plot / Khet</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleCategoryClick("makan")}
            className="group relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:border-brand-orange border-2 border-transparent cursor-pointer transition-all duration-300 transform hover:scale-[1.03]"
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400')` }}></div>
            <div className="absolute inset-0 bg-brand-blue/70 group-hover:bg-brand-blue/60 transition-colors"></div>
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
              <HomeIcon size={32} className="text-brand-orange" />
              <div>
                <h3 className="font-bold text-sm font-hindi leading-tight">{t("cat_makan_title")}</h3>
                <p className="text-[10px] text-orange-200 mt-1 uppercase font-semibold">Residential</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleCategoryClick("plot")}
            className="group relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:border-brand-orange border-2 border-transparent cursor-pointer transition-all duration-300 transform hover:scale-[1.03]"
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400')` }}></div>
            <div className="absolute inset-0 bg-brand-blue/70 group-hover:bg-brand-blue/60 transition-colors"></div>
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
              <Landmark size={32} className="text-brand-orange" />
              <div>
                <h3 className="font-bold text-sm font-hindi leading-tight">{t("cat_plot_title")}</h3>
                <p className="text-[10px] text-orange-200 mt-1 uppercase font-semibold">Vacant Land</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleCategoryClick("dukan")}
            className="group relative h-48 rounded-xl overflow-hidden shadow-md hover:shadow-lg hover:border-brand-orange border-2 border-transparent cursor-pointer transition-all duration-300 transform hover:scale-[1.03]"
          >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1604754742629-3e5728249d73?w=400')` }}></div>
            <div className="absolute inset-0 bg-brand-blue/70 group-hover:bg-brand-blue/60 transition-colors"></div>
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
              <ShoppingBag size={32} className="text-brand-orange" />
              <div>
                <h3 className="font-bold text-sm font-hindi leading-tight">{t("cat_dukan_title")}</h3>
                <p className="text-[10px] text-orange-200 mt-1 uppercase font-semibold">Commercial</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1% Transparent Commission Banner */}
      <section className="bg-brand-blue text-white py-16 px-4 border-y border-blue-900">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left Side Info */}
          <div className="flex items-start gap-6 max-w-2xl">
            <div className="text-5xl sm:text-7xl font-extrabold text-brand-orange tracking-tight select-none font-sans drop-shadow-md">
              1%
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white font-hindi tracking-tight mb-2 flex items-center gap-2">
                {t("commission_title")}
              </h3>
              <p className="text-sm text-blue-200 leading-relaxed font-hindi">
                {t("commission_body")}
              </p>
            </div>
          </div>

          {/* Right Side Badge */}
          <div className="flex-shrink-0">
            <div className="bg-brand-orange text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow-lg glow-orange uppercase flex items-center gap-2 select-none border border-orange-400">
              <Shield size={16} />
              <span>{t("commission_badge")}</span>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-16 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-hindi tracking-tight mb-2">
            {t("featured_title")}
          </h2>
          <div className="w-16 h-1 bg-brand-orange mx-auto rounded"></div>
        </div>

        {isLoading ? (
          /* Skeleton Loader Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-50 border border-gray-100 rounded-xl h-[380px] animate-pulse p-4 flex flex-col space-y-4">
                <div className="bg-gray-200 h-48 w-full rounded-lg"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="mt-auto h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-semibold text-text-muted">{t("no_results")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Trust Features Row */}
      <section className="bg-bg-secondary py-16 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-hindi tracking-tight mb-2">
              {t("trust_heading")}
            </h2>
            <div className="w-16 h-1 bg-brand-orange mx-auto rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
                <Shield size={24} />
              </div>
              <h3 className="font-bold text-base text-text-primary font-hindi mb-2">
                {t("trust_feat1_title")}
              </h3>
              <p className="text-xs text-text-muted font-medium font-hindi leading-relaxed">
                {t("trust_feat1_desc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
                <Lock size={24} />
              </div>
              <h3 className="font-bold text-base text-text-primary font-hindi mb-2">
                {t("trust_feat2_title")}
              </h3>
              <p className="text-xs text-text-muted font-medium font-hindi leading-relaxed">
                {t("trust_feat2_desc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center mb-4">
                <Camera size={24} />
              </div>
              <h3 className="font-bold text-base text-text-primary font-hindi mb-2">
                {t("trust_feat3_title")}
              </h3>
              <p className="text-xs text-text-muted font-medium font-hindi leading-relaxed">
                {t("trust_feat3_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
