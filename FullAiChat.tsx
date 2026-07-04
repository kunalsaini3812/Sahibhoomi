import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../context/PropertiesContext";
import { Property } from "../types";
import { Bot, Send, Mic, MicOff, Sparkles, MessageSquare, Compass, Sliders, ArrowUpRight } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  recommendedProperties?: Property[];
  timestamp: Date;
}

export default function FullAiChat() {
  const { lang, t } = useLanguage();
  const { formatPrice } = useProperties();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Suggested preset questions
  const presetQuestions = lang === "hi" ? [
    "उझानी में २ बीघा खेत चाहिए १० लाख तक",
    "सिविल लाइंस बदायूँ में ३ BHK मकान दिखाएं",
    "दातागंज में ५० गज का दुकान चाहिए",
    "Faridpur में खाली प्लॉट की क्या कीमत है?"
  ] : [
    "Need 2 bigha khet in Ujhani under 10 Lakh",
    "Show me 3 BHK houses in Civil Lines Budaun",
    "Need 50 Gaj shop in Dataganj",
    "What is the price of vacant plot in Faridpur?"
  ];

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = lang === "hi" ? "hi-IN" : "en-IN";

      rec.onresult = (event: any) => {
        setInputValue(event.results[0][0].transcript);
        setIsListening(false);
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
    }
  }, [lang]);

  // Set greeting message
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = lang === "hi" 
        ? "राम राम साहिब! मैं सहीभूमि एआई सहायक हूँ। बदायूँ जिला (उत्तर प्रदेश) में खेतों, मकानों, प्लॉटों और दुकानों की पारदर्शी डील्स खोजने में मैं आपकी सहायता करूँगा। अपनी ज़रूरत टाइप करें या बोलें।"
        : "Ram Ram! I am the Sahibhoomi AI Assistant. I will help you discover verified farmlands, homes, plots, or shops in Budaun District, UP. Simply enter your budget or location to start.";
      
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

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    // Add user message to log
    const newUserMsg: ChatMessage = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const historyPayload = messages.slice(1).map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text
      }));

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, history: historyPayload })
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
            ? "माफ़ कीजियेगा, नेटवर्क विफलता के कारण मैं उत्तर देने में असमर्थ हूँ। कृपया पुनः प्रयास करें।"
            : "Apologies, I am experiencing a temporary connection failure. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleVoice = () => {
    if (!recognitionRef.current) {
      alert(lang === "hi" ? "आपका ब्राउज़र वॉयस इनपुट का समर्थन नहीं करता है।" : "Web Speech API is unsupported.");
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

  return (
    <div className="flex-1 bg-bg-secondary py-10 px-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]" id="full-ai-chat-page">
      
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 bg-white p-4 rounded-t-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-md">
            <Bot size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-hindi text-text-primary leading-tight">
              🤖 सहीभूमि एआई सहायक (Sahibhoomi AI Assistant)
            </h1>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
              Powered by Gemini 3.5 Flash
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex bg-orange-100 text-brand-orange text-[10px] font-bold px-3.5 py-1 rounded-full select-none uppercase tracking-wider">
          ⚡ 100% Secure Farmland Searching
        </span>
      </div>

      {/* Main Chat Conversation Wrapper */}
      <div className="flex-1 bg-white border-x border-gray-100 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            <span className="text-[9px] text-text-muted font-bold px-1.5 mb-0.5">
              {msg.sender === "user" ? (lang === "hi" ? "आप" : "You") : "SahibHoomi AI"}
            </span>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs font-semibold leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-brand-orange text-white rounded-tr-none"
                  : "bg-white border border-gray-100 text-text-primary rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>

            {/* Recommended properties grid row */}
            {msg.recommendedProperties && msg.recommendedProperties.length > 0 && (
              <div className="w-full mt-4 overflow-x-auto py-2 flex gap-4 scrollbar-none snap-x max-w-full">
                {msg.recommendedProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-md flex-shrink-0 w-52 snap-start hover:border-brand-orange transition-all"
                  >
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="h-24 w-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <h4 className="text-[11px] font-bold text-text-primary mt-2 line-clamp-1 font-hindi">
                      {lang === "hi" ? prop.title : prop.title_en}
                    </h4>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold text-brand-orange">{formatPrice(prop.price)}</span>
                      <span className="text-[10px] text-text-muted font-bold">{prop.location.split(",")[0]}</span>
                    </div>
                    <Link
                      to={`/property/${prop.id}`}
                      className="mt-3 block text-center bg-brand-blue text-white text-[10px] font-bold py-2 rounded-lg hover:bg-opacity-95"
                    >
                      संपत्ति विवरण देखें →
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <span className="text-[8px] text-text-muted font-mono mt-1 px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold pl-2 animate-pulse">
            <Bot size={16} className="text-brand-orange" />
            <span>एआई उत्तर लिख रहा है...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested chips panel */}
      {messages.length <= 1 && (
        <div className="bg-white px-4 py-3 border-x border-t border-gray-100 flex flex-wrap gap-2 items-center justify-center">
          <span className="text-[10px] text-text-muted font-bold uppercase select-none mr-2">त्वरित विकल्प / Suggested:</span>
          {presetQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputValue(q);
                handleSendMessage(q);
              }}
              className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-orange text-[10px] font-bold rounded-lg border border-orange-100 cursor-pointer transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Footer text-voice send bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
          setInputValue("");
        }}
        className="bg-white p-4 rounded-b-xl border border-gray-100 flex items-center gap-3 shadow-sm"
      >
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-3 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
            isListening ? "bg-red-500 text-white animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
          title="Click to Speak"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={lang === "hi" ? "जैसे: 'दातागंज में खेती की जमीन'..." : "Type search query..."}
          className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-orange text-text-primary focus:bg-white"
        />

        <button
          type="submit"
          disabled={!inputValue.trim() || isTyping}
          className="px-5 py-3 bg-brand-orange text-white rounded-xl hover:bg-opacity-95 disabled:bg-gray-200 disabled:text-gray-400 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Send size={16} />
          <span className="hidden sm:inline">पूछें / Ask</span>
        </button>
      </form>

    </div>
  );
}
