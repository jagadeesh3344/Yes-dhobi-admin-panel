import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Download, Star, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { VendorModal } from '@/components/modals/VendorModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Vendor } from '@/types';

export default function Vendors() {
  const { vendors, deleteVendor, deleteVendors } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const combinedVendors = vendors;

  const filteredVendors = useMemo(() => {
    return combinedVendors.filter((vendor) => {
      const matchesSearch =
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesZone =
        selectedZone === 'All' ||
        vendor.zone.toLowerCase().includes(selectedZone.toLowerCase()) ||
        vendor.location.toLowerCase().includes(selectedZone.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && vendor.status === 'Active') ||
        (selectedStatus === 'Pending' && vendor.status === 'Pending Verification') ||
        (selectedStatus === 'Suspended' && vendor.status === 'Suspended') ||
        (selectedStatus === 'Inactive' && vendor.status === 'Inactive');

      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [combinedVendors, searchQuery, selectedZone, selectedStatus]);

  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendors.slice(start, start + itemsPerPage);
  }, [filteredVendors, currentPage]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage) || 1;

  // Checkbox selection helpers
  const isAllSelected =
    paginatedVendors.length > 0 &&
    paginatedVendors.every((v) => selectedVendorIds.includes(v.id));
  const isSomeSelected =
    paginatedVendors.some((v) => selectedVendorIds.includes(v.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = new Set(paginatedVendors.map((v) => v.id));
      setSelectedVendorIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const pageIds = paginatedVendors.map((v) => v.id);
      setSelectedVendorIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedVendorIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_laundry_partners',
      filteredVendors.map((v) => ({
        VendorID: v.id,
        ShopName: v.name,
        Owner: v.owner,
        Phone: v.phone,
        Zone: v.zone,
        CapacityKgPerDay: v.capacityPerDay,
        ActiveOrders: v.activeOrders,
        CommissionPct: v.commissionRate,
        Status: v.status,
        Rating: v.rating,
      }))
    );
  };

  const getStatusDisplay = (status: string) => {
    if (status === 'Active') {
      return {
        label: 'Active',
        classes: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      };
    }
    if (status === 'Pending Verification') {
      return {
        label: 'Pending',
        classes: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    }
    if (status === 'Suspended') {
      return {
        label: 'Suspended',
        classes: 'bg-rose-50 text-rose-600 border-rose-200',
      };
    }
    return {
      label: 'Inactive',
      classes: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by vendor name, owner, area..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 text-xs sm:text-sm bg-white border-slate-200 rounded-xl"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Status: All Vendors</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending Verification</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={selectedZone}
            onChange={(e) => {
              setSelectedZone(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Zone: All Zones</option>
            <option value="Bandra">Bandra</option>
            <option value="Andheri">Andheri</option>
            <option value="Powai">Powai</option>
            <option value="Worli">Worli</option>
            <option value="Juhu">Juhu</option>
            <option value="Goregaon">Goregaon</option>
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-10 text-xs sm:text-sm font-semibold rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setVendorToEdit(null);
              setIsModalOpen(true);
            }}
            className="h-10 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm shadow-blue-600/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedVendorIds.length > 0 && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-900 px-4 py-2.5 rounded-xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold">
              {selectedVendorIds.length} vendor{selectedVendorIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedVendorIds([])}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
            >
              Clear selection
            </button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="h-8 px-3 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedVendorIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Vendors Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    title="Select all on this page"
                  />
                </th>
                <th className="px-5 py-3.5 whitespace-nowrap">Vendor ID</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Vendor / Shop Name</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Owner & Contact</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Location / Zone</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Capacity / Day</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Active Orders</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Commission</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Rating</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedVendors.map((vendor) => {
                const statusMeta = getStatusDisplay(vendor.status);
                const isSelected = selectedVendorIds.includes(vendor.id);
                return (
                  <tr
                    key={vendor.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/50 hover:bg-blue-50/70' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(vendor.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        aria-label={`Select vendor ${vendor.name}`}
                      />
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">{vendor.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{vendor.name}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-slate-900 font-medium">{vendor.owner}</p>
                      <p className="text-[11px] text-slate-500">{vendor.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">{vendor.location}</td>
                    <td className="px-5 py-3.5 text-slate-800 font-semibold whitespace-nowrap">{vendor.capacityPerDay} kg/day</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {vendor.activeOrders > 0 ? (
                        <span className="text-blue-600 font-bold">{vendor.activeOrders} active</span>
                      ) : (
                        <span className="text-slate-400">0 active</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-800 whitespace-nowrap">{vendor.commissionRate}%</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap min-w-[85px] ${statusMeta.classes}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-amber-500 flex items-center gap-1 pt-4">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{vendor.rating.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setVendorToEdit(vendor);
                            setIsModalOpen(true);
                          }}
                          className="px-3.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => setVendorToDelete(vendor)}
                          title="Delete Vendor"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedVendors.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-slate-400">
                    No laundry vendors found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <p>
            Showing {filteredVendors.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredVendors.length)} of {filteredVendors.length} verified vendor hubs
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 text-xs rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              Previous
            </Button>
            {[1, 2, 3].map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 text-xs p-0 rounded-lg cursor-pointer ${
                  currentPage === page ? 'bg-blue-600 text-white' : ''
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 text-xs rounded-lg cursor-pointer"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Button>
          </div>
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

      {/* Single Vendor Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!vendorToDelete}
        onClose={() => setVendorToDelete(null)}
        onConfirm={() => {
          if (vendorToDelete) {
            deleteVendor(vendorToDelete.id);
            setSelectedVendorIds((prev) => prev.filter((id) => id !== vendorToDelete.id));
            setVendorToDelete(null);
          }
        }}
        title={`Delete Vendor ${vendorToDelete?.name || ''}?`}
        description={`Are you sure you want to delete ${vendorToDelete?.name || 'this vendor'} (Owner: ${vendorToDelete?.owner || 'Partner'}, ${vendorToDelete?.location || ''})? This will deactivate their hub and remove them from active dispatch.`}
        confirmText="Yes, Delete Vendor"
      />

      {/* Bulk Delete Vendors Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={() => {
          deleteVendors(selectedVendorIds);
          setSelectedVendorIds([]);
          setIsBulkDeleteModalOpen(false);
        }}
        title={`Delete ${selectedVendorIds.length} Selected Vendors?`}
        description={`Are you sure you want to permanently delete and deactivate the ${selectedVendorIds.length} selected vendor partners? This will remove them from active dispatch and orders.`}
        confirmText={`Yes, Delete (${selectedVendorIds.length}) Vendors`}
      />
    </div>
  );
}
