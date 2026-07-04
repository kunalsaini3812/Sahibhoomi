import React, { createContext, useContext, useState, useEffect } from "react";
import { Property } from "../types";

// Toast state type
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface PropertiesContextType {
  listings: Property[];
  savedProperties: string[];
  isLoading: boolean;
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
  fetchListings: () => Promise<void>;
  addProperty: (propertyData: Partial<Property>) => Promise<Property | null>;
  deleteProperty: (id: string) => Promise<boolean>;
  reportProperty: (id: string, email: string, reason: string) => Promise<boolean>;
  toggleSaveProperty: (id: string) => void;
  isSaved: (id: string) => boolean;
  formatPrice: (price: number) => string;
  convertArea: (areaStr: string, targetUnit: string) => { value: number; unit: string; tooltip: string } | null;
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined);

export const PropertiesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [listings, setListings] = useState<Property[]>([]);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show a custom Toast Notification
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch listings from server
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/listings");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      } else {
        showToast("संपत्तियों को लोड करने में असमर्थ। / Failed to load properties", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("नेटवर्क त्रुटि। / Network error fetching listings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Load listings and bookmarks on mount
  useEffect(() => {
    fetchListings();
    const saved = localStorage.getItem("sahibhoomi_saved");
    if (saved) {
      try {
        setSavedProperties(JSON.parse(saved));
      } catch (e) {
        setSavedProperties([]);
      }
    }
  }, []);

  // Post property
  const addProperty = async (propertyData: Partial<Property>) => {
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyData),
      });

      if (res.ok) {
        const data = await res.json();
        setListings((prev) => [data, ...prev]);
        showToast("सफलतापूर्वक दर्ज! एडमिन सत्यापन के बाद लाइव होगी।", "success");
        return data;
      } else {
        const err = await res.json();
        showToast(err.error || "दर्ज करने में विफलता। / Failed to post property.", "error");
        return null;
      }
    } catch (e) {
      showToast("नेटवर्क त्रुटि हुई। / Network error.", "error");
      return null;
    }
  };

  // Delete property
  const deleteProperty = async (id: string) => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setListings((prev) => prev.filter((p) => p.id !== id));
        showToast("प्रॉपर्टी लिस्टिंग हटा दी गई है। / Property listing deleted.", "success");
        return true;
      } else {
        showToast("हटाने में विफलता। / Failed to delete property.", "error");
        return false;
      }
    } catch (e) {
      showToast("नेटवर्क त्रुटि। / Network error.", "error");
      return false;
    }
  };

  // Report property
  const reportProperty = async (id: string, email: string, reason: string) => {
    try {
      const res = await fetch(`/api/listings/${id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason }),
      });

      if (res.ok) {
        showToast("रिपोर्ट दर्ज कर ली गई है। एडमिन जाँच करेंगे। / Report submitted.", "info");
        return true;
      } else {
        showToast("रिपोर्ट करने में विफलता। / Failed to report property.", "error");
        return false;
      }
    } catch (e) {
      showToast("नेटवर्क त्रुटि। / Network error reporting.", "error");
      return false;
    }
  };

  // Save/Unsave property
  const toggleSaveProperty = (id: string) => {
    let updated: string[];
    if (savedProperties.includes(id)) {
      updated = savedProperties.filter((item) => item !== id);
      showToast("पसंदीदा सूची से हटाया गया / Removed from bookmarks", "info");
    } else {
      updated = [...savedProperties, id];
      showToast("पसंदीदा सूची में सहेजा गया / Saved to bookmarks", "success");
    }
    setSavedProperties(updated);
    localStorage.setItem("sahibhoomi_saved", JSON.stringify(updated));
  };

  const isSaved = (id: string) => savedProperties.includes(id);

  // Price formatter in Lakh/Crore
  const formatPrice = (price: number): string => {
    if (price >= 10000000) {
      const cr = price / 10000000;
      return `₹${cr.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Cr`;
    } else if (price >= 100000) {
      const lakh = price / 100000;
      return `₹${lakh.toLocaleString("en-IN", { maximumFractionDigits: 2 })} Lakh`;
    }
    return `₹${price.toLocaleString("en-IN")}`;
  };

  // Convert Area units
  // Bigha (Pucca = 3025 Gaj, Kachcha = 1008 Gaj), Gaj, Sq ft, Acres
  const convertArea = (areaStr: string, targetUnit: string) => {
    // Parse the numerical value and current unit from areaStr
    // e.g. "2 Bigha Pucca" or "1800 sq ft" or "200 Gaj"
    const valMatch = areaStr.match(/([0-9.]+)/);
    if (!valMatch) return null;
    const value = parseFloat(valMatch[1]);
    
    let sourceUnit = "sq ft";
    if (areaStr.toLowerCase().includes("bigha pucca") || areaStr.toLowerCase().includes("pucca")) {
      sourceUnit = "bigha_pucca";
    } else if (areaStr.toLowerCase().includes("bigha kachcha") || areaStr.toLowerCase().includes("kachcha")) {
      sourceUnit = "bigha_kachcha";
    } else if (areaStr.toLowerCase().includes("gaj") || areaStr.toLowerCase().includes("yard")) {
      sourceUnit = "gaj";
    } else if (areaStr.toLowerCase().includes("acre")) {
      sourceUnit = "acre";
    }

    // Convert everything to Sq Ft first
    // 1 Gaj = 9 sq ft
    // 1 Bigha Pucca = 3025 Gaj = 27225 sq ft
    // 1 Bigha Kachcha = 1008 Gaj = 9072 sq ft
    // 1 Acre = 43560 sq ft
    let sqft = 0;
    if (sourceUnit === "bigha_pucca") sqft = value * 27225;
    else if (sourceUnit === "bigha_kachcha") sqft = value * 9072;
    else if (sourceUnit === "gaj") sqft = value * 9;
    else if (sourceUnit === "acre") sqft = value * 43560;
    else sqft = value;

    // Convert from Sq Ft to target unit
    let convertedValue = 0;
    let unitLabel = "";
    if (targetUnit === "bigha_pucca") {
      convertedValue = sqft / 27225;
      unitLabel = "Bigha (Pucca)";
    } else if (targetUnit === "bigha_kachcha") {
      convertedValue = sqft / 9072;
      unitLabel = "Bigha (Kachcha)";
    } else if (targetUnit === "gaj") {
      convertedValue = sqft / 9;
      unitLabel = "Gaj";
    } else if (targetUnit === "acre") {
      convertedValue = sqft / 43560;
      unitLabel = "Acres";
    } else {
      convertedValue = sqft;
      unitLabel = "Sq Ft";
    }

    const roundedVal = Math.round(convertedValue * 100) / 100;
    
    // Create explanatory tooltip
    const tooltip = `1 Bigha (Pucca) = 3025 Gaj | 1 Bigha (Kachcha) = 1008 Gaj | 1 Gaj = 9 Sq Ft`;

    return {
      value: roundedVal,
      unit: unitLabel,
      tooltip
    };
  };

  return (
    <PropertiesContext.Provider
      value={{
        listings,
        savedProperties,
        isLoading,
        toasts,
        showToast,
        removeToast,
        fetchListings,
        addProperty,
        deleteProperty,
        reportProperty,
        toggleSaveProperty,
        isSaved,
        formatPrice,
        convertArea,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error("useProperties must be used within a PropertiesProvider");
  }
  return context;
};
