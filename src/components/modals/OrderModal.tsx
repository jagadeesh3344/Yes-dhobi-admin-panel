import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/types';
import { useData } from '@/context/DataContext';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToEdit?: Order | null;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, orderToEdit }) => {
  const { addOrder, updateOrder, customers, vendors, riders, services } = useData();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [riderName, setRiderName] = useState('Unassigned');
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
      setPartnerName(orderToEdit.partnerName);
      setRiderName(orderToEdit.riderName);
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
      // Default to first customer and vendor if available
      if (customers.length > 0) {
        setCustomerName(customers[0].name);
        setCustomerPhone(customers[0].phone);
        setCustomerAddress(customers[0].address);
      }
      if (vendors.length > 0) {
        setPartnerName(vendors[0].name);
      }
      setRiderName('Unassigned');
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
        riderName,
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
    } else {
      addOrder({
        customerName,
        customerPhone,
        customerAddress,
        partnerName: partnerName || 'Star Bright Laundry',
        riderName,
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
      subtitle={orderToEdit ? 'Update live status, dispatch rider, or reassign vendor' : 'Enter order information to book a customer pickup'}
      maxWidth="2xl"
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer info */}
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name</label>
              <select
                value={customerName}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Address</label>
            <input
              type="text"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
              placeholder="Flat / House / Landmark"
            />
          </div>
        </div>

        {/* Service & Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Service Type</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} (₹{s.ratePerKgOrItem}{s.rateUnit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Estimated Garments / Qty</label>
            <input
              type="number"
              min="1"
              value={itemsCount}
              onChange={(e) => setItemsCount(Number(e.target.value))}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Total Bill Amount (₹)</label>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 font-bold text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Item Breakdown / Notes</label>
          <input
            type="text"
            value={itemDetails}
            onChange={(e) => setItemDetails(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
            placeholder="e.g., 4 Formal Shirts, 2 Jeans, 1 Woolen Sweater"
          />
        </div>

        {/* Assignments & Status */}
        <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-3">
          <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Operational Dispatch</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Laundry Partner</label>
              <select
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assign Delivery Rider</label>
              <select
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
              >
                <option value="Unassigned">Unassigned (Auto-Queue)</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.status}) - {r.vehicle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Order Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 font-semibold text-blue-700"
              >
                <option value="Pending Pickup">Pending Pickup</option>
                <option value="Assigned">Assigned</option>
                <option value="In Laundry">In Laundry</option>
                <option value="Washing">Washing</option>
                <option value="Ironing">Ironing</option>
                <option value="Ready">Ready</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Times & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Pickup Slot</label>
            <input
              type="text"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Slot</label>
            <input
              type="text"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
            >
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="COD">Cash on Delivery</option>
              <option value="Wallet">YesDhobi Wallet</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Special Handling Instructions</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2"
            placeholder="e.g. Ring doorbell, starch cuffs, separate colored fabrics"
          />
        </div>
      </form>
    </Modal>
  );
};
