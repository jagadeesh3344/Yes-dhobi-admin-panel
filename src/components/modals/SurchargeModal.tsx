import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { SurchargeRule } from '@/types';

interface SurchargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  surchargeToEdit?: SurchargeRule | null;
}

export const SurchargeModal: React.FC<SurchargeModalProps> = ({
  isOpen,
  onClose,
  surchargeToEdit,
}) => {
  const { addSurcharge, updateSurcharge } = useData();

  const [rule, setRule] = useState('');
  const [modifier, setModifier] = useState('Flat ₹40');
  const [trigger, setTrigger] = useState('Selected at checkout');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    if (surchargeToEdit) {
      setRule(surchargeToEdit.rule);
      setModifier(surchargeToEdit.modifier);
      setTrigger(surchargeToEdit.trigger);
      setStatus(surchargeToEdit.status);
    } else {
      setRule('');
      setModifier('Flat ₹40');
      setTrigger('Orders placed during peak slots (6 PM - 10 PM)');
      setStatus('Active');
    }
  }, [surchargeToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rule.trim()) return;

    if (surchargeToEdit) {
      updateSurcharge(surchargeToEdit.id, {
        rule,
        modifier,
        trigger,
        status,
      });
    } else {
      addSurcharge({
        rule,
        modifier,
        trigger,
        status,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={surchargeToEdit ? 'Edit Dynamic Surcharge Rule' : 'New Pricing Surcharge Rule'}
      subtitle="Configure surge multiplier or flat fee condition triggers"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Rule Name / Description *
          </label>
          <Input
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            placeholder="e.g. Express 24-Hr Delivery Surge, Rain Surge, Night Surcharge"
            required
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Surcharge Fee / Multiplier *
            </label>
            <Input
              value={modifier}
              onChange={(e) => setModifier(e.target.value)}
              placeholder="e.g. Flat ₹49 or 1.5x Multiplier"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Condition Trigger / Operational Rule *
          </label>
          <Input
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="e.g. Orders placed between 6 PM - 10 PM, Monsoon Alert, Express Checkouts"
            required
            className="text-xs"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="text-xs font-semibold px-4">
            {surchargeToEdit ? 'Save Rule' : 'Create Surcharge Rule'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
