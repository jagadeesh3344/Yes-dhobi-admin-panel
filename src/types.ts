export type OrderStatus =
  | 'Pending Pickup'
  | 'Assigned'
  | 'In Laundry'
  | 'Washing'
  | 'Ironing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  partnerName: string;
  riderName: string;
  serviceName: string;
  itemsCount: number;
  itemDetails?: string;
  amount: number;
  status: OrderStatus;
  pickupDate: string;
  createdAt: string;
  deliveryDate?: string;
  paymentMethod: 'UPI' | 'Card' | 'COD' | 'Wallet';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  walletBalance: number;
  status: 'Active' | 'Inactive' | 'VIP';
  address: string;
  city: string;
  registeredDate: string;
  lastOrderDate?: string;
}

export interface Vendor {
  id: string;
  name: string;
  owner: string;
  phone: string;
  location: string;
  zone: string;
  capacityPerDay: number;
  activeOrders: number;
  commissionRate: number;
  status: 'Active' | 'Pending Verification' | 'Suspended';
  rating: number;
  totalRevenue: number;
  joinedDate: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  vehicle: 'Electric Bike' | 'Scooter' | 'Bicycle' | 'Van';
  vehiclePlate?: string;
  zone: string;
  status: 'Online' | 'Offline' | 'On Delivery';
  totalDeliveries: number;
  rating: number;
  weeklyEarnings: number;
  currentLat?: number;
  currentLng?: number;
  activeOrderId?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  ratePerKgOrItem: number;
  rateUnit: '/kg' | '/item' | '/spot';
  leadTimeHours: number;
  status: 'Active' | 'Inactive';
  iconName: string;
  description: string;
}

export interface SurchargeRule {
  id: string;
  rule: string;
  trigger: string;
  modifier: string;
  status: 'Active' | 'Inactive';
}

export interface Promotion {
  code: string;
  title: string;
  type: 'Percentage' | 'Flat' | 'Free Delivery';
  discountValue: number;
  minOrder: number;
  usedCount: number;
  maxUses: number | 'Unlimited';
  validity: string;
  status: 'Active' | 'Expired' | 'Scheduled';
  description?: string;
}

export interface VerificationItem {
  id: string;
  name: string;
  type: 'Vendor' | 'Rider';
  phone: string;
  submittedDate: string;
  docs: string[];
  status: 'Pending Review' | 'Approved' | 'Rejected';
  docUrls?: { [key: string]: string };
  rejectionReason?: string;
  idNumber?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  by: string;
  role: 'Customer' | 'Vendor' | 'Rider';
  priority: 'High' | 'Medium' | 'Low';
  category: 'Damage' | 'Delay' | 'Payout' | 'App Bug' | 'Refund' | 'Delivery' | 'Quality';
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
  messages: { sender: string; text: string; time: string; isStaff?: boolean }[];
}

export interface PayoutRecord {
  id: string;
  recipient: string;
  type: 'Vendor' | 'Rider';
  amount: number;
  status: 'Processed' | 'Pending' | 'Failed';
  date: string;
  method: string;
  accountNumber?: string;
}

export interface PlatformSettings {
  brandName: string;
  supportEmail: string;
  operatingHours: string;
  vendorCommissionRate: number;
  riderBaseFee: number;
  riderPerKmRate: number;
  minOrderForFreePickup: number;
  maintenanceMode: boolean;
  riderOutOfServiceAlert: boolean;
  smsNotificationsOnDelivery: boolean;
  activeServiceZones: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'order' | 'rider' | 'vendor' | 'support' | 'system';
  read: boolean;
}
