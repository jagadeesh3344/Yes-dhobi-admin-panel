import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import {
  Order,
  Customer,
  Vendor,
  Rider,
  ServiceCategory,
  SurchargeRule,
  Promotion,
  VerificationItem,
  SupportTicket,
  PayoutRecord,
  PlatformSettings,
  NotificationItem,
  OrderStatus,
} from '@/types';
import { useToast } from './ToastContext';
import { api, API_ORIGIN, ApiError, enc, getAll, loginAdmin, logoutAdmin, tokenStore, type AdminUser } from '@/lib/api';
import {
  customerToApi,
  orderToApi,
  promotionToApi,
  riderToApi,
  serviceToApi,
  surchargeToApi,
  toCustomer,
  toNotification,
  toOrder,
  toPayout,
  toPromotion,
  toRider,
  toService,
  toSettings,
  toSurcharge,
  toTicket,
  toVendor,
  toVerification,
  toZone,
  vendorToApi,
  type ZoneItem,
} from '@/lib/adapters';

/**
 * All panel data now comes from the Yes Dhobi API (see src/lib/api.ts).
 * The context keeps the same shape the pages already use; every mutation
 * calls the backend and then refreshes the affected list. Live updates
 * arrive over Socket.IO ("Live" toggle in the header).
 */

const emptySettings: PlatformSettings = {
  brandName: 'Yes Dhobi',
  supportEmail: '',
  operatingHours: '',
  vendorCommissionRate: 20,
  riderBaseFee: 40,
  riderPerKmRate: 5,
  minOrderForFreePickup: 120,
  maintenanceMode: false,
  riderOutOfServiceAlert: true,
  smsNotificationsOnDelivery: true,
  activeServiceZones: [],
};

interface DataContextType {
  orders: Order[];
  customers: Customer[];
  vendors: Vendor[];
  riders: Rider[];
  services: ServiceCategory[];
  surcharges: SurchargeRule[];
  promotions: Promotion[];
  verifications: VerificationItem[];
  tickets: SupportTicket[];
  payouts: PayoutRecord[];
  settings: PlatformSettings;
  notifications: NotificationItem[];
  zones: ZoneItem[];
  isLoading: boolean;
  loadError: string | null;
  reload: () => Promise<void>;

  // Auth
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Realtime ("Live" indicator in the header)
  isLiveSimulationActive: boolean;
  setIsLiveSimulationActive: (active: boolean | ((prev: boolean) => boolean)) => void;

  // Order Operations
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  assignRiderToOrder: (orderId: string, riderName: string) => void;
  assignPartnerToOrder: (orderId: string, partnerName: string) => void;
  deleteOrder: (id: string) => void;

  // Customer Operations
  addCustomer: (customer: Omit<Customer, 'id' | 'registeredDate'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Vendor Operations
  addVendor: (vendor: Omit<Vendor, 'id' | 'joinedDate'>) => Vendor;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  toggleVendorStatus: (id: string) => void;
  deleteVendor: (id: string) => void;

  // Rider Operations
  addRider: (rider: Omit<Rider, 'id'>) => Rider;
  updateRider: (id: string, updates: Partial<Rider>) => void;
  toggleRiderStatus: (id: string) => void;
  deleteRider: (id: string) => void;

  // Services & Pricing Operations
  addService: (service: Omit<ServiceCategory, 'id'>) => ServiceCategory;
  updateService: (id: string, updates: Partial<ServiceCategory>) => void;
  toggleServiceStatus: (id: string) => void;
  deleteService: (id: string) => void;

  // Surcharge Operations
  addSurcharge: (rule: Omit<SurchargeRule, 'id'>) => SurchargeRule;
  updateSurcharge: (id: string, updates: Partial<SurchargeRule>) => void;
  toggleSurchargeStatus: (id: string) => void;
  deleteSurcharge: (id: string) => void;

  // Promotions Operations
  addPromotion: (promo: Promotion) => void;
  updatePromotion: (code: string, updates: Partial<Promotion>) => void;
  togglePromotionStatus: (code: string) => void;
  deletePromotion: (code: string) => void;

  // Verifications Operations
  approveVerification: (id: string) => void;
  rejectVerification: (id: string, reason?: string) => void;

  // Support Operations
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt'>) => SupportTicket;
  replyTicket: (id: string, text: string) => void;
  updateTicketStatus: (id: string, status: 'Open' | 'In Progress' | 'Resolved') => void;
  updateTicketPriority: (id: string, priority: 'High' | 'Medium' | 'Low') => void;

  // Payout Operations
  processPayout: (id: string) => void;
  createPayout: (payout: Omit<PayoutRecord, 'id' | 'date'>) => PayoutRecord;

  // Settings & System Operations
  updateSettings: (updates: Partial<PlatformSettings>) => void;
  addZone: (zone: { name: string; city: string; status: 'Operational' | 'Paused' }) => void;
  toggleZoneStatus: (id: string) => void;
  removeZone: (id: string) => void;
  broadcast: (input: { targetAudience: string; priority: string; title: string; message: string }) => Promise<number>;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToFactoryDemo: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [surcharges, setSurcharges] = useState<SurchargeRule[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(emptySettings);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => tokenStore.user);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(tokenStore.access));
  const [isLiveSimulationActive, setIsLiveSimulationActive] = useState<boolean>(true);
  const socketRef = useRef<Socket | null>(null);

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  const fail = useCallback(
    (title: string, err: unknown) => {
      const message = err instanceof ApiError ? err.message : (err as Error)?.message ?? 'Unexpected error';
      showToast(title, message, 'error');
    },
    [showToast],
  );

  const refreshOrders = useCallback(async () => setOrders((await getAll<Record<string, unknown>>('/admin/orders')).map(toOrder)), []);
  const refreshCustomers = useCallback(async () => setCustomers((await getAll<Record<string, unknown>>('/admin/customers')).map(toCustomer)), []);
  const refreshVendors = useCallback(async () => setVendors((await getAll<Record<string, unknown>>('/admin/vendors')).map(toVendor)), []);
  const refreshRiders = useCallback(async () => setRiders((await getAll<Record<string, unknown>>('/admin/riders')).map(toRider)), []);
  const refreshServices = useCallback(async () => setServices((await api.get<{ data: Record<string, unknown>[] }>('/admin/services')).data.map(toService)), []);
  const refreshSurcharges = useCallback(async () => setSurcharges((await api.get<{ data: Record<string, unknown>[] }>('/admin/surcharges')).data.map(toSurcharge)), []);
  const refreshPromotions = useCallback(async () => setPromotions((await api.get<{ data: Record<string, unknown>[] }>('/admin/promotions')).data.map(toPromotion)), []);
  const refreshVerifications = useCallback(async () => setVerifications((await getAll<Record<string, unknown>>('/admin/verifications')).map(toVerification)), []);
  const refreshTickets = useCallback(async () => setTickets((await getAll<Record<string, unknown>>('/admin/tickets')).map(toTicket)), []);
  const refreshPayouts = useCallback(async () => setPayouts((await getAll<Record<string, unknown>>('/admin/payouts')).map(toPayout)), []);
  const refreshSettings = useCallback(async () => {
    const s = await api.get<Record<string, unknown>>('/admin/settings');
    setSettings(toSettings(s));
    setZones(((s.zones as Record<string, unknown>[] | undefined) ?? []).map(toZone));
  }, []);
  const refreshZones = useCallback(async () => {
    const z = await api.get<{ data: Record<string, unknown>[] }>('/admin/zones');
    setZones(z.data.map(toZone));
  }, []);
  const refreshNotifications = useCallback(async () => {
    const n = await api.get<{ data: Record<string, unknown>[] }>('/notifications?limit=50');
    setNotifications(n.data.map(toNotification));
  }, []);

  const reload = useCallback(async () => {
    if (!tokenStore.access) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      await Promise.all([
        refreshOrders(),
        refreshCustomers(),
        refreshVendors(),
        refreshRiders(),
        refreshServices(),
        refreshSurcharges(),
        refreshPromotions(),
        refreshVerifications(),
        refreshTickets(),
        refreshPayouts(),
        refreshSettings(),
        refreshNotifications(),
      ]);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load data';
      setLoadError(message);
      if (!(err instanceof ApiError && err.status === 401)) showToast('Load failed', message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [refreshOrders, refreshCustomers, refreshVendors, refreshRiders, refreshServices, refreshSurcharges, refreshPromotions, refreshVerifications, refreshTickets, refreshPayouts, refreshSettings, refreshNotifications, showToast]);

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await loginAdmin(email, password);
      setCurrentUser(user);
      setIsAuthenticated(true);
    },
    [],
  );

  const logout = useCallback(async () => {
    await logoutAdmin();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setOrders([]);
    setNotifications([]);
  }, []);

  useEffect(() => {
    const onForcedLogout = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      showToast('Session expired', 'Please sign in again.', 'info');
    };
    window.addEventListener('yd:logout', onForcedLogout);
    return () => window.removeEventListener('yd:logout', onForcedLogout);
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) void reload();
  }, [isAuthenticated, reload]);

  // ---------------------------------------------------------------------------
  // Realtime
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isAuthenticated || !isLiveSimulationActive) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }
    const socket = io(API_ORIGIN, { auth: { token: tokenStore.access }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('order:updated', (o: Record<string, unknown>) => {
      const mapped = toOrder(o);
      setOrders((prev) => {
        const idx = prev.findIndex((x) => x.id === mapped.id);
        if (idx === -1) return [mapped, ...prev];
        const next = [...prev];
        next[idx] = mapped;
        return next;
      });
    });
    socket.on('notification:new', (n: Record<string, unknown>) => {
      const item = toNotification({ id: `live-${Date.now()}`, read: false, createdAt: new Date().toISOString(), ...n });
      setNotifications((prev) => [item, ...prev].slice(0, 50));
      void refreshNotifications();
    });
    socket.on('rider:location', (p: { riderId: string; lat: number; lng: number }) => {
      setRiders((prev) => prev.map((r) => (r.id === p.riderId ? { ...r, currentLat: p.lat, currentLng: p.lng } : r)));
    });
    socket.on('rider:availability', () => void refreshRiders());
    socket.on('ticket:new', () => void refreshTickets());
    socket.on('ticket:message', () => void refreshTickets());

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, isLiveSimulationActive, refreshNotifications, refreshRiders, refreshTickets]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /** Fire an API call, refresh, and toast; pages keep their synchronous call style. */
  const run = useCallback(
    (work: () => Promise<unknown>, after: (() => Promise<unknown>)[], success?: [string, string, ('success' | 'info' | 'error')?], failTitle = 'Action failed') => {
      void (async () => {
        try {
          await work();
          await Promise.all(after.map((f) => f()));
          if (success) showToast(success[0], success[1], success[2]);
        } catch (err) {
          fail(failTitle, err);
        }
      })();
    },
    [fail, showToast],
  );

  const orderKey = (id: string) => enc(id);

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------

  const addOrder = useCallback<DataContextType['addOrder']>(
    (order) => {
      run(() => api.post('/admin/orders', orderToApi(order)), [refreshOrders, refreshCustomers], ['Order Created', `Order for ${order.customerName} has been registered.`]);
      return { ...order, id: '#pending', createdAt: new Date().toISOString() };
    },
    [run, refreshOrders, refreshCustomers],
  );

  const updateOrder = useCallback<DataContextType['updateOrder']>(
    (id, updates) => run(() => api.patch(`/admin/orders/${orderKey(id)}`, orderToApi(updates)), [refreshOrders], ['Order Updated', `Order ${id} details modified.`]),
    [run, refreshOrders],
  );

  const updateOrderStatus = useCallback<DataContextType['updateOrderStatus']>(
    (id, status) => run(() => api.post(`/admin/orders/${orderKey(id)}/status`, { status, force: true }), [refreshOrders, refreshRiders], ['Status Updated', `Order ${id} moved to "${status}".`]),
    [run, refreshOrders, refreshRiders],
  );

  const assignRiderToOrder = useCallback<DataContextType['assignRiderToOrder']>(
    (orderId, riderName) => {
      const rider = riders.find((r) => r.name === riderName);
      if (!rider) {
        showToast('Rider not found', `No rider named ${riderName}.`, 'error');
        return;
      }
      run(() => api.post(`/admin/orders/${orderKey(orderId)}/assign-rider`, { riderId: rider.id }), [refreshOrders, refreshRiders], ['Rider Assigned', `Rider ${riderName} dispatched to order ${orderId}.`]);
    },
    [riders, run, refreshOrders, refreshRiders, showToast],
  );

  const assignPartnerToOrder = useCallback<DataContextType['assignPartnerToOrder']>(
    (orderId, partnerName) => {
      const vendor = vendors.find((v) => v.name === partnerName);
      if (!vendor) {
        showToast('Vendor not found', `No laundry partner named ${partnerName}.`, 'error');
        return;
      }
      run(() => api.post(`/admin/orders/${orderKey(orderId)}/assign-vendor`, { vendorId: vendor.id }), [refreshOrders, refreshVendors], ['Vendor Assigned', `Laundry partner changed to ${partnerName}.`]);
    },
    [vendors, run, refreshOrders, refreshVendors, showToast],
  );

  const deleteOrder = useCallback<DataContextType['deleteOrder']>(
    (id) => run(() => api.delete(`/admin/orders/${orderKey(id)}`), [refreshOrders], ['Order Cancelled', `Order ${id} was cancelled.`, 'info']),
    [run, refreshOrders],
  );

  // ---------------------------------------------------------------------------
  // Customers
  // ---------------------------------------------------------------------------

  const addCustomer = useCallback<DataContextType['addCustomer']>(
    (customer) => {
      run(() => api.post('/admin/customers', customerToApi(customer)), [refreshCustomers], ['Customer Added', `${customer.name} registered.`]);
      return { ...customer, id: 'pending', registeredDate: new Date().toISOString() };
    },
    [run, refreshCustomers],
  );
  const updateCustomer = useCallback<DataContextType['updateCustomer']>(
    (id, updates) => run(() => api.patch(`/admin/customers/${id}`, customerToApi(updates)), [refreshCustomers], ['Customer Updated', 'Profile changes saved.']),
    [run, refreshCustomers],
  );
  const deleteCustomer = useCallback<DataContextType['deleteCustomer']>(
    (id) => run(() => api.delete(`/admin/customers/${id}`), [refreshCustomers], ['Customer Deactivated', 'The account can no longer sign in.', 'info']),
    [run, refreshCustomers],
  );

  // ---------------------------------------------------------------------------
  // Vendors
  // ---------------------------------------------------------------------------

  const addVendor = useCallback<DataContextType['addVendor']>(
    (vendor) => {
      run(() => api.post('/admin/vendors', vendorToApi(vendor)), [refreshVendors], ['Vendor Onboarded', `${vendor.name} is now a laundry partner. Login details were SMSed.`]);
      return { ...vendor, id: 'pending', joinedDate: new Date().toISOString() };
    },
    [run, refreshVendors],
  );
  const updateVendor = useCallback<DataContextType['updateVendor']>(
    (id, updates) => run(() => api.patch(`/admin/vendors/${id}`, vendorToApi(updates)), [refreshVendors], ['Vendor Updated', 'Partner details saved.']),
    [run, refreshVendors],
  );
  const toggleVendorStatus = useCallback<DataContextType['toggleVendorStatus']>(
    (id) => {
      const v = vendors.find((x) => x.id === id);
      if (!v) return;
      const next = v.status === 'Active' ? 'Suspended' : 'Active';
      run(() => api.patch(`/admin/vendors/${id}`, { status: next }), [refreshVendors], ['Vendor Status', `${v.name} is now ${next}.`, 'info']);
    },
    [vendors, run, refreshVendors],
  );
  const deleteVendor = useCallback<DataContextType['deleteVendor']>(
    (id) => run(() => api.delete(`/admin/vendors/${id}`), [refreshVendors], ['Vendor Deactivated', 'Partner removed from dispatch.', 'info']),
    [run, refreshVendors],
  );

  // ---------------------------------------------------------------------------
  // Riders
  // ---------------------------------------------------------------------------

  const addRider = useCallback<DataContextType['addRider']>(
    (rider) => {
      run(() => api.post('/admin/riders', riderToApi(rider)), [refreshRiders], ['Rider Onboarded', `${rider.name} added to the fleet. Login details were SMSed.`]);
      return { ...rider, id: 'pending' };
    },
    [run, refreshRiders],
  );
  const updateRider = useCallback<DataContextType['updateRider']>(
    (id, updates) => run(() => api.patch(`/admin/riders/${id}`, riderToApi(updates)), [refreshRiders], ['Rider Updated', 'Rider details saved.']),
    [run, refreshRiders],
  );
  const toggleRiderStatus = useCallback<DataContextType['toggleRiderStatus']>(
    (id) => {
      const r = riders.find((x) => x.id === id);
      if (!r) return;
      const next = r.status === 'Online' ? 'Offline' : 'Online';
      run(() => api.patch(`/admin/riders/${id}`, { status: next }), [refreshRiders], ['Rider Status', `${r.name} is now ${next}.`, 'info']);
    },
    [riders, run, refreshRiders],
  );
  const deleteRider = useCallback<DataContextType['deleteRider']>(
    (id) => run(() => api.delete(`/admin/riders/${id}`), [refreshRiders], ['Rider Deactivated', 'Rider removed from the fleet.', 'info']),
    [run, refreshRiders],
  );

  // ---------------------------------------------------------------------------
  // Services & surcharges
  // ---------------------------------------------------------------------------

  const addService = useCallback<DataContextType['addService']>(
    (service) => {
      run(() => api.post('/admin/services', serviceToApi(service)), [refreshServices], ['Service Added', `${service.name} is available to customers.`]);
      return { ...service, id: 'pending' };
    },
    [run, refreshServices],
  );
  const updateService = useCallback<DataContextType['updateService']>(
    (id, updates) => run(() => api.patch(`/admin/services/${id}`, serviceToApi(updates)), [refreshServices], ['Service Updated', 'Pricing and details saved.']),
    [run, refreshServices],
  );
  const toggleServiceStatus = useCallback<DataContextType['toggleServiceStatus']>(
    (id) => run(() => api.post(`/admin/services/${id}/toggle`), [refreshServices], ['Service Status', 'Availability toggled.', 'info']),
    [run, refreshServices],
  );
  const deleteService = useCallback<DataContextType['deleteService']>(
    (id) => run(() => api.delete(`/admin/services/${id}`), [refreshServices], ['Service Removed', 'Service deleted or deactivated.', 'info']),
    [run, refreshServices],
  );

  const addSurcharge = useCallback<DataContextType['addSurcharge']>(
    (rule) => {
      run(() => api.post('/admin/surcharges', surchargeToApi(rule)), [refreshSurcharges], ['Rule Added', `${rule.rule} is now applied at checkout.`]);
      return { ...rule, id: 'pending' };
    },
    [run, refreshSurcharges],
  );
  const updateSurcharge = useCallback<DataContextType['updateSurcharge']>(
    (id, updates) => run(() => api.patch(`/admin/surcharges/${id}`, surchargeToApi(updates)), [refreshSurcharges], ['Rule Updated', 'Surcharge rule saved.']),
    [run, refreshSurcharges],
  );
  const toggleSurchargeStatus = useCallback<DataContextType['toggleSurchargeStatus']>(
    (id) => run(() => api.post(`/admin/surcharges/${id}/toggle`), [refreshSurcharges], ['Rule Status', 'Surcharge toggled.', 'info']),
    [run, refreshSurcharges],
  );
  const deleteSurcharge = useCallback<DataContextType['deleteSurcharge']>(
    (id) => run(() => api.delete(`/admin/surcharges/${id}`), [refreshSurcharges], ['Rule Deleted', 'Surcharge rule removed.', 'info']),
    [run, refreshSurcharges],
  );

  // ---------------------------------------------------------------------------
  // Promotions
  // ---------------------------------------------------------------------------

  const addPromotion = useCallback<DataContextType['addPromotion']>(
    (promo) => run(() => api.post('/admin/promotions', promotionToApi(promo)), [refreshPromotions], ['Promotion Created', `Coupon ${promo.code} is live.`]),
    [run, refreshPromotions],
  );
  const updatePromotion = useCallback<DataContextType['updatePromotion']>(
    (code, updates) => run(() => api.patch(`/admin/promotions/${enc(code)}`, promotionToApi(updates)), [refreshPromotions], ['Promotion Updated', `Coupon ${code} saved.`]),
    [run, refreshPromotions],
  );
  const togglePromotionStatus = useCallback<DataContextType['togglePromotionStatus']>(
    (code) => run(() => api.post(`/admin/promotions/${enc(code)}/toggle`), [refreshPromotions], ['Promotion Status', `Coupon ${code} toggled.`, 'info']),
    [run, refreshPromotions],
  );
  const deletePromotion = useCallback<DataContextType['deletePromotion']>(
    (code) => run(() => api.delete(`/admin/promotions/${enc(code)}`), [refreshPromotions], ['Promotion Deleted', `Coupon ${code} removed.`, 'info']),
    [run, refreshPromotions],
  );

  // ---------------------------------------------------------------------------
  // Verifications
  // ---------------------------------------------------------------------------

  const approveVerification = useCallback<DataContextType['approveVerification']>(
    (id) => run(() => api.post(`/admin/verifications/${id}/approve`), [refreshVerifications, refreshVendors, refreshRiders], ['KYC Approved', 'Partner has been activated and notified.']),
    [run, refreshVerifications, refreshVendors, refreshRiders],
  );
  const rejectVerification = useCallback<DataContextType['rejectVerification']>(
    (id, reason) => run(() => api.post(`/admin/verifications/${id}/reject`, { reason: reason || 'Documents unclear. Please re-submit.' }), [refreshVerifications, refreshVendors, refreshRiders], ['KYC Rejected', 'Applicant has been notified with the reason.', 'info']),
    [run, refreshVerifications, refreshVendors, refreshRiders],
  );

  // ---------------------------------------------------------------------------
  // Support
  // ---------------------------------------------------------------------------

  const CATEGORY_TO_API: Record<string, string> = { Damage: 'DAMAGE', Delay: 'DELAY', Payout: 'PAYOUT', 'App Bug': 'APP_BUG', Refund: 'REFUND', Delivery: 'DELIVERY', Quality: 'QUALITY' };

  const addTicket = useCallback<DataContextType['addTicket']>(
    (ticket) => {
      run(
        () =>
          api.post('/admin/tickets', {
            subject: ticket.subject,
            message: ticket.messages[0]?.text ?? ticket.subject,
            category: CATEGORY_TO_API[ticket.category] ?? 'OTHER',
            priority: ticket.priority.toUpperCase(),
          }),
        [refreshTickets],
        ['Ticket Created', `${ticket.subject} logged.`],
      );
      return { ...ticket, id: 'pending', createdAt: new Date().toISOString() };
    },
    [run, refreshTickets],
  );
  const replyTicket = useCallback<DataContextType['replyTicket']>(
    (id, text) => run(() => api.post(`/admin/tickets/${enc(id)}/reply`, { text }), [refreshTickets], ['Reply Sent', 'The user has been notified.']),
    [run, refreshTickets],
  );
  const updateTicketStatus = useCallback<DataContextType['updateTicketStatus']>(
    (id, status) => run(() => api.patch(`/admin/tickets/${enc(id)}`, { status: status.toUpperCase().replace(' ', '_') }), [refreshTickets], ['Ticket Updated', `Ticket ${id} marked ${status}.`, 'info']),
    [run, refreshTickets],
  );
  const updateTicketPriority = useCallback<DataContextType['updateTicketPriority']>(
    (id, priority) => run(() => api.patch(`/admin/tickets/${enc(id)}`, { priority: priority.toUpperCase() }), [refreshTickets], ['Priority Updated', `Ticket ${id} set to ${priority}.`, 'info']),
    [run, refreshTickets],
  );

  // ---------------------------------------------------------------------------
  // Payouts
  // ---------------------------------------------------------------------------

  const processPayout = useCallback<DataContextType['processPayout']>(
    (id) => run(() => api.post(`/admin/payouts/${enc(id)}/process`), [refreshPayouts], ['Payout Processed', `${id} marked as transferred.`]),
    [run, refreshPayouts],
  );
  const createPayout = useCallback<DataContextType['createPayout']>(
    (payout) => {
      const party = payout.type === 'Vendor' ? vendors.find((v) => v.name === payout.recipient) : riders.find((r) => r.name === payout.recipient);
      if (!party) {
        showToast('Recipient not found', `No ${payout.type.toLowerCase()} named ${payout.recipient}.`, 'error');
      } else {
        run(() => api.post('/admin/payouts', { type: payout.type, partyId: party.id, amount: payout.amount, method: payout.method }), [refreshPayouts], ['Payout Created', `₹${payout.amount} queued for ${payout.recipient}.`]);
      }
      return { ...payout, id: 'pending', date: new Date().toISOString() };
    },
    [vendors, riders, run, refreshPayouts, showToast],
  );

  // ---------------------------------------------------------------------------
  // Settings, zones, broadcast, notifications
  // ---------------------------------------------------------------------------

  const updateSettings = useCallback<DataContextType['updateSettings']>(
    (updates) => {
      const { activeServiceZones: _zones, ...rest } = updates;
      run(() => api.patch('/admin/settings', rest), [refreshSettings], undefined);
    },
    [run, refreshSettings],
  );
  const addZone = useCallback<DataContextType['addZone']>(
    (zone) => run(() => api.post('/admin/zones', zone), [refreshZones, refreshSettings], ['Service Zone Added', `Zone "${zone.name}, ${zone.city}" is enabled for dispatch.`]),
    [run, refreshZones, refreshSettings],
  );
  const toggleZoneStatus = useCallback<DataContextType['toggleZoneStatus']>(
    (id) => {
      const z = zones.find((x) => x.id === id);
      if (!z) return;
      const next = z.status === 'Operational' ? 'Paused' : 'Operational';
      run(() => api.patch(`/admin/zones/${id}`, { status: next }), [refreshZones, refreshSettings], ['Zone Status Updated', `${z.name} is now ${next}.`, 'info']);
    },
    [zones, run, refreshZones, refreshSettings],
  );
  const removeZone = useCallback<DataContextType['removeZone']>(
    (id) => run(() => api.delete(`/admin/zones/${id}`), [refreshZones, refreshSettings], ['Zone Removed', 'Service zone paused for dispatch routing.', 'info']),
    [run, refreshZones, refreshSettings],
  );
  const broadcast = useCallback<DataContextType['broadcast']>(async (input) => {
    const res = await api.post<{ recipients: number }>('/admin/broadcast', input);
    return res.recipients;
  }, []);

  const markNotificationRead = useCallback<DataContextType['markNotificationRead']>(
    (id) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (!id.startsWith('live-')) void api.post(`/notifications/${id}/read`).catch(() => undefined);
    },
    [],
  );
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    void api.delete('/notifications').catch(() => undefined);
  }, []);
  const resetToFactoryDemo = useCallback(() => {
    showToast('Not available', 'Data now lives on the server; re-run `npm run db:reset` in the backend to reset demo data.', 'info');
  }, [showToast]);

  const value = useMemo<DataContextType>(
    () => ({
      orders,
      customers,
      vendors,
      riders,
      services,
      surcharges,
      promotions,
      verifications,
      tickets,
      payouts,
      settings,
      notifications,
      zones,
      isLoading,
      loadError,
      reload,
      isAuthenticated,
      currentUser,
      login,
      logout,
      isLiveSimulationActive,
      setIsLiveSimulationActive,
      addOrder,
      updateOrder,
      updateOrderStatus,
      assignRiderToOrder,
      assignPartnerToOrder,
      deleteOrder,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addVendor,
      updateVendor,
      toggleVendorStatus,
      deleteVendor,
      addRider,
      updateRider,
      toggleRiderStatus,
      deleteRider,
      addService,
      updateService,
      toggleServiceStatus,
      deleteService,
      addSurcharge,
      updateSurcharge,
      toggleSurchargeStatus,
      deleteSurcharge,
      addPromotion,
      updatePromotion,
      togglePromotionStatus,
      deletePromotion,
      approveVerification,
      rejectVerification,
      addTicket,
      replyTicket,
      updateTicketStatus,
      updateTicketPriority,
      processPayout,
      createPayout,
      updateSettings,
      addZone,
      toggleZoneStatus,
      removeZone,
      broadcast,
      markNotificationRead,
      clearAllNotifications,
      resetToFactoryDemo,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, customers, vendors, riders, services, surcharges, promotions, verifications, tickets, payouts, settings, notifications, zones, isLoading, loadError, isAuthenticated, currentUser, isLiveSimulationActive],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
