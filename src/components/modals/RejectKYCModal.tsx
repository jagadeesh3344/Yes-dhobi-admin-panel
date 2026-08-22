import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { VerificationItem } from '@/types';
import { useData } from '@/context/DataContext';

interface RejectKYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: VerificationItem | null;
}

export const RejectKYCModal: React.FC<RejectKYCModalProps> = ({ isOpen, onClose, item }) => {
  const { rejectVerification } = useData();
  const [reason, setReason] = useState('Document photo is blurred or unreadable');

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    rejectVerification(item.id, reason.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reject KYC for ${item.name}`}
      subtitle={`Applicant ID #${item.id} • ${item.type} Application`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Reason for KYC Rejection *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
            placeholder="e.g. Blurred document, Expired driver's license, GSTIN mismatch, Missing PAN copy"
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-500">Quick preset reasons:</p>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Blurred or illegible document scan',
              'Expired vehicle driving license',
              'Name mismatch between Aadhaar & PAN',
              'Missing shop GST registration proof',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReason(preset)}
                className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button type="submit" variant="destructive" size="sm" className="text-xs font-semibold px-4">
            Reject Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
