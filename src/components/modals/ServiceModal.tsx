import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ServiceCategory } from '@/types';
import { useData } from '@/context/DataContext';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: ServiceCategory | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({ isOpen, onClose, serviceToEdit }) => {
  const { addService, updateService } = useData();

  const [name, setName] = useState('');
  const [ratePerKgOrItem, setRatePerKgOrItem] = useState(60);
  const [rateUnit, setRateUnit] = useState<'/kg' | '/item' | '/spot'>('/kg');
  const [leadTimeHours, setLeadTimeHours] = useState(24);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setRatePerKgOrItem(serviceToEdit.ratePerKgOrItem);
      setRateUnit(serviceToEdit.rateUnit);
      setLeadTimeHours(serviceToEdit.leadTimeHours);
      setStatus(serviceToEdit.status);
      setDescription(serviceToEdit.description);
    } else {
      setName('');
      setRatePerKgOrItem(60);
      setRateUnit('/kg');
      setLeadTimeHours(24);
      setStatus('Active');
      setDescription('');
    }
  }, [serviceToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (serviceToEdit) {
      updateService(serviceToEdit.id, {
        name,
        ratePerKgOrItem: Number(ratePerKgOrItem),
        rateUnit,
        leadTimeHours: Number(leadTimeHours),
        status,
        description,
      });
    } else {
      addService({
        name,
        ratePerKgOrItem: Number(ratePerKgOrItem),
        rateUnit,
        leadTimeHours: Number(leadTimeHours),
        status,
        iconName: 'WashingMachine',
        description: description || 'Standard professional laundry service handled by verified local dhobis.',
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={serviceToEdit ? `Edit Service: ${serviceToEdit.name}` : 'Add New Service Category'}
      subtitle="Configure pricing unit, baseline rates, and guaranteed turnaround time"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {serviceToEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Service Title *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            placeholder="e.g. Steam Pressing & Creasing"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Base Price (₹) *</label>
            <input
              type="number"
              min="1"
              required
              value={ratePerKgOrItem}
              onChange={(e) => setRatePerKgOrItem(Number(e.target.value))}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Billing Unit</label>
            <select
              value={rateUnit}
              onChange={(e) => setRateUnit(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            >
              <option value="/kg">Per Kilogram (/kg)</option>
              <option value="/item">Per Garment Item (/item)</option>
              <option value="/spot">Per Treatment (/spot)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Turnaround Time (Hours)</label>
            <input
              type="number"
              min="1"
              value={leadTimeHours}
              onChange={(e) => setLeadTimeHours(Number(e.target.value))}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-semibold"
            >
              <option value="Active">Active (Customer Visible)</option>
              <option value="Inactive">Inactive (Hidden)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Service Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            placeholder="Briefly describe what this laundry process entails..."
          />
        </div>
      </form>
    </Modal>
  );
};
