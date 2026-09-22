import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { VerificationItem } from '@/types';
import { useData } from '@/context/DataContext';
import { ShieldCheck, FileText, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Eye, Maximize2 } from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: VerificationItem | null;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, item }) => {
  const { approveVerification, rejectVerification } = useData();
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);

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

  // Helper to match doc title with docUrls key
  const getDocUrl = (docName: string): string | undefined => {
    if (!item.docUrls) return undefined;
    const cleanDoc = docName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [key, url] of Object.entries(item.docUrls)) {
      const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanDoc === cleanKey || cleanDoc.includes(cleanKey) || cleanKey.includes(cleanDoc)) {
        return url;
      }
    }
    return undefined;
  };

  const isImageUrl = (url?: string) => {
    if (!url) return false;
    return (
      url.startsWith('data:image/') ||
      /\.(jpg|jpeg|png|webp|heic|gif)(\?.*)?$/i.test(url) ||
      url.includes('photo') ||
      url.includes('aadhaar') ||
      url.includes('pan') ||
      url.includes('license')
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Review KYC Application #${item.id}`}
        subtitle={`Applicant: ${item.name} (${item.type}) • Submitted: ${item.submittedDate}`}
        maxWidth="2xl"
        footer={
          item.status === 'Pending Review' ? (
            <>
              {isRejecting ? (
                <div className="w-full flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Reason for rejection (e.g. Blurred Aadhaar photo, invalid PAN)..."
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
                  <Button onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
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
            <span>ID Reference: {item.idNumber || 'Pending Document Scan'}</span>
          </div>

          {/* Applicant Profile Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5 text-[11px]">Shop / Business</span>
              <span className="font-bold text-slate-900 text-sm">{item.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5 text-[11px]">Role Type</span>
              <span className="font-semibold text-slate-900">{item.type} Partner</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5 text-[11px]">Contact Mobile</span>
              <span className="font-semibold text-slate-900">{item.phone}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5 text-[11px]">Submitted On</span>
              <span className="font-semibold text-slate-900">{item.submittedDate}</span>
            </div>
          </div>

          {/* Uploaded Documents Grid with Clear Previews */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Uploaded Verification Documents ({item.docs.length})
              </h4>
              <span className="text-[11px] text-slate-400">Click any document to inspect full size</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto p-1">
              {item.docs.map((doc, idx) => {
                const url = getDocUrl(doc);
                const hasImage = isImageUrl(url);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between hover:border-blue-400 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs font-bold text-slate-900">{doc}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Uploaded
                      </span>
                    </div>

                    {/* Preview Thumbnail if image or URL exists */}
                    {url && hasImage ? (
                      <div
                        onClick={() => setPreviewImage({ title: doc, url })}
                        className="relative group h-32 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-pointer flex items-center justify-center my-1.5"
                      >
                        <img
                          src={url}
                          alt={doc}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                          <Maximize2 className="w-4 h-4" />
                          <span>Inspect Full Size</span>
                        </div>
                      </div>
                    ) : url ? (
                      <div className="h-20 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-500 my-1.5 text-xs">
                        <FileText className="w-6 h-6 text-slate-400 mb-1" />
                        <span>PDF / Certified Attachment</span>
                      </div>
                    ) : (
                      <div className="h-16 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[11px] my-1.5">
                        Document reference scanned
                      </div>
                    )}

                    {/* Action Link to open in new tab */}
                    {url ? (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ title: doc, url })}
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          Quick View
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Open File
                        </a>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-1">Verified on physical onboarding</p>
                    )}
                  </div>
                );
              })}
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

      {/* Full-Screen Document Inspection Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">{previewImage.title} Inspection</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open High-Res
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-900/5 rounded-xl p-2 min-h-[300px]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
