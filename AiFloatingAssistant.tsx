import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../context/PropertiesContext";
import { Property } from "../types";
import { MessageSquareCode, Send, Mic, MicOff, X, Bot, MapPin, Sparkles, User, MessageCircle } from "lucide-react";

interface ChatHistoryItem {
  role: "user" | "model";
  text: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  recommendedProperties?: Property[];
  timestamp: Date;
}

export default function AiFloatingAssistant() {
  const { lang, t } = useLanguage();
  const { formatPrice } = useProperties();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === "hi" ? "hi-IN" : "en-IN";

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [lang]);

  // Set default greeting on load
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = lang === "hi" 
        ? "राम राम जी! मैं साहिबभूमि एआई सहायक हूँ। बदायूँ में आपको खेत, मकान, प्लॉट या दुकान में से क्या चाहिए? मुझे अपना बजट और इलाका बताएं, जैसे: 'उझानी में २ बीघा खेत चाहिए १० लाख तक'।"
        : "Ram Ram! I am the SahibHoomi AI Assistant. What type of property (Khet, Makan, Plot, Dukan) are you looking for in Budaun? Tell me your budget and location, e.g., 'need 2 bigha khet in Ujhani under 10 lakh'.";
      
      setMessages([
        {
          id: "welcome",
          sender: "bot",
          text: greeting,
          timestamp: new Date()
        }
      ]);
    }
  }, [lang, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert(lang === "hi" ? "आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता है।" : "Your browser does not support Web Speech API.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setInputValue("");

    // Add user message to state
    const newUserMsg: ChatMessage = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: userText,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      // Build history payload for Gemini backend API
      const historyPayload = messages.slice(1).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: historyPayload })
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: "bot_" + Math.random().toString(36).substr(2, 9),
            sender: "bot",
            text: data.text,
            recommendedProperties: data.recommendedProperties || [],
            timestamp: new Date()
          }
        ]);
      } else {
        throw new Error(data.error || "Chatbot API error");
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err_" + Math.random().toString(36).substr(2, 9),
          sender: "bot",
          text: lang === "hi" 
            ? "माफ़ कीजियेगा, मैं वर्तमान में नेटवर्क समस्या के कारण उत्तर देने में असमर्थ हूँ। कृपया पुनः प्रयास करें।"
            : "Apologies, I am unable to connect right now due to a network error. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end">
      
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-brand-orange text-white flex items-center justify-center glow-orange hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg cursor-pointer"
          title="SahibHoomi AI Assistant"
          id="ai-floating-bubble"
        >
          <Bot size={28} className="animate-pulse" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div 
          className="w-[90vw] sm:w-[380px] h-[500px] bg-white rounded-2xl border border-gray-100 flex flex-col soft-shadow animate-fade-in overflow-hidden"
          id="ai-chat-panel"
        >
          {/* Header */}
          <div className="bg-brand-blue text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold font-sans flex items-center gap-1.5">
                  🤖 SahibHoomi AI Assistant
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                </h4>
                <p className="text-[10px] text-blue-200">
                  {lang === "hi" ? "बोलें या लिखें — जमीन खोजें" : "Speak or write — Find Property"}
                </p>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="text-blue-200 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Subtext info bar */}
          <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center gap-1.5">
            <Sparkles size={12} className="text-brand-orange" />
            <span className="text-[10px] font-bold text-brand-orange">
              {lang === "hi" 
                ? "1% पारदर्शी कमीशन पर खेतों और मकानों की सुरक्षित डील्स" 
                : "1% Transparent Commission Farmland & Home Deals"}
            </span>
          </div>

          {/* Message Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-bg-secondary">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                {/* Text bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed font-semibold soft-shadow ${
                    msg.sender === "user"
                      ? "bg-brand-orange text-white rounded-tr-none"
                      : "bg-white text-text-primary border border-gray-100 rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Recommended Properties Row */}
                {msg.recommendedProperties && msg.recommendedProperties.length > 0 && (
                  <div className="w-full mt-3 overflow-x-auto py-1 flex gap-3 scrollbar-none snap-x">
                    {msg.recommendedProperties.map((prop) => (
                      <div 
                        key={prop.id}
                        className="bg-white rounded-lg border border-gray-100 p-2 soft-shadow flex-shrink-0 w-44 snap-start hover:border-brand-orange"
                      >
                        <img 
                          src={prop.images[0]} 
                          alt={prop.title}
                          className="h-20 w-full object-cover rounded"
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-[10px] font-bold text-text-primary mt-1 line-clamp-1">
                          {lang === "hi" ? prop.title : prop.title_en}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-brand-orange font-bold">
                            {formatPrice(prop.price)}
                          </span>
                          <span className="text-[9px] font-medium text-text-muted">
                            {prop.location.split(",")[0]}
                          </span>
                        </div>
                        <Link 
                          to={`/property/${prop.id}`} 
                          onClick={() => setIsOpen(false)}
                          className="mt-2 block text-center bg-brand-blue text-white text-[9px] font-bold py-1 rounded"
                        >
                          {lang === "hi" ? "विवरण देखें" : "View Details"}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <span className="text-[9px] text-text-muted mt-1 px-1 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {/* AI Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-text-muted text-xs font-semibold pl-2">
                <Bot size={14} className="text-brand-orange animate-bounce" />
                <span>{lang === "hi" ? "एआई सहायक सोच रहा है..." : "SahibHoomi is typing..."}</span>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 flex items-center gap-2 bg-white">
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                isListening 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              title={isListening ? "Listening..." : "Click to speak"}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={lang === "hi" ? "बजट, इलाका या जमीन टाइप करें..." : "Enter budget, area or category..."}
              className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:border-brand-orange focus:bg-white transition-all"
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 bg-brand-blue text-white rounded-xl hover:bg-opacity-95 disabled:bg-gray-200 disabled:text-gray-400 transition-colors cursor-pointer flex items-center justify-center"
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
