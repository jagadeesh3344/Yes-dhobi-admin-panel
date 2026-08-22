import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ isOpen, onClose }) => {
  const { addTicket } = useData();

  const [subject, setSubject] = useState('');
  const [by, setBy] = useState('');
  const [role, setRole] = useState<'Customer' | 'Vendor' | 'Rider'>('Customer');
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [category, setCategory] = useState<
    'Damage' | 'Delay' | 'Payout' | 'App Bug' | 'Refund' | 'Delivery' | 'Quality'
  >('Quality');
  const [initialMessage, setInitialMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !by.trim()) return;

    addTicket({
      subject: subject.trim(),
      by: by.trim(),
      role,
      priority,
      category,
      status: 'Open',
      initialMessage: initialMessage.trim() || subject.trim(),
    });

    setSubject('');
    setBy('');
    setInitialMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Support Ticket"
      subtitle="Log a complaint, refund claim, or operational incident"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Issue Subject *</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Garment color bleeding in Wash & Fold, Missing item"
            required
            className="text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Raised By (Name) *
            </label>
            <Input
              value={by}
              onChange={(e) => setBy(e.target.value)}
              placeholder="e.g. Rahul Sharma, Express Dry Cleaners"
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">User Stakeholder</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Customer">Customer</option>
              <option value="Vendor">Laundry Partner (Vendor)</option>
              <option value="Rider">Delivery Rider</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Quality">Fabric / Wash Quality</option>
              <option value="Damage">Garment Damage</option>
              <option value="Delay">Turnaround SLA Delay</option>
              <option value="Refund">Refund / Payment Claim</option>
              <option value="Payout">Vendor / Rider Payout Dispute</option>
              <option value="Delivery">Pickup & Delivery Issue</option>
              <option value="App Bug">Application / System Bug</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">SLA Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="Critical">Critical (Immediate escalation)</option>
              <option value="High">High (4-Hour SLA)</option>
              <option value="Medium">Medium (12-Hour SLA)</option>
              <option value="Low">Low (24-Hour SLA)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Detailed Issue Note / Explanation *
          </label>
          <textarea
            value={initialMessage}
            onChange={(e) => setInitialMessage(e.target.value)}
            rows={3}
            placeholder="Describe the complaint, customer remarks, order number if applicable..."
            required
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" size="sm" className="text-xs font-semibold px-4">
            Log Support Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};
