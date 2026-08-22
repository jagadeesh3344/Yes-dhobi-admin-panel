import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Download, Trash2, Edit3, Store, Star, CheckCircle, AlertOctagon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { VendorModal } from '@/components/modals/VendorModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Vendor } from '@/types';

export default function Vendors() {
  const { vendors, deleteVendor, toggleVendorStatus } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.phone.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesZone = selectedZone === 'All' || vendor.zone.includes(selectedZone);
      const matchesStatus = selectedStatus === 'All' || vendor.status === selectedStatus;

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [vendors, searchQuery, selectedZone, selectedStatus]);

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_laundry_partners',
      filteredVendors.map((v) => ({
        VendorID: v.id,
        ShopName: v.name,
        Owner: v.owner,
        Phone: v.phone,
        Zone: v.zone,
        Address: v.location,
        DailyCapacityKg: v.capacityPerDay,
        ActiveOrders: v.activeOrders,
        CommissionPct: v.commissionRate,
        Status: v.status,
        Rating: v.rating,
        JoinedDate: v.joinedDate,
      }))
    );
  };

  const pendingApprovalsCount = vendors.filter((v) => v.status === 'Pending Verification').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Laundry Partners Network</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Onboard local dhobi shops, manage wash capacities, commission splits, and quality ratings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV ({filteredVendors.length})
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setVendorToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Shop
          </Button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Partner Hubs</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {vendors.filter((v) => v.status === 'Active').length}
            </h3>
          </div>
          <Store className="w-8 h-8 text-blue-600 p-1.5 bg-blue-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Network Capacity</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {vendors.reduce((s, v) => s + v.capacityPerDay, 0)} kg/day
            </h3>
          </div>
          <CheckCircle className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">KYC Queue</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{pendingApprovalsCount} Pending</h3>
          </div>
          <AlertOctagon className="w-8 h-8 text-amber-600 p-1.5 bg-amber-50 rounded-xl" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by shop name, owner, area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white"
              />
            </div>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All City Zones</option>
              <option value="Indiranagar">Indiranagar & HSR (Bangalore)</option>
              <option value="Andheri">Andheri & Bandra (Mumbai)</option>
              <option value="Karol Bagh">Karol Bagh & Dwarka (Delhi)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Partners</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredVendors.length} laundry hubs listed
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">ID</th>
                <th className="px-5 py-3 whitespace-nowrap">Shop & Business</th>
                <th className="px-5 py-3 whitespace-nowrap">Owner / Phone</th>
                <th className="px-5 py-3 whitespace-nowrap">City Zone & Address</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Daily Cap.</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Commission</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Quality Rating</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Status</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-400 whitespace-nowrap">
                    {vendor.id}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-bold text-slate-900">{vendor.name}</p>
                    <p className="text-[10px] text-slate-400">Joined {vendor.joinedDate}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-slate-800">{vendor.owner}</p>
                    <p className="text-[10px] text-slate-500">{vendor.phone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded block w-fit mb-0.5">
                      {vendor.zone}
                    </span>
                    <span className="text-slate-600 text-[11px] truncate block max-w-xs">{vendor.location}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {vendor.capacityPerDay} kg
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-700 whitespace-nowrap">
                    {vendor.commissionRate}%
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {vendor.rating > 0 ? vendor.rating : 'New'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {vendor.status === 'Active' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active Hub
                      </span>
                    )}
                    {vendor.status === 'Pending Verification' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Pending KYC
                      </span>
                    )}
                    {vendor.status === 'Suspended' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        Suspended
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
                          setVendorToEdit(vendor);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 text-[10px] font-bold px-2 ${
                          vendor.status === 'Active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        onClick={() => toggleVendorStatus(vendor.id)}
                      >
                        {vendor.status === 'Active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <button
                        onClick={() => setVendorToDelete(vendor)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Partner"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No vendor partners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Modal */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setVendorToEdit(null);
        }}
        vendorToEdit={vendorToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!vendorToDelete}
        onClose={() => setVendorToDelete(null)}
        onConfirm={() => {
          if (vendorToDelete) {
            deleteVendor(vendorToDelete.id);
            setVendorToDelete(null);
          }
        }}
        title={`Delete Vendor Partner?`}
        description={`Are you sure you want to delete "${vendorToDelete?.name || 'this vendor'}" operated by ${vendorToDelete?.owner || 'owner'}? Active routing and laundry orders assigned to this partner will be unlinked.`}
        confirmText="Yes, Delete Partner"
      />
    </div>
  );
}
