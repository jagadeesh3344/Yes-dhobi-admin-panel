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
  return {
    id: o.displayId ?? `#${o.orderNumber}`,
    customerName: o.customerName ?? o.customer?.name ?? '',
    customerPhone: o.customerPhone ?? o.customer?.phone ?? '',
    customerAddress: o.customerAddress ?? o.address?.line ?? '',
    partnerName: o.partnerName ?? o.vendor?.name ?? '',
    riderName: o.riderName || 'Unassigned',
    serviceName: o.serviceSummary ?? '',
    itemsCount: o.itemsCount ?? 0,
    itemDetails: o.itemsDescription ?? '',
    amount: Number(o.amount ?? o.pricing?.total ?? 0),
    status: (o.statusLabel ?? title(o.status)) as OrderStatus,
    pickupDate: `${fmtDate(o.pickupDate)}${o.pickupSlot ? `, ${o.pickupSlot}` : ''}`,
    createdAt: o.createdAt,
    deliveryDate: o.deliveredAt ? fmtDateTime(o.deliveredAt) : o.deliveryEta ? fmtDateTime(o.deliveryEta) : undefined,
    paymentMethod: PAY_METHOD_LABEL[o.paymentMethod] ?? 'COD',
    paymentStatus: PAY_STATUS_LABEL[o.paymentStatus] ?? 'Pending',
    notes: o.notes ?? undefined,
  };
}

export function toCustomer(c: Rec): Customer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? '',
    email: c.email ?? '',
    totalOrders: c.totalOrders ?? 0,
    walletBalance: Number(c.walletBalance ?? 0),
    status: c.status ?? 'Active',
    address: c.address ?? '',
    city: c.city ?? '',
    registeredDate: fmtDate(c.registeredDate),
    lastOrderDate: c.lastOrderDate ? fmtDate(c.lastOrderDate) : undefined,
  };
}

export function toVendor(v: Rec): Vendor {
  return {
    id: v.id,
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
  };
}

export function toRider(r: Rec): Rider {
  return {
    id: r.id,
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
    docUrls: v.docUrls ?? undefined,
    rejectionReason: v.rejectionReason ?? undefined,
    idNumber: v.idNumber ?? undefined,
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
  const copy = ['customerName', 'customerPhone', 'customerAddress', 'partnerName', 'riderName', 'serviceName', 'itemsCount', 'itemDetails', 'amount', 'status', 'pickupDate', 'deliveryDate', 'paymentMethod', 'paymentStatus', 'notes'] as const;
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
  if (c.address && c.city) out.address = { line1: c.address, city: c.city, pincode: '000000' };
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
