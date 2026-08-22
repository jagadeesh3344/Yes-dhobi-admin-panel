import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types';
import { useData } from '@/context/DataContext';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customerToEdit }) => {
  const { addCustomer, updateCustomer } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [walletBalance, setWalletBalance] = useState(0);
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'VIP'>('Active');

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email);
      setAddress(customerToEdit.address);
      setCity(customerToEdit.city);
      setWalletBalance(customerToEdit.walletBalance);
      setStatus(customerToEdit.status);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCity('Bangalore');
      setWalletBalance(100);
      setStatus('Active');
    }
  }, [customerToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        address,
        city,
        walletBalance: Number(walletBalance),
        status,
      });
    } else {
      addCustomer({
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        address: address || 'Indiranagar, Bangalore',
        city,
        totalOrders: 0,
        walletBalance: Number(walletBalance),
        status,
        lastOrderDate: 'Never',
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? `Edit Customer: ${customerToEdit.name}` : 'Add New Customer Profile'}
      subtitle={customerToEdit ? 'Update contact info and wallet details' : 'Register a new customer for laundry pickup services'}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {customerToEdit ? 'Save Customer' : 'Add Customer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            placeholder="e.g. Ramesh Chandra"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
              placeholder="user@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery / Residence Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            placeholder="Flat 302, Green Glen Layout"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">City Hub</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            >
              <option value="Bangalore">Bangalore</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Pune">Pune</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Wallet Credit (₹)</label>
            <input
              type="number"
              min="0"
              value={walletBalance}
              onChange={(e) => setWalletBalance(Number(e.target.value))}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Account Tier</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-semibold"
            >
              <option value="Active">Active</option>
              <option value="VIP">VIP Gold</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
