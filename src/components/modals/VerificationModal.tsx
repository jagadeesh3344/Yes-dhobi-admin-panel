import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { VerificationItem } from '@/types';
import { useData } from '@/context/DataContext';
import { ShieldCheck, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: VerificationItem | null;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, item }) => {
  const { approveVerification, rejectVerification } = useData();
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  if (!item) return null;

  const handleApprove = () => {
    approveVerification(item.id);
    onClose();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      return;
    }
    rejectVerification(item.id, rejectReason.trim());
    setIsRejecting(false);
    setRejectReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Review KYC Application #${item.id}`}
      subtitle={`Applicant: ${item.name} (${item.type}) • Submitted: ${item.submittedDate}`}
      maxWidth="lg"
      footer={
        item.status === 'Pending Review' ? (
          <>
            {isRejecting ? (
              <div className="w-full flex items-center justify-between gap-2">
                <input
                  type="text"
                  placeholder="Reason for rejection (e.g. Blurred Aadhaar photo)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="flex-1 text-xs border border-red-300 rounded-lg p-2 focus:ring-red-500"
                />
                <Button variant="destructive" size="sm" onClick={handleReject}>
                  Confirm Reject
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsRejecting(false)}>
                  Back
                </Button>
              </div>
            ) : (
              <>
                <Button variant="destructive" onClick={() => setIsRejecting(true)}>
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject KYC
                </Button>
                <Button onClick={handleApprove}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Approve & Activate
                </Button>
              </>
            )}
          </>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {/* Status banner */}
        <div
          className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
            item.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : item.status === 'Rejected'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Status: {item.status}</span>
          </div>
          <span>ID Ref: {item.idNumber || 'Pending Document Scan'}</span>
        </div>

        {/* Applicant Profile */}
        <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs">
          <div>
            <span className="text-gray-500 block mb-0.5">Applicant Name</span>
            <span className="font-bold text-gray-900 text-sm">{item.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Role Type</span>
            <span className="font-semibold text-gray-900">{item.type} Partner</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Contact Phone</span>
            <span className="font-semibold text-gray-900">{item.phone}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-0.5">Submission Date</span>
            <span className="font-semibold text-gray-900">{item.submittedDate}</span>
          </div>
        </div>

        {/* Uploaded Documents Preview */}
        <div>
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Uploaded Identification Proofs ({item.docs.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {item.docs.map((doc, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{doc} Document</p>
                    <p className="text-[10px] text-gray-500">Government Certified PDF/Scan</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {item.rejectionReason && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Rejection Remark:</span>
              <span>{item.rejectionReason}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
