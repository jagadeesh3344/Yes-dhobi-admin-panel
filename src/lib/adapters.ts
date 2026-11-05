/**
 * Maps backend responses onto the panel's `types.ts` shapes and the panel's
 * form payloads back onto backend request bodies.
 */
import type {
  Customer,
  NotificationItem,
  Order,
  OrderStatus,
  PayoutRecord,
  PlatformSettings,
  Promotion,
  Rider,
  ServiceCategory,
  SupportTicket,
  SurchargeRule,
  Vendor,
  VerificationItem,
} from '@/types';
import { formatCustomerDisplayId, formatVendorDisplayId, formatRiderDisplayId } from './idUtils';

type Rec = Record<string, any>;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const today = new Date();
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  if (sameDay(d, today)) return `Today, ${time}`;
  if (sameDay(d, tomorrow)) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}, ${time}`;
}

export function fmtDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const title = (s: string) => s.toLowerCase().split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

// ---------------------------------------------------------------------------
// API -> panel
// ---------------------------------------------------------------------------

const PAY_METHOD_LABEL: Record<string, Order['paymentMethod']> = { UPI: 'UPI', CARD: 'Card', COD: 'COD', WALLET: 'Wallet' };
const PAY_STATUS_LABEL: Record<string, Order['paymentStatus']> = { PAID: 'Paid', PENDING: 'Pending', REFUNDED: 'Refunded', FAILED: 'Pending' };

export function toOrder(o: Rec): Order {
  const customerId = o.customer?.id ?? o.customerId;
  const vendorId = o.vendor?.id ?? o.vendorId;
  const pickupRiderId = o.pickupRider?.id ?? o.pickupRiderId;
  const deliveryRiderId = o.deliveryRider?.id ?? o.deliveryRiderId;

  return {
    id: o.displayId ?? (o.orderNumber ? `#${o.orderNumber}` : (o.id || '#pending')),
    orderNumber: o.orderNumber ? String(o.orderNumber) : (o.id || ''),
    customerId,
    customerDisplayId: customerId ? formatCustomerDisplayId(customerId) : undefined,
    customerName: o.customerName ?? o.customer?.name ?? 'Customer',
    customerPhone: o.customerPhone ?? o.customer?.phone ?? '',
    customerAddress: o.customerAddress ?? o.address?.line ?? '',

    vendorId,
    vendorDisplayId: vendorId ? formatVendorDisplayId(vendorId, o.vendor?.registrationId) : undefined,
    partnerName: o.partnerName ?? o.vendor?.name ?? 'Not Assigned',
    vendorDetails: o.vendor
      ? {
          id: o.vendor.id,
          displayId: formatVendorDisplayId(o.vendor.id, o.vendor.registrationId),
          registrationId: o.vendor.registrationId,
          name: o.vendor.name ?? o.partnerName ?? '',
          ownerName: o.vendor.ownerName,
          phone: o.vendor.phone,
          address: o.vendor.address,
        }
      : undefined,

    // Leg 1: Pickup Rider (Customer -> Vendor)
    pickupRiderId,
    pickupRiderDisplayId: pickupRiderId ? formatRiderDisplayId(pickupRiderId) : undefined,
    pickupRiderName: o.pickupRider?.name ?? o.pickupRiderName ?? (o.pickupRider ? 'Assigned' : 'Unassigned'),
    pickupRiderPhone: o.pickupRider?.phone ?? o.pickupRiderPhone,
    pickupRiderDetails: o.pickupRider
      ? {
          id: o.pickupRider.id,
          displayId: formatRiderDisplayId(o.pickupRider.id),
          name: o.pickupRider.name,
          phone: o.pickupRider.phone,
          vehicle: o.pickupRider.vehicleType,
          vehiclePlate: o.pickupRider.vehicleNumber,
        }
      : undefined,
    pickedUpAt: o.pickedUpAt ? fmtDateTime(o.pickedUpAt) : undefined,
    pickupArrivedAt: o.pickupArrivedAt ? fmtDateTime(o.pickupArrivedAt) : undefined,

    // Leg 2: Delivery Rider (Vendor -> Customer)
    deliveryRiderId,
    deliveryRiderDisplayId: deliveryRiderId ? formatRiderDisplayId(deliveryRiderId) : undefined,
    deliveryRiderName: o.deliveryRider?.name ?? o.deliveryRiderName ?? (o.deliveryRider ? 'Assigned' : 'Unassigned'),
    deliveryRiderPhone: o.deliveryRider?.phone ?? o.deliveryRiderPhone,
    deliveryRiderDetails: o.deliveryRider
      ? {
          id: o.deliveryRider.id,
          displayId: formatRiderDisplayId(o.deliveryRider.id),
          name: o.deliveryRider.name,
          phone: o.deliveryRider.phone,
          vehicle: o.deliveryRider.vehicleType,
          vehiclePlate: o.deliveryRider.vehicleNumber,
        }
      : undefined,
    deliveryArrivedAt: o.deliveryArrivedAt ? fmtDateTime(o.deliveryArrivedAt) : undefined,
    deliveredAt: o.deliveredAt ? fmtDateTime(o.deliveredAt) : undefined,

    // Active / General Rider
    riderName: o.rider?.name ?? o.riderName ?? o.pickupRider?.name ?? o.deliveryRider?.name ?? 'Unassigned',
    riderDetails: o.rider
      ? {
          id: o.rider.id,
          displayId: formatRiderDisplayId(o.rider.id),
          name: o.rider.name,
          phone: o.rider.phone,
          vehicle: o.rider.vehicleType,
          vehiclePlate: o.rider.vehicleNumber,
        }
      : undefined,

    serviceName: o.serviceSummary ?? o.serviceName ?? 'Wash & Iron',
    itemsCount: o.itemsCount ?? 0,
    itemDetails: o.itemsDescription ?? o.itemDetails ?? '',
    amount: Number(o.amount ?? o.pricing?.total ?? 0),
    status: (o.statusLabel ?? (o.status ? title(o.status) : 'Pending Pickup')) as OrderStatus,
    pickupDate: `${fmtDate(o.pickupDate)}${o.pickupSlot ? `, ${o.pickupSlot}` : ''}`,
    createdAt: o.createdAt ?? new Date().toISOString(),
    deliveryDate: o.deliveredAt ? fmtDateTime(o.deliveredAt) : o.deliveryEta ? fmtDateTime(o.deliveryEta) : undefined,
    paymentMethod: PAY_METHOD_LABEL[o.paymentMethod] ?? 'COD',
    paymentStatus: PAY_STATUS_LABEL[o.paymentStatus] ?? 'Pending',
    notes: o.notes ?? undefined,

    otps: o.otps
      ? {
          customerPickup: o.otps.customerPickup ?? o.otps.pickup,
          vendorDrop: o.otps.vendorDrop ?? o.otps.riderDrop,
          vendorHandover: o.otps.vendorHandover ?? o.otps.riderHandover,
          customerDelivery: o.otps.customerDelivery ?? o.otps.delivery,
        }
      : undefined,

    events: Array.isArray(o.events)
      ? o.events.map((e: Rec) => ({
          id: e.id,
          type: e.type,
          status: e.status,
          title: e.title ?? '',
          description: e.description,
          createdAt: fmtDateTime(e.createdAt),
        }))
      : undefined,
  };
}

export function toCustomer(c: Rec): Customer {
  return {
    id: c.id,
    displayId: c.displayId ?? formatCustomerDisplayId(c.id),
    name: c.name,
    phone: c.phone ?? '',
    email: c.email ?? '',
    totalOrders: c.totalOrders ?? 0,
    walletBalance: Number(c.walletBalance ?? 0),
    status: c.status ?? 'Active',
    address: c.address ?? '',
    city: c.city ?? '',
    pincode: (c.pincode as string) ?? '',
    registeredDate: fmtDate(c.registeredDate),
    lastOrderDate: c.lastOrderDate ? fmtDate(c.lastOrderDate) : undefined,
  };
}

export function toVendor(v: Rec): Vendor {
  return {
    id: v.id,
    displayId: v.displayId ?? formatVendorDisplayId(v.id, v.registrationId),
    registrationId: v.registrationId,
    name: v.name,
    owner: v.owner ?? '',
    phone: v.phone ?? '',
    location: v.location ?? '',
    zone: v.zone ?? '',
    capacityPerDay: v.capacityPerDay ?? 0,
    activeOrders: v.activeOrders ?? 0,
    commissionRate: v.commissionRate ?? 0,
    status: v.status ?? 'Pending Verification',
    rating: v.rating ?? 0,
    totalRevenue: Number(v.totalRevenue ?? 0),
    joinedDate: fmtDate(v.joinedDate),
    lat: typeof v.latitude === 'number' ? v.latitude : (typeof v.lat === 'number' ? v.lat : undefined),
    lng: typeof v.longitude === 'number' ? v.longitude : (typeof v.lng === 'number' ? v.lng : undefined),
    exactShopLocation: v.exactShopLocation ?? v.shopAddress ?? undefined,
  };
}

export function toRider(r: Rec): Rider {
  const docs = (r.documents ?? r.fullDocuments ?? {}) as Record<string, string>;
  return {
    id: r.id,
    displayId: r.displayId ?? formatRiderDisplayId(r.id),
    name: r.name,
    phone: r.phone ?? '',
    vehicle: (r.vehicle === 'Motorcycle' ? 'Scooter' : r.vehicle) as Rider['vehicle'],
    vehiclePlate: r.vehiclePlate ?? undefined,
    zone: r.zone ?? '',
    status: r.status ?? 'Offline',
    totalDeliveries: r.totalDeliveries ?? 0,
    rating: r.rating ?? 0,
    weeklyEarnings: Number(r.weeklyEarnings ?? 0),
    currentLat: r.currentLat ?? undefined,
    currentLng: r.currentLng ?? undefined,
    activeOrderId: r.activeOrderId ?? undefined,
    documents: docs,
    drivingLicenseNumber: r.drivingLicenseNumber as string | undefined,
    onboardingStatus: r.onboardingStatus as string | undefined,
  };
}

export function toService(s: Rec): ServiceCategory {
  return {
    id: String(s.id),
    name: s.name,
    ratePerKgOrItem: Number(s.ratePerKgOrItem ?? s.basePrice ?? 0),
    rateUnit: s.rateUnit ?? '/item',
    leadTimeHours: s.leadTimeHours ?? 24,
    status: s.status ?? 'Active',
    iconName: s.iconName ?? 'Shirt',
    description: s.description ?? '',
  };
}

export function toSurcharge(r: Rec): SurchargeRule {
  return { id: r.id, rule: r.rule ?? r.name, trigger: r.trigger ?? r.description ?? '', modifier: r.modifier, status: r.status ?? 'Active' };
}

export function toPromotion(p: Rec): Promotion {
  return {
    code: p.code,
    title: p.title,
    type: p.type,
    discountValue: Number(p.discountValue ?? 0),
    minOrder: Number(p.minOrder ?? 0),
    usedCount: p.usedCount ?? 0,
    maxUses: p.maxUses === 'Unlimited' || p.maxUses == null ? 'Unlimited' : Number(p.maxUses),
    validity: fmtDate(p.validUntil ?? p.validity),
    status: p.status === 'Disabled' ? 'Expired' : (p.status ?? 'Active'),
    description: p.description ?? undefined,
  };
}

export function toVerification(v: Rec): VerificationItem {
  return {
    id: v.id,
    name: v.name,
    type: v.type,
    phone: v.phone ?? '',
    submittedDate: fmtDate(v.submittedDate),
    docs: v.docs ?? [],
    status: v.status ?? 'Pending Review',
    docUrls: (v.docUrls ?? v.documents ?? {}) as Record<string, string>,
    rejectionReason: v.rejectionReason ?? undefined,
    idNumber: v.idNumber ?? undefined,
    riderId: v.riderId ?? undefined,
    vendorId: v.vendorId ?? undefined,
  };
}

const CATEGORY_LABEL: Record<string, SupportTicket['category']> = {
  DAMAGE: 'Damage',
  DELAY: 'Delay',
  PAYOUT: 'Payout',
  APP_BUG: 'App Bug',
  REFUND: 'Refund',
  DELIVERY: 'Delivery',
  QUALITY: 'Quality',
  OTHER: 'App Bug',
};

export function toTicket(t: Rec): SupportTicket {
  return {
    id: t.ticketNumber ?? t.id,
    subject: t.subject,
    by: t.by ?? t.createdBy?.name ?? '',
    role: (t.role ?? 'Customer') as SupportTicket['role'],
    priority: title(t.priority) as SupportTicket['priority'],
    category: CATEGORY_LABEL[t.category] ?? 'App Bug',
    status: title(t.status) as SupportTicket['status'],
    createdAt: t.createdAt,
    messages: (t.messages ?? []).map((m: Rec) => ({ sender: m.sender ?? m.senderName, text: m.text, time: fmtDateTime(m.time ?? m.createdAt), isStaff: m.isStaff })),
  };
}

export function toPayout(p: Rec): PayoutRecord {
  return {
    id: p.payoutNumber ?? p.id,
    recipient: p.recipient,
    type: p.type,
    amount: Number(p.amount ?? 0),
    status: p.status,
    date: fmtDate(p.date),
    method: p.method,
    accountNumber: p.accountNumber ?? undefined,
  };
}

export function toSettings(s: Rec): PlatformSettings {
  return {
    brandName: s.brandName,
    supportEmail: s.supportEmail,
    operatingHours: s.operatingHours,
    vendorCommissionRate: s.vendorCommissionRate,
    riderBaseFee: s.riderBaseFee,
    riderPerKmRate: s.riderPerKmRate,
    minOrderForFreePickup: s.minOrderForFreePickup,
    maintenanceMode: s.maintenanceMode,
    riderOutOfServiceAlert: s.riderOutOfServiceAlert,
    smsNotificationsOnDelivery: s.smsNotificationsOnDelivery,
    activeServiceZones: s.activeServiceZones ?? [],
  };
}

export function toNotification(n: Rec): NotificationItem {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    time: timeAgo(n.createdAt),
    type: (String(n.type ?? 'system').toLowerCase() as NotificationItem['type']) ?? 'system',
    read: Boolean(n.read),
  };
}

export interface ZoneItem {
  id: string;
  name: string;
  city: string;
  status: 'Operational' | 'Paused';
}

export function toZone(z: Rec): ZoneItem {
  return { id: String(z.id), name: z.name, city: z.city, status: z.isActive ? 'Operational' : 'Paused' };
}

// ---------------------------------------------------------------------------
// panel -> API
// ---------------------------------------------------------------------------

/** "1.5x Multiplier" | "Flat ₹50 Surcharge" | "10% Discount" -> kind/value */
export function parseModifier(modifier: string): { kind: 'MULTIPLIER' | 'FLAT' | 'PERCENT_DISCOUNT'; value: number } {
  const m = modifier.trim();
  const x = /([\d.]+)\s*x/i.exec(m);
  if (x) return { kind: 'MULTIPLIER', value: Number(x[1]) };
  const pct = /([\d.]+)\s*%/.exec(m);
  if (pct) return { kind: 'PERCENT_DISCOUNT', value: Number(pct[1]) };
  const flat = /([\d.]+)/.exec(m.replace(/,/g, ''));
  return { kind: 'FLAT', value: flat ? Number(flat[1]) : 0 };
}

export function inferCondition(trigger: string): 'EXPRESS_SELECTED' | 'SUNDAY_PICKUP' | 'WEIGHT_OVER' | 'HOLIDAY' | 'ALWAYS' {
  const t = trigger.toLowerCase();
  if (t.includes('express') || t.includes('checkout')) return 'EXPRESS_SELECTED';
  if (t.includes('sunday')) return 'SUNDAY_PICKUP';
  if (t.includes('weight') || t.includes('kg')) return 'WEIGHT_OVER';
  if (t.includes('holiday') || t.includes('festival')) return 'HOLIDAY';
  return 'ALWAYS';
}

export function surchargeToApi(rule: Partial<SurchargeRule>) {
  const out: Rec = {};
  if (rule.rule !== undefined) out.name = rule.rule;
  if (rule.trigger !== undefined) {
    out.description = rule.trigger;
    out.condition = inferCondition(rule.trigger);
    if (out.condition === 'WEIGHT_OVER') out.threshold = Number(/(\d+)\s*kg/i.exec(rule.trigger)?.[1] ?? 10);
  }
  if (rule.modifier !== undefined) Object.assign(out, parseModifier(rule.modifier));
  if (rule.status !== undefined) out.isActive = rule.status === 'Active';
  return out;
}

/** "30 Days" | "2026-12-31" | "31 Dec 2026" -> ISO date */
export function parseValidity(v?: string): string | undefined {
  if (!v) return undefined;
  const days = /(\d+)\s*day/i.exec(v);
  if (days) return new Date(Date.now() + Number(days[1]) * 86400_000).toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date(Date.now() + 30 * 86400_000).toISOString() : d.toISOString();
}

export function promotionToApi(p: Partial<Promotion>) {
  const out: Rec = {};
  if (p.code !== undefined) out.code = p.code;
  if (p.title !== undefined) out.title = p.title;
  if (p.description !== undefined) out.description = p.description;
  if (p.type !== undefined) out.type = p.type;
  if (p.discountValue !== undefined) out.discountValue = Number(p.discountValue);
  if (p.minOrder !== undefined) out.minOrder = Number(p.minOrder);
  if (p.maxUses !== undefined) out.maxUses = p.maxUses === 'Unlimited' ? 'Unlimited' : Number(p.maxUses);
  if (p.validity !== undefined) out.validUntil = parseValidity(p.validity);
  if (p.status !== undefined) out.isActive = p.status !== 'Expired';
  return out;
}

export function serviceToApi(s: Partial<ServiceCategory>) {
  const out: Rec = {};
  if (s.name !== undefined) out.name = s.name;
  if (s.description !== undefined) out.description = s.description;
  if (s.ratePerKgOrItem !== undefined) out.ratePerKgOrItem = Number(s.ratePerKgOrItem);
  if (s.rateUnit !== undefined) out.rateUnit = s.rateUnit;
  if (s.leadTimeHours !== undefined) out.leadTimeHours = Number(s.leadTimeHours);
  if (s.iconName !== undefined) out.iconName = s.iconName;
  if (s.status !== undefined) out.status = s.status;
  return out;
}

export function orderToApi(o: Partial<Order>) {
  const out: Rec = {};
  const copy = [
    'customerName',
    'customerPhone',
    'customerAddress',
    'partnerName',
    'riderName',
    'serviceName',
    'itemsCount',
    'itemDetails',
    'amount',
    'status',
    'pickupDate',
    'deliveryDate',
    'paymentMethod',
    'paymentStatus',
    'notes',
    'vendorId',
    'pickupRiderId',
    'deliveryRiderId',
  ] as const;
  for (const k of copy) if (o[k] !== undefined) out[k] = o[k];
  return out;
}

export function customerToApi(c: Partial<Customer>) {
  const out: Rec = {};
  if (c.name !== undefined) out.name = c.name;
  if (c.phone !== undefined) out.phone = c.phone;
  if (c.email !== undefined && c.email !== '') out.email = c.email;
  if (c.status !== undefined) {
    out.tier = c.status === 'VIP' ? 'VIP' : 'REGULAR';
    out.status = c.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE';
  }
  if (c.city !== undefined) out.city = c.city;
  if (c.walletBalance !== undefined) out.walletBalance = Number(c.walletBalance);
  if (c.pincode !== undefined) out.pincode = c.pincode;
  if (c.address !== undefined) {
    out.address = {
      line1: c.address,
      city: c.city || 'Hyderabad',
      pincode: c.pincode && /^\d{6}$/.test(c.pincode) ? c.pincode : '500013',
    };
  }
  return out;
}

export function vendorToApi(v: Partial<Vendor>) {
  const out: Rec = {};
  if (v.name !== undefined) out.name = v.name;
  if (v.owner !== undefined) out.owner = v.owner;
  if (v.phone !== undefined) out.phone = v.phone;
  if (v.location !== undefined) {
    out.location = v.location;
    out.city = v.location.split(',').pop()?.trim() || 'Bangalore';
  }
  if (v.zone !== undefined) out.zone = v.zone.split(',')[0]?.trim();
  if (v.capacityPerDay !== undefined) out.capacityPerDay = Number(v.capacityPerDay);
  if (v.commissionRate !== undefined) out.commissionRate = Number(v.commissionRate);
  if (v.status !== undefined) out.status = v.status;
  if (v.lat !== undefined) out.latitude = v.lat;
  if (v.lng !== undefined) out.longitude = v.lng;
  return out;
}

export function riderToApi(r: Partial<Rider>) {
  const out: Rec = {};
  if (r.name !== undefined) out.name = r.name;
  if (r.phone !== undefined) out.phone = r.phone;
  if (r.vehicle !== undefined) out.vehicle = r.vehicle;
  if (r.vehiclePlate !== undefined) out.vehiclePlate = r.vehiclePlate;
  if (r.zone !== undefined) out.zone = r.zone.split(',')[0]?.trim();
  if (r.status !== undefined) out.status = r.status;
  return out;
}
