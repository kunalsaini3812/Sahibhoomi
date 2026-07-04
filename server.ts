import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import AdmZip from "adm-zip";
import { Property, UserProfile, ChatRoom, PropertyReport, ChatMessage } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to persistent data
const DB_FILE = path.join(process.cwd(), "database.json");

// Helper to mask 10-digit phone numbers in chat messages
function maskText(text: string): string {
  const phoneRegex = /(\+91[\s-]?)?[6-9]\d{9}/g;
  return text.replace(phoneRegex, "📵 [नंबर छुपाया गया / Number Hidden]");
}

// Initial seed properties
const initialProperties: Property[] = [
  {
    id: "p001",
    type: "khet",
    title: "उपजाऊ कृषि भूमि — उझानी रोड",
    title_en: "Fertile Agricultural Land — Ujhani Road",
    location: "Ujhani, Budaun",
    price: 4500000,
    area: "2 Bigha Pucca",
    description: "नहर के किनारे स्थित उपजाऊ कृषि भूमि। ट्यूबवेल सुविधा उपलब्ध। कागजात साफ। रजिस्ट्री तुरंत।",
    seller: { name: "Sunil Pratap", initials: "SP", email: "sunil@gmail.com", phone: "9876543210" },
    verified: true,
    features: ["Tube-well", "Canal Irrigation", "Road Access"],
    khasra: "Khasra No. 445/2",
    images: ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600"],
    status: "active",
    datePosted: "2026-06-25T10:00:00Z"
  },
  {
    id: "p002",
    type: "makan",
    title: "लग्जरी 4BHK विला — सिविल लाइंस",
    title_en: "Luxury 4BHK Villa — Civil Lines",
    location: "Civil Lines, Budaun",
    price: 12000000,
    area: "2200 sq ft",
    description: "सिविल लाइंस में प्रीमियम 4BHK विला। मॉड्यूलर किचन, 3 बाथरूम, पार्किंग, 24 घंटे पानी।",
    seller: { name: "Rajesh Kumar", initials: "RK", email: "rajesh@gmail.com", phone: "8123456789" },
    verified: true,
    features: ["4 Beds", "3 Baths", "Parking", "Modular Kitchen", "Power Backup"],
    bhk: "4 BHK",
    floors: "2",
    age: "2 years",
    facing: "East",
    images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600"],
    status: "active",
    datePosted: "2026-06-26T14:30:00Z"
  },
  {
    id: "p003",
    type: "dukan",
    title: "कॉर्नर मार्केट शॉप — मुख्य बाजार",
    title_en: "Corner Market Shop — Main Market",
    location: "Civil Lines, Budaun",
    price: 8500000,
    area: "400 sq ft",
    description: "मुख्य बाजार में कोने की दुकान। उच्च ग्राहक आवाजाही। बिजली और पानी की सुविधा मौजूद।",
    seller: { name: "Mohd. Yusuf", initials: "MY", email: "yusuf@gmail.com", phone: "7012345678" },
    verified: true,
    features: ["Corner Location", "High Footfall", "Electricity Ready"],
    floors: "1",
    rent: 25000,
    images: ["https://images.unsplash.com/photo-1604754742629-3e5728249d73?w=600"],
    status: "active",
    datePosted: "2026-06-24T09:15:00Z"
  },
  {
    id: "p004",
    type: "plot",
    title: "प्रीमियम कॉर्नर प्लॉट — सिविल लाइंस",
    title_en: "Premium Corner Plot — Civil Lines",
    location: "Civil Lines, Budaun",
    price: 4500000,
    area: "1800 sq ft",
    description: "सिविल लाइंस में कोने का प्रीमियम प्लॉट। मकान निर्माण के लिए तुरंत उपयुक्त। चौड़ी सड़क से लगा हुआ।",
    seller: { name: "Vikas Singh", initials: "VS", email: "vikas@gmail.com", phone: "9023456781" },
    verified: true,
    features: ["North-East Facing", "Main Road Touch", "Electricity Ready", "Gated Community"],
    facing: "North-East",
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"],
    status: "active",
    datePosted: "2026-06-27T11:00:00Z"
  },
  {
    id: "p005",
    type: "khet",
    title: "सिंचित खेत — दातागंज",
    title_en: "Irrigated Farmland — Dataganj",
    location: "Dataganj, Budaun",
    price: 3200000,
    area: "3 Bigha Kachcha",
    description: "दातागंज में सिंचित खेत। बोरिंग और ट्यूबवेल मौजूद। रोड से सटा हुआ, रजिस्ट्री तैयार।",
    seller: { name: "Ram Kishan", initials: "RK", email: "ramkishan@gmail.com", phone: "9134567890" },
    verified: false,
    features: ["Boring Available", "Road Accessible"],
    khasra: "Khasra No. 129",
    images: ["https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600"],
    status: "active",
    datePosted: "2026-06-23T16:20:00Z"
  },
  {
    id: "p006",
    type: "makan",
    title: "सस्ता 2BHK मकान — दातागंज",
    title_en: "Affordable 2BHK Home — Dataganj",
    location: "Dataganj, Budaun",
    price: 3500000,
    area: "1000 sq ft",
    description: "दातागंज में शानदार बजट फ्रेंडली 2BHK घर। हवादार और मुख्य सड़क के नजदीक।",
    seller: { name: "Mohit Gupta", initials: "MG", email: "mohit@gmail.com", phone: "9567891234" },
    verified: true,
    features: ["2 Beds", "2 Baths", "Electricity Ready", "Water Connection"],
    bhk: "2 BHK",
    floors: "1",
    age: "5 years",
    facing: "West",
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600"],
    status: "active",
    datePosted: "2026-06-28T08:00:00Z"
  },
  {
    id: "p007",
    type: "khet",
    title: "विशाल कछार कृषि क्षेत्र — बिसौली",
    title_en: "Huge Agricultural Farm — Bisauli",
    location: "Bisauli, Budaun",
    price: 7500000,
    area: "5 Bigha Pucca",
    description: "आलू, गेहूं और गन्ने की बंपर पैदावार के लिए विख्यात क्षेत्र। पानी की उत्तम बोरिंग सुविधा।",
    seller: { name: "Pradeep Yadav", initials: "PY", email: "pradeep@gmail.com", phone: "9654321789" },
    verified: true,
    features: ["Tube-well", "Road Access", "Fencing Done"],
    khasra: "Khasra No. 811",
    images: ["https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600"],
    status: "active",
    datePosted: "2026-06-28T12:00:00Z"
  },
  {
    id: "p008",
    type: "dukan",
    title: "किराने या शोरूम की दुकान — सहसवान",
    title_en: "Retail/Showroom Shop — Sahaswan",
    location: "Sahaswan, Budaun",
    price: 4800000,
    area: "350 sq ft",
    description: "सहसवान मुख्य रोड पर स्थित। रिटेल बिजनेस, कपड़ों के शोरूम या बैंक के लिए सर्वोत्तम स्थान।",
    seller: { name: "Suresh Gupta", initials: "SG", email: "suresh@gmail.com", phone: "9412345678" },
    verified: false,
    features: ["Main Road Touch", "Water Facility", "Glass Front"],
    floors: "1",
    images: ["https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600"],
    status: "active",
    datePosted: "2026-06-27T15:45:00Z"
  },
  {
    id: "p009",
    type: "plot",
    title: "उझानी हाईवे के पास आवासीय प्लाट",
    title_en: "Residential Plot near Ujhani Highway",
    location: "Ujhani, Budaun",
    price: 2200000,
    area: "1200 sq ft",
    description: "उझानी नेशनल हाईवे के अत्यंत निकट। पॉश कॉलोनी, पानी और पक्की बिजली लाइनों की सुविधा।",
    seller: { name: "Anil Saxena", initials: "AS", email: "anil@gmail.com", phone: "9876123450" },
    verified: true,
    features: ["Gated Colony", "Highway Proximity", "Drainage System"],
    facing: "South",
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"],
    status: "active",
    datePosted: "2026-06-28T10:10:00Z"
  }
];

// Initial seed users
const initialUsers: UserProfile[] = [
  {
    id: "u_admin",
    name: "SahibHoomi Admin",
    email: "sahibhoomi_admin",
    role: "admin",
    status: "active",
    joinedDate: "2025-01-01T00:00:00Z"
  },
  {
    id: "u001",
    name: "Sunil Pratap",
    email: "sunil@gmail.com",
    phone: "9876543210",
    role: "seller",
    status: "active",
    joinedDate: "2025-06-15T00:00:00Z"
  },
  {
    id: "u002",
    name: "Rajesh Kumar",
    email: "rajesh@gmail.com",
    phone: "8123456789",
    role: "seller",
    status: "active",
    joinedDate: "2025-06-16T00:00:00Z"
  },
  {
    id: "u003",
    name: "Sanjay Mishra",
    email: "sanjay@gmail.com",
    phone: "7456789123",
    role: "broker",
    areaOfOperation: "Civil Lines, Budaun",
    yearsOfExperience: 6,
    agreementAccepted: true,
    agreementDate: "2026-06-10T11:00:00Z",
    status: "active",
    joinedDate: "2026-06-10T10:00:00Z"
  },
  {
    id: "u004",
    name: "Arun Saxena",
    email: "arun@gmail.com",
    phone: "9312345678",
    role: "buyer",
    status: "active",
    joinedDate: "2026-06-20T10:00:00Z"
  }
];

// Load or initialize DB state
let dbState: {
  properties: Property[];
  users: UserProfile[];
  chats: ChatRoom[];
  reports: PropertyReport[];
  failedAttempts: { [ip: string]: { count: number; lockoutUntil: string } };
} = {
  properties: initialProperties,
  users: initialUsers,
  chats: [
    {
      roomId: "room_p001_arun",
      propertyId: "p001",
      propertyTitle: "उपजाऊ कृषि भूमि — उझानी रोड",
      buyerEmail: "arun@gmail.com",
      sellerEmail: "sunil@gmail.com",
      lastUpdated: "2026-06-28T22:00:00Z",
      messages: [
        {
          id: "m1",
          senderEmail: "arun@gmail.com",
          senderName: "Arun Saxena",
          senderRole: "buyer",
          text: "राम राम सुनील जी, क्या यह खेत अभी बिकाऊ है? मेरा फोन नंबर 9312345678 है।",
          timestamp: "2026-06-28T21:45:00Z"
        },
        {
          id: "m2",
          senderEmail: "sunil@gmail.com",
          senderName: "Sunil Pratap",
          senderRole: "seller",
          text: "राम राम अरुण जी। हाँ, खेत बिकाऊ है। आप बदायूँ में कहाँ रहते हैं? मेरा संपर्क नंबर 9876543210 है।",
          timestamp: "2026-06-28T22:00:00Z"
        }
      ]
    }
  ],
  reports: [],
  failedAttempts: {}
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, "utf-8");
      const loaded = JSON.parse(fileData);
      dbState = { ...dbState, ...loaded };
      console.log("Database successfully loaded from " + DB_FILE);
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error("Failed to load database. Falling back to memory state:", err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write database file:", err);
  }
}

loadDatabase();

// ----------------------------------------------------
// ----------------------------------------------------
// DIRECT PROJECT ZIP DOWNLOAD
// ----------------------------------------------------
app.get("/api/download-project", (req, res) => {
  try {
    const zip = new AdmZip();
    const rootDir = process.cwd();

    const addDirectoryToZip = (localPath: string, zipPath: string) => {
      const items = fs.readdirSync(localPath);
      for (const item of items) {
        const fullPath = path.join(localPath, item);
        const itemZipPath = zipPath ? `${zipPath}/${item}` : item;

        // Skip folders/files we don't want in the zip
        if (
          item === "node_modules" ||
          item === "dist" ||
          item === ".git" ||
          item === ".env" ||
          item === ".env.production" ||
          item === "database.json"
        ) {
          continue;
        }

        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          addDirectoryToZip(fullPath, itemZipPath);
        } else {
          // In adm-zip, the second argument is the folder path inside the zip
          zip.addLocalFile(fullPath, zipPath);
        }
      }
    };

    addDirectoryToZip(rootDir, "");

    const zipBuffer = zip.toBuffer();

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=sahibhoomi-project.zip");
    res.send(zipBuffer);
  } catch (err: any) {
    console.error("Failed to generate zip:", err);
    res.status(500).json({ error: "Failed to generate ZIP", details: err.message });
  }
});

// AUTH ENDPOINTS (GMAIL-BASED & SIMULATED OTP)
// ----------------------------------------------------

// OTP Store (temporary verification in-memory)
const activeOtps: { [email: string]: { otp: string; expiresAt: number; tempProfile?: Partial<UserProfile> } } = {};

// Send OTP
app.post("/api/auth/login-email", (req, res) => {
  const { email, role, name, phone, areaOfOperation, yearsOfExperience } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email/Gmail address is required" });
  }

  // Check if blocked
  const user = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user && user.status === "blocked") {
    return res.status(403).json({ error: "यह खाता सुरक्षा कारणों से निलंबित कर दिया गया है। / This account has been suspended." });
  }

  // Create mock OTP code: universal '1234' plus a custom code
  const generatedOtp = "1234"; // Universal mock OTP requested by user

  // Set expiry (10 mins)
  activeOtps[email.toLowerCase()] = {
    otp: generatedOtp,
    expiresAt: Date.now() + 10 * 60 * 1000,
    tempProfile: {
      name: name || "",
      phone: phone || "",
      role: role || "buyer",
      areaOfOperation: areaOfOperation || "",
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : undefined
    }
  };

  console.log(`[EMAIL OTP TRIGGERED] For email: ${email} -> Mock OTP is ${generatedOtp}`);

  return res.json({
    success: true,
    message: "OTP sent to your Gmail address. For demo/preview, use OTP: 1234",
    otpHint: "1234"
  });
});

// Verify OTP
app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  const otpData = activeOtps[email.toLowerCase()];
  if (!otpData) {
    return res.status(400).json({ error: "Please request an OTP first." });
  }

  if (otpData.expiresAt < Date.now()) {
    delete activeOtps[email.toLowerCase()];
    return res.status(400).json({ error: "OTP expired. Please try again." });
  }

  // Check OTP
  if (otp !== "1234" && otp !== otpData.otp) {
    return res.status(400).json({ error: "invalid OTP. Use '1234' for demo verification." });
  }

  // Login/Signup Successful
  let user = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    // Perform signup
    const temp = otpData.tempProfile || {};
    user = {
      id: "u_" + Math.random().toString(36).substr(2, 9),
      name: temp.name || email.split("@")[0],
      email: email.toLowerCase(),
      phone: temp.phone || "",
      role: temp.role || "buyer",
      areaOfOperation: temp.areaOfOperation || "",
      yearsOfExperience: temp.yearsOfExperience || undefined,
      agreementAccepted: temp.role === "broker" ? true : undefined,
      agreementDate: temp.role === "broker" ? new Date().toISOString() : undefined,
      status: "active",
      joinedDate: new Date().toISOString()
    };
    dbState.users.push(user);
    saveDatabase();
  } else {
    // If logging in, double check block status
    if (user.status === "blocked") {
      return res.status(403).json({ error: "यह खाता निलंबित कर दिया गया है। / This account is blocked." });
    }
  }

  // Clean OTP
  delete activeOtps[email.toLowerCase()];

  return res.json({
    success: true,
    token: "mock-jwt-token-for-" + user.id,
    user
  });
});

// ----------------------------------------------------
// PROPERTIES API
// ----------------------------------------------------

// Get listings
app.get("/api/listings", (req, res) => {
  const listings = dbState.properties.filter(p => p.status === "active" || p.status === "pending");
  res.json(listings);
});

// Add new property
app.post("/api/listings", (req, res) => {
  const { type, title, title_en, location, price, area, description, seller, features, khasra, bhk, floors, age, facing, rent, images } = req.body;
  
  if (!type || !title || !location || !price || !area || !seller || !seller.email) {
    return res.status(400).json({ error: "Required fields are missing." });
  }

  const newProperty: Property = {
    id: "p_" + Math.random().toString(36).substr(2, 9),
    type,
    title,
    title_en: title_en || title,
    location,
    price: parseFloat(price),
    area,
    description,
    seller,
    verified: false, // pending admin verification
    features: features || [],
    khasra,
    bhk,
    floors,
    age,
    facing,
    rent: rent ? parseFloat(rent) : undefined,
    images: images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600"],
    status: "pending", // must be approved by admin
    datePosted: new Date().toISOString()
  };

  dbState.properties.unshift(newProperty);
  saveDatabase();

  res.status(201).json(newProperty);
});

// Delete property
app.delete("/api/listings/:id", (req, res) => {
  const { id } = req.params;
  const index = dbState.properties.findIndex(p => p.id === id);
  if (index !== -1) {
    dbState.properties[index].status = "removed";
    saveDatabase();
    return res.json({ success: true, message: "Listing deleted" });
  }
  res.status(404).json({ error: "Property not found" });
});

// Report property
app.post("/api/listings/:id/report", (req, res) => {
  const { id } = req.params;
  const { email, reason } = req.body;
  if (!email || !reason) {
    return res.status(400).json({ error: "Reporter email and reason required" });
  }

  const property = dbState.properties.find(p => p.id === id);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  // Initialize reported list
  if (!property.reportedBy) {
    property.reportedBy = [];
  }
  if (!property.reportedBy.includes(email)) {
    property.reportedBy.push(email);
  }

  const report: PropertyReport = {
    id: "rep_" + Math.random().toString(36).substr(2, 9),
    propertyId: id,
    propertyTitle: property.title,
    reporterEmail: email,
    reason,
    date: new Date().toISOString()
  };

  dbState.reports.push(report);
  saveDatabase();

  res.json({ success: true, message: "Property reported successfully" });
});

// ----------------------------------------------------
// CHAT API
// ----------------------------------------------------

// Get chat rooms or create one
app.get("/api/chats", (req, res) => {
  const { email, role } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email query parameter required" });
  }

  let filteredRooms = [];
  if (role === "admin") {
    filteredRooms = dbState.chats;
  } else {
    // Return rooms where user is either buyer or seller
    filteredRooms = dbState.chats.filter(
      r => r.buyerEmail.toLowerCase() === (email as string).toLowerCase() || 
           r.sellerEmail.toLowerCase() === (email as string).toLowerCase()
    );
  }

  // Mask phone numbers for non-admin requests
  const returnedRooms = JSON.parse(JSON.stringify(filteredRooms)).map((room: ChatRoom) => {
    room.messages = room.messages.map((m: ChatMessage) => {
      if (role !== "admin") {
        m.text = maskText(m.text);
      }
      return m;
    });
    return room;
  });

  res.json(returnedRooms);
});

// Get room by ID
app.get("/api/chats/room/:roomId", (req, res) => {
  const { roomId } = req.params;
  const { role } = req.query;
  const room = dbState.chats.find(r => r.roomId === roomId);
  if (!room) {
    return res.status(404).json({ error: "Chat room not found" });
  }

  // Mask messages for non-admin
  const roomCopy = JSON.parse(JSON.stringify(room));
  roomCopy.messages = roomCopy.messages.map((m: ChatMessage) => {
    if (role !== "admin") {
      m.text = maskText(m.text);
    }
    return m;
  });

  res.json(roomCopy);
});

// Send a message
app.post("/api/chats/room", (req, res) => {
  const { propertyId, propertyTitle, buyerEmail, sellerEmail, text, senderEmail, senderName, senderRole } = req.body;
  if (!propertyId || !buyerEmail || !sellerEmail || !text || !senderEmail) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  // Find or create room
  const roomId = `room_${propertyId}_${buyerEmail.split("@")[0]}`;
  let room = dbState.chats.find(r => r.roomId === roomId);

  if (!room) {
    room = {
      roomId,
      propertyId,
      propertyTitle,
      buyerEmail,
      sellerEmail,
      messages: [],
      lastUpdated: new Date().toISOString()
    };
    dbState.chats.push(room);
  }

  const newMessage: ChatMessage = {
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    senderEmail,
    senderName,
    senderRole,
    text, // store raw text (unmasked) in DB so admin can see it
    timestamp: new Date().toISOString()
  };

  room.messages.push(newMessage);
  room.lastUpdated = new Date().toISOString();
  saveDatabase();

  // Return the masked version for the client UI response
  const responseMsg = { ...newMessage, text: maskText(newMessage.text) };
  res.json({ success: true, message: responseMsg, roomId });
});

// ----------------------------------------------------
// ADMIN ACTIONS (CRUD, LOCKOUTS, CHATS)
// ----------------------------------------------------

// Admin Rate Limit Simulation
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || "unknown_ip";

  const lockout = dbState.failedAttempts[ip];
  if (lockout && new Date(lockout.lockoutUntil) > new Date()) {
    const minLeft = Math.ceil((new Date(lockout.lockoutUntil).getTime() - Date.now()) / 60000);
    return res.status(429).json({
      error: `बहुत सारे असफल प्रयास। कृपया ${minLeft} मिनट बाद प्रयास करें। / Too many failed attempts. Try after ${minLeft} minutes.`
    });
  }

  if (username === "sahibhoomi_admin" && password === "Admin@SahibHoomi2025#") {
    // Reset IP lockout
    delete dbState.failedAttempts[ip];
    saveDatabase();

    const adminUser = dbState.users.find(u => u.role === "admin") || {
      id: "u_admin",
      name: "SahibHoomi Admin",
      email: "sahibhoomi_admin",
      role: "admin",
      status: "active",
      joinedDate: new Date().toISOString()
    };

    return res.json({
      success: true,
      token: "mock-jwt-admin-token",
      user: adminUser
    });
  } else {
    // Log failed attempt
    if (!dbState.failedAttempts[ip]) {
      dbState.failedAttempts[ip] = { count: 1, lockoutUntil: new Date().toISOString() };
    } else {
      dbState.failedAttempts[ip].count += 1;
    }

    if (dbState.failedAttempts[ip].count >= 5) {
      const lockDuration = 30 * 60 * 1000; // 30 mins
      dbState.failedAttempts[ip].lockoutUntil = new Date(Date.now() + lockDuration).toISOString();
      saveDatabase();
      return res.status(429).json({
        error: "सुरक्षा कारणों से 30 मिनट के लिए लॉक किया गया। / Suspended for 30 minutes due to 5 failed attempts."
      });
    }

    saveDatabase();
    return res.status(401).json({
      error: `गलत क्रेडेंशियल। प्रयास शेष: ${5 - dbState.failedAttempts[ip].count} / Invalid credentials. Attempts remaining: ${5 - dbState.failedAttempts[ip].count}`
    });
  }
});

// Get all properties (all statuses for admin)
app.get("/api/admin/properties", (req, res) => {
  res.json(dbState.properties);
});

// Approve Property
app.post("/api/admin/properties/:id/approve", (req, res) => {
  const { id } = req.params;
  const property = dbState.properties.find(p => p.id === id);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  property.status = "active";
  property.verified = true;
  saveDatabase();
  res.json({ success: true, property });
});

// Remove Property
app.post("/api/admin/properties/:id/remove", (req, res) => {
  const { id } = req.params;
  const property = dbState.properties.find(p => p.id === id);
  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  property.status = "removed";
  saveDatabase();
  res.json({ success: true, property });
});

// Bulk action: Remove selected
app.post("/api/admin/properties/bulk-remove", (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "Invalid IDs parameter" });
  }

  dbState.properties = dbState.properties.map(p => {
    if (ids.includes(p.id)) {
      p.status = "removed";
    }
    return p;
  });

  saveDatabase();
  res.json({ success: true, message: "Bulk properties removed" });
});

// Admin stats
app.get("/api/admin/stats", (req, res) => {
  const stats = {
    totalProperties: dbState.properties.filter(p => p.status !== "removed").length,
    totalUsers: dbState.users.filter(u => u.role !== "admin").length,
    pendingApprovals: dbState.properties.filter(p => p.status === "pending").length,
    reportedPropertiesCount: dbState.reports.length
  };
  res.json(stats);
});

// Get all users
app.get("/api/admin/users", (req, res) => {
  // Count user listings
  const usersWithCounts = dbState.users.map(u => {
    const listingsCount = dbState.properties.filter(p => p.seller.email === u.email && p.status !== "removed").length;
    return { ...u, listingsCount };
  });
  res.json(usersWithCounts);
});

// Block User
app.post("/api/admin/users/:email/block", (req, res) => {
  const { email } = req.params;
  const user = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.status = "blocked";
  
  // Also soft-remove user's properties
  dbState.properties = dbState.properties.map(p => {
    if (p.seller.email.toLowerCase() === email.toLowerCase()) {
      p.status = "removed";
    }
    return p;
  });

  saveDatabase();
  res.json({ success: true, user });
});

// Unblock User
app.post("/api/admin/users/:email/unblock", (req, res) => {
  const { email } = req.params;
  const user = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  user.status = "active";
  saveDatabase();
  res.json({ success: true, user });
});

// Get all brokers
app.get("/api/admin/brokers", (req, res) => {
  const brokers = dbState.users.filter(u => u.role === "broker");
  res.json(brokers);
});

// Suspend/approve broker
app.post("/api/admin/brokers/:email/status", (req, res) => {
  const { email } = req.params;
  const { status } = req.body; // 'active' or 'blocked'
  const user = dbState.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === "broker");
  if (!user) {
    return res.status(404).json({ error: "Broker not found" });
  }

  user.status = status;
  saveDatabase();
  res.json({ success: true, broker: user });
});

// Get all reports
app.get("/api/admin/reports", (req, res) => {
  res.json(dbState.reports);
});

// ----------------------------------------------------
// AI CHATBOT ROUTE (SERVER-SIDE GEMINI API)
// ----------------------------------------------------

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required for chatbot integration.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

app.post("/api/ai-chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const ai = getAiClient();
    
    // Construct active listings info context to feed to AI
    const activeListings = dbState.properties.filter(p => p.status === "active");
    const listingsContext = activeListings.map(p => {
      return `ID: ${p.id}, Category: ${p.type}, Title: ${p.title} (${p.title_en}), Area: ${p.area}, Location: ${p.location}, Price: ₹${p.price.toLocaleString("en-IN")}, Features: ${p.features.join(", ")}`;
    }).join("\n");

    const systemPrompt = `You are SahibHoomi's property assistant for Budaun district, Uttar Pradesh. You help users find properties (Khet/खेत, Makan/मकान, Plot/प्लॉट, Dukan/दुकान) in Budaun areas including Civil Lines, Ujhani, Dataganj, Bisauli, Faridpur, Islamnagar, Wazirganj, Gunnaur, Saidpur, Sahaswan, Kakrala, Bilsi.
Commission is 1% each from buyer and seller (1% + 1%).
Answer in Hindi (using Devanagari script) or in helpful Hinglish when appropriate. Be highly concise, polite, and friendly.

Here are the currently available properties in Budaun on our SahibHoomi platform:
${listingsContext}

Always guide users based on these properties.
If they ask about a location, budget, or type, help filter these properties and mention the specific details like Title, Area, and Price.
If you suggest any properties, end your response with listing their IDs in square brackets like [p001, p002] so our system can render beautiful UI cards for them.`;

    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const botText = response.text || "";

    // Extract property recommendations in square brackets e.g. [p001, p002]
    const idRegex = /\[(p[a-zA-Z0-9_]+(,\s*p[a-zA-Z0-9_]+)*)\]/g;
    const match = idRegex.exec(botText);
    let recommendedIds: string[] = [];
    if (match && match[1]) {
      recommendedIds = match[1].split(",").map(id => id.trim());
    }

    // Also fuzzy search based on text keywords if AI missed direct bracket matches
    if (recommendedIds.length === 0) {
      const lowerMsg = message.toLowerCase();
      dbState.properties.forEach(p => {
        if (p.status === "active") {
          const locLower = p.location.toLowerCase();
          const titleLower = p.title.toLowerCase();
          const typeLower = p.type.toLowerCase();
          
          if (
            (lowerMsg.includes(typeLower) || (typeLower === "khet" && (lowerMsg.includes("खेत") || lowerMsg.includes("agriculture"))) || (typeLower === "makan" && (lowerMsg.includes("मकान") || lowerMsg.includes("घर") || lowerMsg.includes("home"))) || (typeLower === "plot" && (lowerMsg.includes("प्लॉट") || lowerMsg.includes("plot"))) || (typeLower === "dukan" && (lowerMsg.includes("दुकान") || lowerMsg.includes("shop")))) &&
            (lowerMsg.includes(locLower.split(",")[0].trim()) || lowerMsg.includes("budaun") || lowerMsg.includes("बदायूँ"))
          ) {
            if (recommendedIds.length < 3) {
              recommendedIds.push(p.id);
            }
          }
        }
      });
    }

    const recommendedProperties = dbState.properties.filter(p => recommendedIds.includes(p.id) && p.status === "active");

    return res.json({
      text: botText,
      recommendedProperties
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      error: "Gemini API error occurred: " + error.message,
      text: "माफ़ कीजियेगा, एआई सहायक वर्तमान में व्यस्त है। कृपया पुनः प्रयास करें। (AI Assistant is currently busy. Please try again.)"
    });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER & STATIC ASSETS
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} with NODE_ENV=${process.env.NODE_ENV}`);
  });
}

startServer();
