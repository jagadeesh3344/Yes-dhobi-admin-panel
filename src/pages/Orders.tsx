import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit3,
  Bike,
  Store,
  CheckCircle,
  RefreshCw,
  Copy,
  Check,
  Activity,
  Truck,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { OrderModal } from '@/components/modals/OrderModal';
import { OrderFlowModal } from '@/components/modals/OrderFlowModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Order, OrderStatus } from '@/types';

export default function Orders() {
  const { orders, updateOrderStatus, deleteOrder, deleteOrders, reload, isLoading } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  // Checkbox Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Clipboard copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, label: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast('Copied to Clipboard', `${label}: ${text}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Logistics KPI counts
  const pickupInTransitCount = orders.filter(
    (o) => o.status === 'Pending Pickup' || o.status === 'Assigned' || o.status === 'Picked Up'
  ).length;

  const inVendorHubCount = orders.filter(
    (o) =>
      o.status === 'In Laundry' ||
      o.status === 'Washing' ||
      o.status === 'Ironing' ||
      o.status === 'Quality Check' ||
      o.status === 'Ready'
  ).length;

  const outForDeliveryCount = orders.filter((o) => o.status === 'Out for Delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(q)) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        (order.customerDisplayId && order.customerDisplayId.toLowerCase().includes(q)) ||
        order.partnerName.toLowerCase().includes(q) ||
        (order.vendorDisplayId && order.vendorDisplayId.toLowerCase().includes(q)) ||
        order.riderName.toLowerCase().includes(q) ||
        (order.pickupRiderName && order.pickupRiderName.toLowerCase().includes(q)) ||
        (order.pickupRiderDisplayId && order.pickupRiderDisplayId.toLowerCase().includes(q)) ||
        (order.deliveryRiderName && order.deliveryRiderName.toLowerCase().includes(q)) ||
        (order.deliveryRiderDisplayId && order.deliveryRiderDisplayId.toLowerCase().includes(q));

      const matchesService = selectedService === 'All' || order.serviceName === selectedService;
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && order.status !== 'Delivered' && order.status !== 'Cancelled') ||
        order.status === selectedStatus;

      return matchesSearch && matchesService && matchesStatus;
    });
  }, [orders, searchQuery, selectedService, selectedStatus]);

  // Master selection helpers
  const allFilteredSelected =
    filteredOrders.length > 0 && filteredOrders.every((o) => selectedIds.has(o.id));
  const someFilteredSelected =
    filteredOrders.some((o) => selectedIds.has(o.id)) && !allFilteredSelected;

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredOrders.forEach((o) => next.add(o.id));
      setSelectedIds(next);
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await deleteOrders(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowBulkDeleteConfirm(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_orders_master',
      filteredOrders.map((o) => ({
        OrderID: o.id,
        Customer: o.customerName,
        CustomerID: o.customerDisplayId || 'N/A',
        CustomerPhone: o.customerPhone,
        CustomerAddress: o.customerAddress || 'N/A',
        PickupRider: o.pickupRiderName || o.riderName,
        PickupRiderID: o.pickupRiderDisplayId || 'N/A',
        VendorHub: o.partnerName,
        VendorHubID: o.vendorDisplayId || 'N/A',
        DeliveryRider: o.deliveryRiderName || 'N/A',
        DeliveryRiderID: o.deliveryRiderDisplayId || 'N/A',
        Service: o.serviceName,
        ItemsCount: o.itemsCount,
        Details: o.itemDetails || 'N/A',
        AmountINR: o.amount,
        Status: o.status,
        PaymentMethod: o.paymentMethod,
        PaymentStatus: o.paymentStatus,
        PickupDate: o.pickupDate,
        DeliveryDate: o.deliveryDate || 'N/A',
      }))
    );
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Laundry':
      case 'Washing':
      case 'Ironing':
      case 'Quality Check':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ready':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Out for Delivery':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending Pickup':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Assigned':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Picked Up':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Orders Master Registry</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live 2-Leg Logistics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full real-time transparency: Customer ➔ Pickup Rider (Leg 1) ➔ Vendor Hub ➔ Delivery Rider (Leg 2) ➔ Customer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => reload()}
            disabled={isLoading}
            className="text-xs"
            title="Fetch latest updates from server"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export CSV ({filteredOrders.length})
          </Button>
          <Button
            size="sm"
            className="text-xs"
            onClick={() => {
              setOrderToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Manual Order
          </Button>
        </div>
      </div>

      {/* Logistics Pipeline KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Leg 1 In-Transit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pickup In-Transit (Leg 1)
              </p>
            </div>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{pickupInTransitCount}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Customer ➔ Hub</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bike className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Vendor Hub */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                At Vendor Hub
              </p>
            </div>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{inVendorHubCount}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Washing • Ironing • Ready</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Leg 2 Out for Delivery */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Out for Delivery (Leg 2)
              </p>
            </div>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{outForDeliveryCount}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Hub ➔ Customer</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Delivered */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Delivered Completed
              </p>
            </div>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{deliveredCount}</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Successful Deliveries</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold">order(s) selected for bulk management</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-slate-300 hover:text-white font-medium px-3 py-1.5"
            >
              Deselect All
            </button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="text-xs font-bold"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Cancel / Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by Order ID, CUST, VDR, RDR, Customer, Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white"
              />
            </div>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Services</option>
              <option value="Wash & Iron">Wash & Iron</option>
              <option value="Dry Clean">Dry Clean</option>
              <option value="Only Ironing">Only Ironing</option>
              <option value="Premium Care">Premium Care</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses ({orders.length})</option>
              <option value="Active">Active Orders</option>
              <option value="Pending Pickup">Pending Pickup</option>
              <option value="Assigned">Assigned (Leg 1)</option>
              <option value="Picked Up">Picked Up (In Transit to Hub)</option>
              <option value="In Laundry">In Laundry (At Hub)</option>
              <option value="Washing">Washing</option>
              <option value="Ironing">Ironing</option>
              <option value="Quality Check">Quality Check</option>
              <option value="Ready">Ready (Ready for Delivery)</option>
              <option value="Out for Delivery">Out for Delivery (Leg 2)</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {(searchQuery || selectedService !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedService('All');
                  setSelectedStatus('All');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline px-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Real-time Logistics Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someFilteredSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 whitespace-nowrap">Order ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Customer</th>
                <th className="px-4 py-3 whitespace-nowrap">Leg 1 • Pickup Rider</th>
                <th className="px-4 py-3 whitespace-nowrap">Vendor Hub</th>
                <th className="px-4 py-3 whitespace-nowrap">Leg 2 • Delivery Rider</th>
                <th className="px-4 py-3 whitespace-nowrap">Service & Bill</th>
                <th className="px-4 py-3 whitespace-nowrap text-center">Live Status</th>
                <th className="px-4 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const isSelected = selectedIds.has(order.id);
                const isLeg1Done = [
                  'In Laundry',
                  'Washing',
                  'Ironing',
                  'Quality Check',
                  'Ready',
                  'Out for Delivery',
                  'Delivered',
                ].includes(order.status);
                const isLeg1InTransit = order.status === 'Picked Up';
                const isLeg1Assigned =
                  order.status === 'Assigned' ||
                  (order.pickupRiderName && order.pickupRiderName !== 'Unassigned');

                const isLeg2Done = order.status === 'Delivered';
                const isLeg2InTransit = order.status === 'Out for Delivery';
                const isLeg2Ready = order.status === 'Ready';

                return (
                  <tr
                    key={order.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isSelected ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleSelectRow(order.id, e as any)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Order ID */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-blue-600 text-[13px] tracking-tight">
                          {order.id}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, order.id, 'Order ID')}
                          className="text-slate-300 hover:text-blue-600 transition-colors p-0.5 rounded"
                          title="Copy Order ID"
                        >
                          {copiedId === order.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{order.pickupDate}</p>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        {order.customerDisplayId && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, order.customerDisplayId!, 'Customer ID')}
                            className="text-[10px] font-mono font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200 transition-colors flex items-center gap-0.5"
                            title="Click to copy Customer ID"
                          >
                            <span>{order.customerDisplayId}</span>
                            {copiedId === order.customerDisplayId ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-blue-400" />
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {order.customerPhone || 'No Phone'}
                      </p>
                    </td>

                    {/* Leg 1: Pickup Rider */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-[12px]">
                          {order.pickupRiderName || order.riderName || 'Unassigned'}
                        </span>
                        {order.pickupRiderDisplayId && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, order.pickupRiderDisplayId!, 'Rider ID')}
                            className="text-[10px] font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200 transition-colors flex items-center gap-0.5"
                            title="Click to copy Rider ID"
                          >
                            <span>{order.pickupRiderDisplayId}</span>
                            {copiedId === order.pickupRiderDisplayId ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-amber-500" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="mt-1">
                        {isLeg1Done ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                            <CheckCircle className="w-2.5 h-2.5" /> Dropped at Hub
                          </span>
                        ) : isLeg1InTransit ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-full border border-indigo-200">
                            <Bike className="w-2.5 h-2.5" /> Picked Up ➔ Hub
                          </span>
                        ) : isLeg1Assigned ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.2 rounded-full border border-blue-200">
                            Dispatched
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                            Awaiting Pickup
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Vendor Hub */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-[12px]">
                          {order.partnerName || 'Not Assigned'}
                        </span>
                        {order.vendorDisplayId && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, order.vendorDisplayId!, 'Vendor ID')}
                            className="text-[10px] font-mono font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded border border-purple-200 transition-colors flex items-center gap-0.5"
                            title="Click to copy Vendor ID"
                          >
                            <span>{order.vendorDisplayId}</span>
                            {copiedId === order.vendorDisplayId ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-purple-500" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] text-slate-500 font-medium">
                          {order.status === 'Ready'
                            ? 'Ready for Delivery ✓'
                            : isLeg1Done
                            ? order.status
                            : 'Awaiting Arrival'}
                        </span>
                      </div>
                    </td>

                    {/* Leg 2: Delivery Rider */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-[12px]">
                          {order.deliveryRiderName || (isLeg2Ready ? 'Dispatch Ready' : 'Queued')}
                        </span>
                        {order.deliveryRiderDisplayId && (
                          <button
                            type="button"
                            onClick={(e) => handleCopy(e, order.deliveryRiderDisplayId!, 'Rider ID')}
                            className="text-[10px] font-mono font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200 transition-colors flex items-center gap-0.5"
                            title="Click to copy Delivery Rider ID"
                          >
                            <span>{order.deliveryRiderDisplayId}</span>
                            {copiedId === order.deliveryRiderDisplayId ? (
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-emerald-500" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="mt-1">
                        {isLeg2Done ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                            <CheckCircle className="w-2.5 h-2.5" /> Delivered ✓
                          </span>
                        ) : isLeg2InTransit ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full border border-amber-200">
                            <Truck className="w-2.5 h-2.5" /> Out for Delivery
                          </span>
                        ) : isLeg2Ready ? (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.2 rounded-full border border-purple-200">
                            Ready for Dispatch
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Pending Laundry
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Service & Amount */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">₹{order.amount}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {order.serviceName} ({order.itemsCount} items)
                      </p>
                    </td>

                    {/* Live Status Dropdown */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer whitespace-nowrap outline-none ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        <option value="Pending Pickup">Pending Pickup</option>
                        <option value="Assigned">Assigned (Leg 1)</option>
                        <option value="Picked Up">Picked Up (To Hub)</option>
                        <option value="In Laundry">In Laundry (Hub)</option>
                        <option value="Washing">Washing</option>
                        <option value="Ironing">Ironing</option>
                        <option value="Quality Check">Quality Check</option>
                        <option value="Ready">Ready (For Delivery)</option>
                        <option value="Out for Delivery">Out for Delivery (Leg 2)</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Track Flow Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-bold px-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                          onClick={() => setTrackingOrder(order)}
                          title="View 2-Leg Journey Stepper & OTPs"
                        >
                          <Activity className="w-3 h-3 mr-1 text-blue-600" />
                          Track Flow
                        </Button>

                        {/* Manage Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-semibold px-2.5"
                          onClick={() => {
                            setOrderToEdit(order);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit3 className="w-3 h-3 mr-1 text-slate-500" />
                          Manage
                        </Button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete / Cancel Order"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No orders matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-Leg Flow Tracking Modal */}
      <OrderFlowModal
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
        order={trackingOrder}
        onOpenManage={(ord) => {
          setOrderToEdit(ord);
          setIsModalOpen(true);
        }}
      />

      {/* Edit / Create Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOrderToEdit(null);
        }}
        orderToEdit={orderToEdit}
      />

      {/* Single Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) {
            deleteOrder(orderToDelete.id);
            setOrderToDelete(null);
          }
        }}
        title={`Cancel Order #${orderToDelete?.id || ''}?`}
        description={`Are you sure you want to cancel the order for ${
          orderToDelete?.customerName || 'this customer'
        } (${orderToDelete?.serviceName || 'Laundry Service'})? This action will cancel any active rider dispatch and update the order status.`}
        confirmText="Yes, Cancel Order"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`Cancel / Delete ${selectedIds.size} Orders?`}
        description={`Are you sure you want to cancel ${selectedIds.size} selected orders? All associated dispatch requests will be cancelled.`}
        confirmText={isBulkDeleting ? 'Cancelling...' : 'Yes, Cancel All'}
      />
    </div>
  );
}
