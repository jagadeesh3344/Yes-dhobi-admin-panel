import React, { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { VerificationItem } from '@/types';
import { useData } from '@/context/DataContext';
import { ShieldCheck, FileText, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Eye, Maximize2, ImageOff } from 'lucide-react';
import { resolveDocumentUrl } from '@/lib/api';

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
  const [brokenUrls, setBrokenUrls] = useState<Record<string, boolean>>({});

  // Reset local state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setIsRejecting(false);
      setRejectReason('');
      setPreviewImage(null);
    }
  }, [isOpen]);

  const handleApprove = () => {
    if (!item) return;
    approveVerification(item.id);
    onClose();
  };

  const handleReject = () => {
    if (!item) return;
    if (!rejectReason.trim()) {
      return;
    }
    rejectVerification(item.id, rejectReason.trim());
    setIsRejecting(false);
    setRejectReason('');
    onClose();
  };

  // Helper to match doc title with docUrls key
  const getDocUrl = (docName?: string): string | undefined => {
    if (!item?.docUrls || typeof item.docUrls !== 'object' || !docName) return undefined;
    const cleanDoc = String(docName).toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const [key, url] of Object.entries(item.docUrls)) {
      if (!key) continue;
      const cleanKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanDoc === cleanKey || cleanDoc.includes(cleanKey) || cleanKey.includes(cleanDoc)) {
        return typeof url === 'string' ? url : undefined;
      }
    }
    return undefined;
  };

  const formatTitle = (key?: unknown): string => {
    if (!key || typeof key !== 'string') return 'Document';
    const lower = key.toLowerCase();
    if (lower.includes('driving') || lower.includes('license')) return 'Driving License';
    if (lower.includes('aadhaarfront') || (lower.includes('aadhaar') && lower.includes('front'))) return 'Aadhaar Card (Front)';
    if (lower.includes('aadhaarback') || (lower.includes('aadhaar') && lower.includes('back'))) return 'Aadhaar Card (Back)';
    if (lower.includes('aadhaar')) return 'Aadhaar Card';
    if (lower.includes('panfront') || (lower.includes('pan') && lower.includes('front'))) return 'PAN Card (Front)';
    if (lower.includes('pan')) return 'PAN Card';
    if (lower.includes('selfie')) return 'Identity Verification Selfie';
    if (lower.includes('profile')) return 'Profile Avatar / Photo';
    if (lower.includes('shop')) return 'Shop Photo / Storefront';
    if (lower.includes('gst')) return 'GST Registration Certificate';
    if (lower.includes('trade')) return 'Trade License Certificate';
    if (lower.includes('labour')) return 'Labour License Proof';
    if (lower.includes('cheque')) return 'Cancelled Cheque / Bank Passbook';

    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // Comprehensive list of documents merging docUrls and docs (unconditionally registered hook)
  const displayDocs = useMemo(() => {
    if (!item) return [];
    const list: { title: string; url?: string; key: string }[] = [];
    const seen = new Set<string>();

    // 1. Gather all actual docUrls first
    if (item.docUrls && typeof item.docUrls === 'object') {
      for (const [rawKey, rawUrl] of Object.entries(item.docUrls)) {
        if (typeof rawUrl === 'string' && rawUrl.trim()) {
          const resolved = resolveDocumentUrl(rawUrl);
          const title = formatTitle(rawKey);
          list.push({ title, url: resolved, key: rawKey });
          seen.add(rawKey.toLowerCase().replace(/[^a-z0-9]/g, ''));
          seen.add(title.toLowerCase().replace(/[^a-z0-9]/g, ''));
        }
      }
    }

    // 2. Add any items from item.docs that weren't captured by docUrls
    const rawDocs = Array.isArray(item.docs) ? item.docs : [];
    for (const doc of rawDocs) {
      if (!doc || typeof doc !== 'string') continue;
      const clean = doc.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seen.has(clean)) {
        const rawUrl = getDocUrl(doc);
        const resolved = resolveDocumentUrl(rawUrl);
        const title = formatTitle(doc);
        list.push({ title, url: resolved, key: doc });
        seen.add(clean);
        seen.add(title.toLowerCase().replace(/[^a-z0-9]/g, ''));
      }
    }

    // 3. Fallback for Riders if no documents were uploaded yet
    if (item.type === 'Rider' && list.length === 0) {
      list.push(
        { title: 'Driving License', key: 'drivingLicense' },
        { title: 'Aadhaar Card (Front)', key: 'aadhaarFront' },
        { title: 'Aadhaar Card (Back)', key: 'aadhaarBack' },
        { title: 'Identity Verification Selfie', key: 'selfie' },
      );
    }

    return list;
  }, [item]);

  const isImageUrl = (url?: string) => {
    if (!url) return false;
    return (
      url.startsWith('data:image/') ||
      /\.(jpg|jpeg|png|webp|heic|gif)(\?.*)?$/i.test(url) ||
      url.includes('photo') ||
      url.includes('aadhaar') ||
      url.includes('pan') ||
      url.includes('license') ||
      url.includes('selfie') ||
      url.includes('uploads')
    );
  };

  // Safe early exit AFTER all hooks are registered
  if (!isOpen || !item) return null;

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
                    placeholder="Reason for rejection (e.g. Blurred Aadhaar photo, invalid driving license)..."
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
              <span className="text-slate-500 block mb-0.5 text-[11px]">Applicant Name</span>
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
                Uploaded Verification Documents ({displayDocs.length})
              </h4>
              <span className="text-[11px] text-slate-400">Click any document to inspect full size</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto p-1">
              {displayDocs.map((docItem, idx) => {
                const url = docItem.url;
                const isImage = isImageUrl(url);
                const isBroken = url ? brokenUrls[url] : false;

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
                        <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">{docItem.title}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          url ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600 bg-slate-100'
                        }`}
                      >
                        {url ? 'Available' : 'Pending'}
                      </span>
                    </div>

                    {/* Preview Thumbnail if image or URL exists */}
                    {url && isImage && !isBroken ? (
                      <div
                        onClick={() => setPreviewImage({ title: docItem.title, url })}
                        className="relative group h-32 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 cursor-pointer flex items-center justify-center my-1.5"
                      >
                        <img
                          src={url}
                          alt={docItem.title}
                          onError={() => setBrokenUrls((prev) => ({ ...prev, [url]: true }))}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                          <Maximize2 className="w-4 h-4" />
                          <span>Inspect Full Size</span>
                        </div>
                      </div>
                    ) : url && !isBroken ? (
                      <div className="h-20 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-500 my-1.5 text-xs">
                        <FileText className="w-6 h-6 text-slate-400 mb-1" />
                        <span>PDF / Attached Document</span>
                      </div>
                    ) : isBroken ? (
                      <div className="h-20 w-full bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-slate-400 my-1.5 text-xs">
                        <ImageOff className="w-5 h-5 mb-1 text-slate-400" />
                        <span className="text-[11px]">Preview unavailable</span>
                      </div>
                    ) : (
                      <div className="h-16 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[11px] my-1.5">
                        Awaiting partner upload
                      </div>
                    )}

                    {/* Action Link to open in new tab */}
                    {url ? (
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                        <button
                          type="button"
                          onClick={() => setPreviewImage({ title: docItem.title, url })}
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
                          Open High-Res
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
