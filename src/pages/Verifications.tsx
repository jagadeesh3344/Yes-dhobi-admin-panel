import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ShieldCheck, CheckCircle2, XCircle, Store, Truck, Download, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { VerificationModal } from '@/components/modals/VerificationModal';
import { RejectKYCModal } from '@/components/modals/RejectKYCModal';
import { VerificationItem } from '@/types';
import { exportToCsv } from '@/lib/exportCsv';
import { useToast } from '@/context/ToastContext';

export default function Verifications() {
  const { verifications, approveVerification } = useData();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'All' | 'Vendor' | 'Rider'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [itemToReject, setItemToReject] = useState<VerificationItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pendingCount = verifications.filter((v) => v.status === 'Pending Review').length;
  const approvedCount = verifications.filter((v) => v.status === 'Approved').length;
  const rejectedCount = verifications.filter((v) => v.status === 'Rejected').length;

  const vendorPending = verifications.filter((v) => v.type === 'Vendor' && v.status === 'Pending Review').length;
  const riderPending = verifications.filter((v) => v.type === 'Rider' && v.status === 'Pending Review').length;

  const filteredVerifications = useMemo(() => {
    return verifications.filter((v) => {
      const matchesTab = activeTab === 'All' || v.type === activeTab;
      const matchesSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.docs.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [verifications, activeTab, searchQuery]);

  const handleQuickApprove = (item: VerificationItem) => {
    approveVerification(item.id);
  };

  const handleQuickReject = (item: VerificationItem) => {
    setItemToReject(item);
  };

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_kyc_verifications',
      filteredVerifications.map((v) => ({
        ID: v.id,
        Name: v.name,
        ApplicantType: v.type,
        Phone: v.phone,
        Documents: v.docs.join(', '),
        Status: v.status,
        SubmittedDate: v.submittedDate,
        RejectionNotes: v.rejectionReason || 'None',
      }))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity KYC & Legal Approvals</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify government Aadhaar, PAN, GSTIN licenses, and driver credentials before enabling live order dispatch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export KYC Registry
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Action</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount} Applicants</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">{vendorPending} Vendors • {riderPending} Riders</p>
          </div>
          <ShieldCheck className="w-8 h-8 text-amber-600 p-1.5 bg-amber-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified & Active</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{approvedCount} Onboarded</h3>
            <p className="text-[10px] text-emerald-600 mt-0.5">Full platform access granted</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected Documents</p>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{rejectedCount} Re-uploaded</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Flagged for document audit</p>
          </div>
          <XCircle className="w-8 h-8 text-rose-600 p-1.5 bg-rose-50 rounded-xl" />
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Toolbar & Tabs */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'All'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Applicants ({verifications.length})
            </button>

            <button
              onClick={() => setActiveTab('Vendor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'Vendor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Vendors</span>
              {vendorPending > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 rounded-full font-extrabold">
                  {vendorPending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('Rider')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'Rider'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Riders</span>
              {riderPending > 0 && (
                <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 rounded-full font-extrabold">
                  {riderPending}
                </span>
              )}
            </button>
          </div>

          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search applicant name, phone, doc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Applicant Name</th>
                <th className="px-5 py-3 whitespace-nowrap">Role Type</th>
                <th className="px-5 py-3 whitespace-nowrap">Contact Phone</th>
                <th className="px-5 py-3 whitespace-nowrap">Submitted Date</th>
                <th className="px-5 py-3 whitespace-nowrap">Government Documents</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">KYC Status</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVerifications.map((v) => (
                <tr key={v.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {v.name}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        v.type === 'Vendor' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {v.type === 'Vendor' ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                      {v.type} Partner
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                    {v.phone}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                    {v.submittedDate}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {v.docs.map((doc) => (
                        <span
                          key={doc}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {v.status === 'Pending Review' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Pending Review
                      </span>
                    )}
                    {v.status === 'Approved' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Approved
                      </span>
                    )}
                    {v.status === 'Rejected' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold px-2.5"
                        onClick={() => {
                          setSelectedVerification(v);
                          setIsModalOpen(true);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Inspect Docs
                      </Button>

                      {v.status === 'Pending Review' && (
                        <>
                          <Button
                            size="sm"
                            className="h-7 text-xs font-semibold px-2.5 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => handleQuickApprove(v)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs font-semibold px-2.5 text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => handleQuickReject(v)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVerifications.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No verification records in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Inspection Modal */}
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVerification(null);
        }}
        item={selectedVerification}
      />

      {/* Quick Reject Modal */}
      <RejectKYCModal
        isOpen={!!itemToReject}
        onClose={() => setItemToReject(null)}
        item={itemToReject}
      />
    </div>
  );
}
