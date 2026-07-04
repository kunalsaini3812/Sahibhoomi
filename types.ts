export type PropertyType = 'khet' | 'makan' | 'plot' | 'dukan';

export interface SellerInfo {
  name: string;
  initials: string;
  email: string;
  phone?: string;
}

export interface Property {
  id: string;
  type: PropertyType;
  title: string;
  title_en: string;
  location: string;
  price: number; // in Rupees
  area: string; // e.g. "2 Bigha Pucca" or "1800 sq ft"
  description: string;
  description_en?: string;
  seller: SellerInfo;
  verified: boolean;
  features: string[];
  khasra?: string; // for Khet
  bhk?: string; // for Makan
  floors?: string; // for Makan/Dukan
  age?: string; // for Makan
  facing?: string; // for Plot/Makan
  rent?: number; // for Dukan
  images: string[];
  status: 'active' | 'pending' | 'removed';
  datePosted: string;
  reportedBy?: string[]; // user emails/ids who reported
}

export type UserRole = 'buyer' | 'seller' | 'broker' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string; // Gmail is the primary login
  phone?: string; // keep optional phone number option
  role: UserRole;
  areaOfOperation?: string; // for brokers/users
  yearsOfExperience?: number; // for brokers
  agreementAccepted?: boolean;
  agreementDate?: string;
  status: 'active' | 'blocked';
  joinedDate: string;
  listingsCount?: number;
}

export interface ChatMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  roomId: string;
  propertyId: string;
  propertyTitle: string;
  buyerEmail: string;
  sellerEmail: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

export interface PropertyReport {
  id: string;
  propertyId: string;
  propertyTitle: string;
  reporterEmail: string;
  reason: string;
  date: string;
}

export interface AdminStats {
  totalProperties: number;
  totalUsers: number;
  pendingApprovals: number;
  reportedPropertiesCount: number;
}
