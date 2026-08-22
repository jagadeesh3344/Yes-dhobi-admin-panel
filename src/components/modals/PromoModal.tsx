import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Promotion } from '@/types';
import { useData } from '@/context/DataContext';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoToEdit?: Promotion | null;
}

export const PromoModal: React.FC<PromoModalProps> = ({ isOpen, onClose, promoToEdit }) => {
  const { addPromotion, updatePromotion } = useData();

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Percentage' | 'Flat' | 'Free Delivery'>('Percentage');
  const [discountValue, setDiscountValue] = useState(20);
  const [minOrder, setMinOrder] = useState(199);
  const [maxUses, setMaxUses] = useState<number | string>(1000);
  const [validity, setValidity] = useState('30 Days');
  const [status, setStatus] = useState<'Active' | 'Expired' | 'Scheduled'>('Active');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (promoToEdit) {
      setCode(promoToEdit.code);
      setTitle(promoToEdit.title);
      setType(promoToEdit.type);
      setDiscountValue(promoToEdit.discountValue);
      setMinOrder(promoToEdit.minOrder);
      setMaxUses(promoToEdit.maxUses);
      setValidity(promoToEdit.validity);
      setStatus(promoToEdit.status);
      setDescription(promoToEdit.description || '');
    } else {
      setCode('');
      setTitle('');
      setType('Percentage');
      setDiscountValue(20);
      setMinOrder(199);
      setMaxUses(2500);
      setValidity('Valid till 31 Dec');
      setStatus('Active');
      setDescription('');
    }
  }, [promoToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, '');

    if (promoToEdit) {
      updatePromotion(promoToEdit.code, {
        title,
        type,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder),
        maxUses: maxUses === 'Unlimited' ? 'Unlimited' : Number(maxUses),
        validity,
        status,
        description,
      });
    } else {
      addPromotion({
        code: formattedCode,
        title,
        type,
        discountValue: Number(discountValue),
        minOrder: Number(minOrder),
        usedCount: 0,
        maxUses: maxUses === 'Unlimited' ? 'Unlimited' : Number(maxUses),
        validity,
        status,
        description: description || 'Special limited time promotional discount.',
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={promoToEdit ? `Edit Coupon: ${promoToEdit.code}` : 'Create New Promotion Coupon'}
      subtitle="Configure discount rules, threshold restrictions, and campaign duration"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {promoToEdit ? 'Update Coupon' : 'Launch Campaign'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code *</label>
            <input
              type="text"
              required
              disabled={!!promoToEdit}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 uppercase font-bold tracking-wider disabled:bg-gray-100"
              placeholder="e.g. CLEAN50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-medium"
            >
              <option value="Percentage">Percentage Discount (%)</option>
              <option value="Flat">Flat Cash Off (₹)</option>
              <option value="Free Delivery">Free Rider Delivery</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Campaign Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            placeholder="e.g. 50% Off First Laundry Order"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {type === 'Percentage' ? 'Discount Value (%)' : 'Discount Value (₹)'}
            </label>
            <input
              type="number"
              min="1"
              max={type === 'Percentage' ? 100 : 5000}
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Order (₹)</label>
            <input
              type="number"
              min="0"
              value={minOrder}
              onChange={(e) => setMinOrder(Number(e.target.value))}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Validity Text / Date</label>
            <input
              type="text"
              value={validity}
              onChange={(e) => setValidity(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
              placeholder="e.g. 01 Jan - 31 Dec"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-semibold"
            >
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};
