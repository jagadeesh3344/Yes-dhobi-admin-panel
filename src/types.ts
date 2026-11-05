export type OrderStatus =
  | 'Pending Pickup'
  | 'Assigned'
  | 'Picked Up'
  | 'In Laundry'
  | 'Washing'
  | 'Ironing'
  | 'Quality Check'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderLegRider {
  id?: string;
  displayId?: string;
  name: string;
  phone?: string;
  vehicle?: string;
  vehiclePlate?: string;
}

export interface OrderVendorInfo {
  id?: string;
  displayId?: string;
  registrationId?: string;
  name: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  location?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  customerId?: string;
  customerDisplayId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;

  // Vendor Hub
  vendorId?: string;
  vendorDisplayId?: string;
  partnerName: string;
  vendorDetails?: OrderVendorInfo;

  // Leg 1: Pickup Rider (Customer -> Vendor)
  pickupRiderId?: string;
  pickupRiderDisplayId?: string;
  pickupRiderName?: string;
  pickupRiderPhone?: string;
  pickupRiderDetails?: OrderLegRider;
  pickedUpAt?: string;
  pickupArrivedAt?: string;

  // Leg 2: Delivery Rider (Vendor -> Customer)
  deliveryRiderId?: string;
  deliveryRiderDisplayId?: string;
  deliveryRiderName?: string;
  deliveryRiderPhone?: string;
  deliveryRiderDetails?: OrderLegRider;
  deliveryArrivedAt?: string;
  deliveredAt?: string;

  // Active / General Rider
  riderName: string;
  riderDetails?: OrderLegRider;

  // Service & Items
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

  // 4 Handoff Security OTPs
  otps?: {
    customerPickup?: string;
    vendorDrop?: string;
    vendorHandover?: string;
    customerDelivery?: string;
  };

  // Timeline events
  events?: Array<{
    id?: string;
    type?: string;
    status?: string;
    title: string;
    description?: string;
    createdAt?: string;
  }>;
}

export interface Customer {
  id: string;
  displayId?: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  walletBalance: number;
  status: 'Active' | 'Inactive' | 'VIP';
  address: string;
  city: string;
  pincode?: string;
  registeredDate: string;
  lastOrderDate?: string;
}

export interface Vendor {
  id: string;
  displayId?: string;
  registrationId?: string;
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
  lat?: number;
  lng?: number;
  exactShopLocation?: string;
}

export interface Rider {
  id: string;
  displayId?: string;
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
  documents?: Record<string, string>;
  drivingLicenseNumber?: string;
  onboardingStatus?: string;
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
  riderId?: string;
  vendorId?: string;
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
