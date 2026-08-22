import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/context/ToastContext';
import { Radio } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [targetAudience, setTargetAudience] = useState<'All' | 'Customers' | 'Riders' | 'Vendors'>('All');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'High Alert'>('Normal');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    showToast(
      'Push Notification Dispatched',
      `Alert broadcasted to ${targetAudience} audience successfully.`
    );
    setTitle('');
    setMessage('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast System Notification"
      subtitle="Send instant mobile push alerts and in-app banners across stakeholders"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleBroadcast}>
            <Radio className="w-4 h-4 mr-1.5" />
            Dispatch Alert
          </Button>
        </>
      }
    >
      <form onSubmit={handleBroadcast} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-medium"
            >
              <option value="All">All Users & Fleet</option>
              <option value="Customers">Customers Only</option>
              <option value="Riders">Delivery Riders Only</option>
              <option value="Vendors">Laundry Partners Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-semibold"
            >
              <option value="Normal">Normal Notice</option>
              <option value="High Alert">High Priority Alert</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Notification Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            placeholder="e.g. Monsoon Pickup Timings Update"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Notification Body *</label>
          <textarea
            rows={3}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            placeholder="Type announcement message to broadcast to mobile applications..."
          />
        </div>
      </form>
    </Modal>
  );
};
