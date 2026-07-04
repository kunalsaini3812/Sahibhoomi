import React from "react";
import { useProperties, Toast } from "../context/PropertiesContext";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useProperties();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full" id="toast-container">
      {toasts.map((toast: Toast) => {
        let bgColor = "bg-white border-l-4 border-success-green text-text-primary";
        let Icon = CheckCircle2;
        let iconColor = "text-success-green";

        if (toast.type === "error") {
          bgColor = "bg-white border-l-4 border-red-500 text-text-primary";
          Icon = AlertCircle;
          iconColor = "text-red-500";
        } else if (toast.type === "info") {
          bgColor = "bg-white border-l-4 border-brand-orange text-text-primary";
          Icon = Info;
          iconColor = "text-brand-orange";
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-lg soft-shadow border border-gray-100 ${bgColor} animate-fade-in`}
          >
            <div className="flex items-center gap-3">
              <Icon size={20} className={iconColor} />
              <p className="text-xs font-semibold leading-relaxed font-sans">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-text-primary transition-colors cursor-pointer ml-2 mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
