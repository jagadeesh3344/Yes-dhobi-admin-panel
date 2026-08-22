import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddZone: (zone: { name: string; city: string; status: 'Operational' | 'Paused' }) => void;
}

export const ZoneModal: React.FC<ZoneModalProps> = ({ isOpen, onClose, onAddZone }) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [status, setStatus] = useState<'Operational' | 'Paused'>('Operational');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddZone({
      name: name.trim(),
      city: city.trim() || 'Bangalore',
      status,
    });
    setName('');
    setCity('Bangalore');
    setStatus('Operational');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Service Operational Zone"
      subtitle="Define a delivery cluster and city for rider routing"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Zone / Locality Cluster *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Whitefield, Koramangala, Indiranagar, HSR Layout"
            required
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Bangalore, Hyderabad, Mumbai, Delhi"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Operational' | 'Paused')}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Operational">Operational</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="text-xs font-semibold px-4">
            Add Service Zone
          </Button>
        </div>
      </form>
    </Modal>
  );
};
