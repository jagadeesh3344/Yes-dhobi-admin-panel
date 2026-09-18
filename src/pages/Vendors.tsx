import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Download, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { VendorModal } from '@/components/modals/VendorModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Vendor } from '@/types';

export default function Vendors() {
  const { vendors } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState<Vendor | null>(null);
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

      const matchesZone = selectedZone === 'All' || vendor.zone.toLowerCase().includes(selectedZone.toLowerCase()) || vendor.location.toLowerCase().includes(selectedZone.toLowerCase());

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

      {/* Vendors Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100 bg-slate-50/70">
              <tr>
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
                return (
                  <tr
                    key={vendor.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
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
                      <button
                        onClick={() => {
                          setVendorToEdit(vendor);
                          setIsModalOpen(true);
                        }}
                        className="px-3.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}

              {paginatedVendors.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400">
                    No laundry vendors found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <p>Showing 1-{paginatedVendors.length} of 32 verified vendor hubs</p>
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
    </div>
  );
}
