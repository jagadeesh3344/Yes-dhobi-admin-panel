import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/types';
import { useData } from '@/context/DataContext';
import { Bike, Store, User } from 'lucide-react';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, orderToEdit }) => {
  const { addOrder, updateOrder, assignRiderToOrder, assignPartnerToOrder, customers, vendors, riders, services } = useData();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [pickupRiderName, setPickupRiderName] = useState('Unassigned');
  const [deliveryRiderName, setDeliveryRiderName] = useState('Unassigned');
  const [serviceName, setServiceName] = useState('Wash & Iron');
  const [itemsCount, setItemsCount] = useState(6);
  const [itemDetails, setItemDetails] = useState('');
  const [amount, setAmount] = useState(180);
  const [status, setStatus] = useState<OrderStatus>('Pending Pickup');
  const [pickupDate, setPickupDate] = useState('Today, 10:00 AM');
  const [deliveryDate, setDeliveryDate] = useState('Tomorrow, 06:00 PM');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'COD' | 'Wallet'>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Refunded'>('Paid');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (orderToEdit) {
      setCustomerName(orderToEdit.customerName);
      setCustomerPhone(orderToEdit.customerPhone);
      setCustomerAddress(orderToEdit.customerAddress || '');
      setPartnerName(orderToEdit.partnerName || '');
      setPickupRiderName(orderToEdit.pickupRiderName || orderToEdit.riderName || 'Unassigned');
      setDeliveryRiderName(orderToEdit.deliveryRiderName || 'Unassigned');
      setServiceName(orderToEdit.serviceName);
      setItemsCount(orderToEdit.itemsCount);
      setItemDetails(orderToEdit.itemDetails || '');
      setAmount(orderToEdit.amount);
      setStatus(orderToEdit.status);
      setPickupDate(orderToEdit.pickupDate);
      setDeliveryDate(orderToEdit.deliveryDate || 'Tomorrow, 06:00 PM');
      setPaymentMethod(orderToEdit.paymentMethod);
      setPaymentStatus(orderToEdit.paymentStatus);
      setNotes(orderToEdit.notes || '');
    } else {
      if (customers.length > 0) {
        setCustomerName(customers[0].name);
        setCustomerPhone(customers[0].phone);
        setCustomerAddress(customers[0].address);
      }
      if (vendors.length > 0) {
        setPartnerName(vendors[0].name);
      }
      setPickupRiderName('Unassigned');
      setDeliveryRiderName('Unassigned');
      setServiceName(services[0]?.name || 'Wash & Iron');
      setItemsCount(8);
      setItemDetails('4 Shirts, 2 Trousers, 2 Towels');
      setAmount(200);
      setStatus('Pending Pickup');
      setPickupDate('Today, 11:00 AM');
      setDeliveryDate('Tomorrow, 05:00 PM');
      setPaymentMethod('UPI');
      setPaymentStatus('Paid');
      setNotes('');
    }
  }, [orderToEdit, isOpen, customers, vendors, services]);

  const handleCustomerSelect = (name: string) => {
    setCustomerName(name);
    const found = customers.find((c) => c.name === name);
    if (found) {
      setCustomerPhone(found.phone);
      setCustomerAddress(found.address);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    if (orderToEdit) {
      updateOrder(orderToEdit.id, {
        customerName,
        customerPhone,
        customerAddress,
        partnerName: partnerName || 'Star Bright Laundry',
        riderName: pickupRiderName !== 'Unassigned' ? pickupRiderName : deliveryRiderName,
        pickupRiderName,
        deliveryRiderName,
        serviceName,
        itemsCount: Number(itemsCount),
        itemDetails,
        amount: Number(amount),
        status,
        pickupDate,
        deliveryDate,
        paymentMethod,
        paymentStatus,
        notes,
      });

      // Also trigger backend leg assignments if changed
      if (pickupRiderName && pickupRiderName !== 'Unassigned' && pickupRiderName !== orderToEdit.pickupRiderName) {
        assignRiderToOrder(orderToEdit.id, pickupRiderName, 'PICKUP');
      }
      if (deliveryRiderName && deliveryRiderName !== 'Unassigned' && deliveryRiderName !== orderToEdit.deliveryRiderName) {
        assignRiderToOrder(orderToEdit.id, deliveryRiderName, 'DELIVERY');
      }
      if (partnerName && partnerName !== orderToEdit.partnerName) {
        assignPartnerToOrder(orderToEdit.id, partnerName);
      }
    } else {
      addOrder({
        customerName,
        customerPhone,
        customerAddress,
        partnerName: partnerName || 'Star Bright Laundry',
        riderName: pickupRiderName !== 'Unassigned' ? pickupRiderName : deliveryRiderName,
        pickupRiderName,
        deliveryRiderName,
        serviceName,
        itemsCount: Number(itemsCount),
        itemDetails,
        amount: Number(amount),
        status,
        pickupDate,
        deliveryDate,
        paymentMethod,
        paymentStatus,
        notes,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orderToEdit ? `Manage Order ${orderToEdit.id}` : 'Create Manual Laundry Order'}
      subtitle={
        orderToEdit
          ? 'Manage 2-leg rider assignments (Pickup & Delivery), vendor facility, items, and status'
          : 'Enter order information to book a customer pickup'
      }
      maxWidth="3xl"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {orderToEdit ? 'Save Order Updates' : 'Create Order Now'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Customer info */}
        <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Customer Information
            </h4>
            {orderToEdit?.customerDisplayId && (
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                {orderToEdit.customerDisplayId}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer</label>
              <select
                value={customerName}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.displayId || 'CUST'}) • {c.phone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup / Delivery Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
              placeholder="Flat / House / Landmark"
            />
          </div>
        </div>

        {/* 2-Leg Dispatch Assignment Box */}
        <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              Logistics Dispatch (2-Leg Model)
            </h4>
            <span className="text-[10px] font-semibold text-blue-600">
              Pickup & Delivery can have distinct riders
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Leg 1 Pickup Rider */}
            <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Leg 1 • Pickup Rider
              </label>
              <p className="text-[10px] text-slate-400">Customer ➔ Hub</p>
              <select
                value={pickupRiderName}
                onChange={(e) => setPickupRiderName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-1.5 mt-1"
              >
                <option value="Unassigned">Unassigned (Queue)</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.displayId || 'RDR'}) - {r.status}
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Hub */}
            <div className="bg-white p-3 rounded-lg border border-purple-100 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Vendor Hub Facility
              </label>
              <p className="text-[10px] text-slate-400">Washing & Ironing</p>
              <select
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-1.5 mt-1"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.displayId || 'VDR'}) - {v.zone}
                  </option>
                ))}
              </select>
            </div>

            {/* Leg 2 Delivery Rider */}
            <div className="bg-white p-3 rounded-lg border border-emerald-100 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">
                Leg 2 • Delivery Rider
              </label>
              <p className="text-[10px] text-slate-400">Hub ➔ Customer</p>
              <select
                value={deliveryRiderName}
                onChange={(e) => setDeliveryRiderName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-md p-1.5 mt-1"
              >
                <option value="Unassigned">Unassigned (Queue)</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.displayId || 'RDR'}) - {r.status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Service & Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} (₹{s.ratePerKgOrItem}{s.rateUnit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Garments / Qty</label>
            <input
              type="number"
              min="1"
              value={itemsCount}
              onChange={(e) => setItemsCount(Number(e.target.value))}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Bill Amount (₹)</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Item Breakdown / Notes</label>
          <input
            type="text"
            value={itemDetails}
            onChange={(e) => setItemDetails(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
            placeholder="e.g., 4 Formal Shirts, 2 Jeans, 1 Woolen Sweater"
          />
        </div>

        {/* Status & Times */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Order Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 font-bold text-blue-700"
            >
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
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Slot</label>
            <input
              type="text"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Slot</label>
            <input
              type="text"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
            />
          </div>
        </div>

        {/* Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
            >
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="COD">Cash on Delivery</option>
              <option value="Wallet">YesDhobi Wallet</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Special Handling Instructions</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2"
            placeholder="e.g. Ring doorbell, separate delicate whites, starch cuffs"
          />
        </div>
      </form>
    </Modal>
  );
};
