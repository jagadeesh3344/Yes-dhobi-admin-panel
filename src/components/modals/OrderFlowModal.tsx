import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bike,
  Store,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Copy,
  Check,
  CheckCircle,
  Clock,
  ArrowRight,
  Package,
  Key,
  AlertCircle,
  RefreshCw,
  Truck,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '@/types';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';

interface OrderFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onOpenManage?: (order: Order) => void;
}

export const OrderFlowModal: React.FC<OrderFlowModalProps> = ({
  isOpen,
  onClose,
  order,
  onOpenManage,
}) => {
  const { riders, vendors, assignRiderToOrder, assignPartnerToOrder, updateOrderStatus } = useData();
  const { showToast } = useToast();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedPickupRider, setSelectedPickupRider] = useState('');
  const [selectedDeliveryRider, setSelectedDeliveryRider] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');

  if (!order) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast('Copied to Clipboard', `${label}: ${text}`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Determine stage progression
  const status = order.status;

  const isLeg1Assigned = !!order.pickupRiderName && order.pickupRiderName !== 'Unassigned';
  const isPickedUp = [
    'Picked Up',
    'In Laundry',
    'Washing',
    'Ironing',
    'Quality Check',
    'Ready',
    'Out for Delivery',
    'Delivered',
  ].includes(status);
  const isDroppedAtHub = [
    'In Laundry',
    'Washing',
    'Ironing',
    'Quality Check',
    'Ready',
    'Out for Delivery',
    'Delivered',
  ].includes(status);
  const isReady = ['Ready', 'Out for Delivery', 'Delivered'].includes(status);
  const isOutForDelivery = ['Out for Delivery', 'Delivered'].includes(status);
  const isDelivered = status === 'Delivered';
  const isCancelled = status === 'Cancelled';

  // Get status color theme
  const getStatusBadge = (s: OrderStatus) => {
    switch (s) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Ready':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'In Laundry':
      case 'Washing':
      case 'Ironing':
      case 'Quality Check':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Picked Up':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Assigned':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  const handleQuickStatus = (newStatus: OrderStatus) => {
    updateOrderStatus(order.id, newStatus);
    showToast('Status Updated', `Order ${order.id} marked as "${newStatus}".`, 'success');
  };

  const handleAssignPickup = () => {
    if (!selectedPickupRider) return;
    assignRiderToOrder(order.id, selectedPickupRider, 'PICKUP');
    setSelectedPickupRider('');
  };

  const handleAssignDelivery = () => {
    if (!selectedDeliveryRider) return;
    assignRiderToOrder(order.id, selectedDeliveryRider, 'DELIVERY');
    setSelectedDeliveryRider('');
  };

  const handleAssignVendor = () => {
    if (!selectedVendor) return;
    assignPartnerToOrder(order.id, selectedVendor);
    setSelectedVendor('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Live Tracking & Logistics Flow — ${order.id}`}
      subtitle="Complete 2-Leg Journey Transparency: Customer ➔ Pickup Rider ➔ Vendor Hub ➔ Delivery Rider ➔ Customer"
      maxWidth="4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">Real-Time Sync Active</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenManage(order);
                }}
              >
                Open Full Order Editor
              </Button>
            )}
            <Button size="sm" onClick={onClose}>
              Close Tracking
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Top Summary Bar */}
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 p-4 rounded-2xl border border-blue-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">{order.id}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(order.id, 'Order ID')}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
                  title="Copy Order ID"
                >
                  {copiedKey === 'Order ID' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Service: <strong className="text-slate-700">{order.serviceName}</strong> • {order.itemsCount} Items • Bill: <strong className="text-emerald-700">₹{order.amount}</strong> ({order.paymentStatus})
              </p>
            </div>
          </div>

          {/* Customer mini card */}
          <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">{order.customerName}</span>
                {order.customerDisplayId && (
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                    {order.customerDisplayId}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {order.customerPhone || 'No Phone'}
              </p>
            </div>
          </div>
        </div>

        {/* 2-Leg Journey Stepper */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Full 2-Leg Logistics Journey Flow
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Real-time delivery progression
            </span>
          </div>

          {/* Stepper Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* LEG 1: PICKUP */}
            <div className={`p-4 rounded-xl border transition-all ${
              isDroppedAtHub
                ? 'bg-emerald-50/30 border-emerald-200'
                : isPickedUp
                ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                : isLeg1Assigned
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-slate-50/60 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Leg 1 • Pickup
                </span>
                {isDroppedAtHub ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Dropped at Hub
                  </span>
                ) : isPickedUp ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    <Bike className="w-3 h-3" /> In Transit to Hub
                  </span>
                ) : isLeg1Assigned ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" /> Rider Dispatched
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    Awaiting Rider
                  </span>
                )}
              </div>

              {/* Pickup Rider Info */}
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Rider</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {order.pickupRiderName || order.riderName || 'Unassigned'}
                    </span>
                    {order.pickupRiderDisplayId && (
                      <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                        {order.pickupRiderDisplayId}
                      </span>
                    )}
                  </div>
                  {order.pickupRiderPhone && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {order.pickupRiderPhone}
                    </p>
                  )}
                  {order.pickupRiderDetails?.vehicle && (
                    <p className="text-[10px] text-slate-400">
                      Vehicle: {order.pickupRiderDetails.vehicle} {order.pickupRiderDetails.vehiclePlate ? `(${order.pickupRiderDetails.vehiclePlate})` : ''}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Pickup:</span>
                    <span className="font-semibold text-slate-800">
                      {isPickedUp ? (order.pickedUpAt || 'Completed ✓') : 'Pending Doorstep OTP'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hub Delivery:</span>
                    <span className="font-semibold text-slate-800">
                      {isDroppedAtHub ? 'Received by Hub ✓' : 'Pending Drop OTP'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* VENDOR HUB PROCESSING */}
            <div className={`p-4 rounded-xl border transition-all ${
              isReady
                ? 'bg-purple-50/40 border-purple-200'
                : isDroppedAtHub
                ? 'bg-blue-50/50 border-blue-200 shadow-xs'
                : 'bg-slate-50/60 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Vendor Hub • Processing
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isReady
                    ? 'bg-purple-100 text-purple-800'
                    : isDroppedAtHub
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {isReady ? 'Ready for Delivery ✓' : isDroppedAtHub ? status : 'Awaiting Arrival'}
                </span>
              </div>

              {/* Vendor Info */}
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Hub</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {order.partnerName || 'Not Assigned'}
                    </span>
                    {order.vendorDisplayId && (
                      <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200">
                        {order.vendorDisplayId}
                      </span>
                    )}
                  </div>
                  {order.vendorDetails?.phone && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {order.vendorDetails.phone}
                    </p>
                  )}
                  {order.vendorDetails?.address && (
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {order.vendorDetails.address}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Wash & Care:</span>
                    <span className="font-semibold text-slate-800">
                      {['Washing', 'Ironing', 'Quality Check', 'Ready', 'Out for Delivery', 'Delivered'].includes(status) ? 'In Progress / Done' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ready for Handover:</span>
                    <span className="font-semibold text-slate-800">
                      {isReady ? 'Ready for Rider 2 ✓' : 'Processing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* LEG 2: DELIVERY */}
            <div className={`p-4 rounded-xl border transition-all ${
              isDelivered
                ? 'bg-emerald-50/50 border-emerald-200 shadow-xs'
                : isOutForDelivery
                ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                : order.deliveryRiderName && order.deliveryRiderName !== 'Unassigned'
                ? 'bg-blue-50/40 border-blue-200'
                : 'bg-slate-50/60 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Leg 2 • Delivery
                </span>
                {isDelivered ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Delivered
                  </span>
                ) : isOutForDelivery ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                    <Truck className="w-3 h-3" /> Out for Delivery
                  </span>
                ) : isReady ? (
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                    Ready for Dispatch
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Queued after Laundry
                  </span>
                )}
              </div>

              {/* Delivery Rider Info */}
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery Rider (Leg 2)</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {order.deliveryRiderName || (isReady ? 'Unassigned (Dispatch Needed)' : 'Queued')}
                    </span>
                    {order.deliveryRiderDisplayId && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                        {order.deliveryRiderDisplayId}
                      </span>
                    )}
                  </div>
                  {order.deliveryRiderPhone && (
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" /> {order.deliveryRiderPhone}
                    </p>
                  )}
                  {order.deliveryRiderDetails?.vehicle && (
                    <p className="text-[10px] text-slate-400">
                      Vehicle: {order.deliveryRiderDetails.vehicle} {order.deliveryRiderDetails.vehiclePlate ? `(${order.deliveryRiderDetails.vehiclePlate})` : ''}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hub Handover:</span>
                    <span className="font-semibold text-slate-800">
                      {isOutForDelivery || isDelivered ? 'Collected from Hub ✓' : 'Pending Handover OTP'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Final Handover:</span>
                    <span className="font-semibold text-slate-800">
                      {isDelivered ? (order.deliveryDate || 'Delivered ✓') : 'Pending Customer OTP'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Security Handoff OTPs Assist Section */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
                Support Security Handoff OTPs
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              For Support Hotline verification & rider assist
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* OTP 1: Customer Pickup */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Pickup</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-900/60 text-blue-300">
                    Leg 1 Doorstep
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Rider enters at pickup</p>
                <div className="my-2 text-center">
                  <span className="text-2xl font-black font-mono tracking-widest text-blue-400">
                    {order.otps?.customerPickup || '••••'}
                  </span>
                </div>
              </div>
              {order.otps?.customerPickup && (
                <button
                  type="button"
                  onClick={() => handleCopy(order.otps!.customerPickup!, 'Customer Pickup OTP')}
                  className="w-full mt-1 py-1 text-[11px] font-semibold rounded bg-slate-700/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'Customer Pickup OTP' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Code
                </button>
              )}
            </div>

            {/* OTP 2: Vendor Drop */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Vendor Drop</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300">
                    Hub Arrival
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Rider drops at Vendor</p>
                <div className="my-2 text-center">
                  <span className="text-2xl font-black font-mono tracking-widest text-indigo-400">
                    {order.otps?.vendorDrop || '••••'}
                  </span>
                </div>
              </div>
              {order.otps?.vendorDrop && (
                <button
                  type="button"
                  onClick={() => handleCopy(order.otps!.vendorDrop!, 'Vendor Drop OTP')}
                  className="w-full mt-1 py-1 text-[11px] font-semibold rounded bg-slate-700/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'Vendor Drop OTP' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Code
                </button>
              )}
            </div>

            {/* OTP 3: Vendor Handover */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Vendor Handover</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300">
                    Leg 2 Dispatch
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Rider 2 collects from Hub</p>
                <div className="my-2 text-center">
                  <span className="text-2xl font-black font-mono tracking-widest text-purple-400">
                    {order.otps?.vendorHandover || '••••'}
                  </span>
                </div>
              </div>
              {order.otps?.vendorHandover && (
                <button
                  type="button"
                  onClick={() => handleCopy(order.otps!.vendorHandover!, 'Vendor Handover OTP')}
                  className="w-full mt-1 py-1 text-[11px] font-semibold rounded bg-slate-700/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'Vendor Handover OTP' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Code
                </button>
              )}
            </div>

            {/* OTP 4: Customer Delivery */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Customer Delivery</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300">
                    Final Handoff
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">Rider 2 enters at doorstep</p>
                <div className="my-2 text-center">
                  <span className="text-2xl font-black font-mono tracking-widest text-emerald-400">
                    {order.otps?.customerDelivery || '••••'}
                  </span>
                </div>
              </div>
              {order.otps?.customerDelivery && (
                <button
                  type="button"
                  onClick={() => handleCopy(order.otps!.customerDelivery!, 'Customer Delivery OTP')}
                  className="w-full mt-1 py-1 text-[11px] font-semibold rounded bg-slate-700/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedKey === 'Customer Delivery OTP' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Code
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-lg border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              If rider or customer reports app sync failure or offline mobile status, verify their registered phone number and verbally assist them using the corresponding OTP above.
            </span>
          </div>
        </div>

        {/* Quick Operations Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Quick Support Dispatch & Status Actions
          </h4>

          {/* Quick Dispatch Assignment Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Reassign Leg 1 Pickup Rider */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">
                Assign Leg 1 Pickup Rider
              </label>
              <div className="flex gap-1.5">
                <select
                  value={selectedPickupRider}
                  onChange={(e) => setSelectedPickupRider(e.target.value)}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg p-1.5"
                >
                  <option value="">Select Rider...</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.displayId || 'RDR'}) - {r.status}
                    </option>
                  ))}
                </select>
                <Button size="sm" className="h-8 text-xs" onClick={handleAssignPickup} disabled={!selectedPickupRider}>
                  Assign
                </Button>
              </div>
            </div>

            {/* Reassign Vendor Hub */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">
                Reassign Vendor Hub
              </label>
              <div className="flex gap-1.5">
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg p-1.5"
                >
                  <option value="">Select Vendor Hub...</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name} ({v.displayId || 'VDR'}) - {v.zone}
                    </option>
                  ))}
                </select>
                <Button size="sm" className="h-8 text-xs" onClick={handleAssignVendor} disabled={!selectedVendor}>
                  Assign
                </Button>
              </div>
            </div>

            {/* Reassign Leg 2 Delivery Rider */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">
                Assign Leg 2 Delivery Rider
              </label>
              <div className="flex gap-1.5">
                <select
                  value={selectedDeliveryRider}
                  onChange={(e) => setSelectedDeliveryRider(e.target.value)}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg p-1.5"
                >
                  <option value="">Select Rider...</option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.displayId || 'RDR'}) - {r.status}
                    </option>
                  ))}
                </select>
                <Button size="sm" className="h-8 text-xs" onClick={handleAssignDelivery} disabled={!selectedDeliveryRider}>
                  Assign
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Status Transition Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">Fast Stage Advance:</span>
            {!isPickedUp && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleQuickStatus('Picked Up')}>
                Mark Picked Up (Leg 1)
              </Button>
            )}
            {!isDroppedAtHub && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleQuickStatus('In Laundry')}>
                Mark Dropped at Hub
              </Button>
            )}
            {status !== 'Washing' && isDroppedAtHub && !isReady && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleQuickStatus('Washing')}>
                Mark Washing
              </Button>
            )}
            {!isReady && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleQuickStatus('Ready')}>
                Mark Ready for Delivery
              </Button>
            )}
            {!isOutForDelivery && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleQuickStatus('Out for Delivery')}>
                Mark Out for Delivery (Leg 2)
              </Button>
            )}
            {!isDelivered && (
              <Button size="sm" variant="outline" className="h-7 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" onClick={() => handleQuickStatus('Delivered')}>
                Mark Delivered ✓
              </Button>
            )}
            {!isCancelled && (
              <Button size="sm" variant="outline" className="h-7 text-xs text-rose-600 hover:bg-rose-50 border-rose-200 ml-auto" onClick={() => handleQuickStatus('Cancelled')}>
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {/* Real-time Order Timeline / Audit Trail */}
        {order.events && order.events.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Real-Time Event Audit Log
              </h4>
              <span className="text-[11px] text-slate-400">{order.events.length} logged events</span>
            </div>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {order.events.map((e, idx) => (
                <div key={e.id || idx} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{e.title}</span>
                      <span className="text-[10px] text-slate-400">{e.createdAt}</span>
                    </div>
                    {e.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{e.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
