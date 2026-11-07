import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Download, Star, ChevronLeft, ChevronRight, Eye, Trash2, Copy, Check } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { RiderModal } from '@/components/modals/RiderModal';
import { VerificationModal } from '@/components/modals/VerificationModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { formatRiderDisplayId } from '@/lib/idUtils';
import { Rider, VerificationItem } from '@/types';

export default function Riders() {
  const { riders, verifications, deleteRider, deleteRiders } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riderToEdit, setRiderToEdit] = useState<Rider | null>(null);
  const [riderToDelete, setRiderToDelete] = useState<Rider | null>(null);
  const [selectedRiderIds, setSelectedRiderIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 8;

  const combinedRiders = riders;

  const getDisplayId = (r: Rider) => r.displayId || formatRiderDisplayId(r.id);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredRiders = useMemo(() => {
    return combinedRiders.filter((rider) => {
      const dispId = getDisplayId(rider);
      const q = searchQuery.toLowerCase().trim();
      const numOnly = dispId.replace(/\D/g, '');

      const matchesSearch =
        !q ||
        rider.name.toLowerCase().includes(q) ||
        rider.phone.toLowerCase().includes(q) ||
        (rider.vehicleNumber && rider.vehicleNumber.toLowerCase().includes(q)) ||
        rider.id.toLowerCase().includes(q) ||
        dispId.toLowerCase().includes(q) ||
        numOnly.includes(q);

      const matchesVehicle =
        selectedVehicle === 'All' ||
        (selectedVehicle === 'Electric Bike' && rider.vehicle === 'Electric Bike') ||
        (selectedVehicle === 'Motorcycle' && rider.vehicle === 'Motorcycle') ||
        (selectedVehicle === 'Van' && rider.vehicle === 'Van');

      const matchesStatus =
        selectedStatus === 'All'
          ? rider.status !== 'Inactive'
          : (selectedStatus === 'Available' && (rider.status === 'Online' || rider.status === 'Available')) ||
            (selectedStatus === 'On Delivery' && rider.status === 'On Delivery') ||
            (selectedStatus === 'Offline' && rider.status === 'Offline');

      const matchesZone = selectedZone === 'All' || rider.zone.toLowerCase().includes(selectedZone.toLowerCase());

      return matchesSearch && matchesVehicle && matchesStatus && matchesZone;
    });
  }, [combinedRiders, searchQuery, selectedVehicle, selectedStatus, selectedZone]);

  const paginatedRiders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRiders.slice(start, start + itemsPerPage);
  }, [filteredRiders, currentPage]);

  const totalPages = Math.ceil(filteredRiders.length / itemsPerPage) || 1;

  // Checkbox selection helpers
  const isAllSelected =
    paginatedRiders.length > 0 &&
    paginatedRiders.every((r) => selectedRiderIds.includes(r.id));
  const isSomeSelected =
    paginatedRiders.some((r) => selectedRiderIds.includes(r.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = new Set(paginatedRiders.map((r) => r.id));
      setSelectedRiderIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const pageIds = paginatedRiders.map((r) => r.id);
      setSelectedRiderIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedRiderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_rider_fleet',
      filteredRiders.map((r) => ({
        RiderID: getDisplayId(r),
        SystemID: r.id,
        Name: r.name,
        Phone: r.phone,
        Vehicle: r.vehicle,
        PlateNumber: r.vehicleNumber,
        Zone: r.zone,
        Status: r.status === 'Online' ? 'Available' : r.status,
        ActiveOrders: r.activeOrders,
        TotalDeliveries: r.totalDeliveries,
        Rating: r.rating,
      }))
    );
  };

  const getStatusDisplay = (status: string) => {
    if (status === 'Online' || status === 'Available') {
      return {
        label: 'Available',
        classes: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      };
    }
    if (status === 'On Delivery') {
      return {
        label: 'On Delivery',
        classes: 'bg-blue-50 text-blue-600 border-blue-200',
      };
    }
    return {
      label: 'Offline',
      classes: 'bg-slate-100 text-slate-600 border-slate-200',
    };
  };

  const handleInspectDocs = (rider: Rider) => {
    if (!rider) return;
    const matched = verifications.find(
      (v) =>
        (v.riderId && v.riderId === rider.id) ||
        (v.phone && rider.phone && v.phone === rider.phone) ||
        (v.name && rider.name && v.name.toLowerCase() === rider.name.toLowerCase())
    );

    if (matched) {
      setSelectedVerification({
        ...matched,
        docUrls: {
          ...(typeof rider.documents === 'object' && rider.documents ? rider.documents : {}),
          ...(typeof matched.docUrls === 'object' && matched.docUrls ? matched.docUrls : {}),
        },
        idNumber: matched.idNumber || rider.drivingLicenseNumber,
      });
    } else {
      const docsObj = (typeof rider.documents === 'object' && rider.documents ? rider.documents : {}) as Record<string, string>;
      setSelectedVerification({
        id: rider.id || 'RIDER',
        name: rider.name || 'Rider',
        type: 'Rider',
        phone: rider.phone || '',
        submittedDate: 'Active Profile',
        status: 'Approved',
        docs: Object.keys(docsObj),
        docUrls: docsObj,
        idNumber: rider.drivingLicenseNumber,
        riderId: rider.id,
      });
    }
    setIsVerificationModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID (e.g. RDR-86501), name, phone, plate #..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 text-xs sm:text-sm bg-white border-slate-200 rounded-xl"
            />
          </div>

          <select
            value={selectedVehicle}
            onChange={(e) => {
              setSelectedVehicle(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Vehicle: All Vehicles</option>
            <option value="Electric Bike">Electric Scooter / EV</option>
            <option value="Motorcycle">Motorcycle</option>
            <option value="Van">Delivery Van</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Status: All Status</option>
            <option value="Available">Available</option>
            <option value="On Delivery">On Delivery</option>
            <option value="Offline">Offline</option>
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
              setRiderToEdit(null);
              setIsModalOpen(true);
            }}
            className="h-10 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm shadow-blue-600/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Onboard Rider
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRiderIds.length > 0 && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-900 px-4 py-2.5 rounded-xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold">
              {selectedRiderIds.length} rider{selectedRiderIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedRiderIds([])}
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
              Delete Selected ({selectedRiderIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Fleet Table Card */}
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
                <th className="px-5 py-3.5 whitespace-nowrap">Rider ID</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Name & Contact</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Vehicle Info</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Assigned Zone</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Current Status</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Active Orders</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Total Deliveries</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Rating</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRiders.map((rider) => {
                const statusMeta = getStatusDisplay(rider.status);
                const isSelected = selectedRiderIds.includes(rider.id);
                const displayId = getDisplayId(rider);
                return (
                  <tr
                    key={rider.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/50 hover:bg-blue-50/70' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(rider.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        aria-label={`Select rider ${rider.name}`}
                      />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 group">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/70">
                          {displayId}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(rider.id, displayId);
                          }}
                          title={`Copy ID: ${displayId} (System ID: ${rider.id})`}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Copy rider ID"
                        >
                          {copiedId === rider.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{rider.name}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{rider.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-slate-800 font-medium">
                        {rider.vehicle} <span className="text-slate-400">({rider.vehiclePlate || 'N/A'})</span>
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">{rider.zone}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap min-w-[85px] ${statusMeta.classes}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 whitespace-nowrap">
                      {rider.activeOrders > 0 ? (
                        <span className="text-blue-600 font-bold">{rider.activeOrders} active</span>
                      ) : (
                        <span className="text-slate-400">0 active</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap font-medium">{rider.totalDeliveries}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-amber-500 flex items-center gap-1 pt-4">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rider.rating.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInspectDocs(rider)}
                          className="h-7 text-xs font-semibold px-2.5 text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Inspect Docs
                        </Button>
                        <button
                          onClick={() => {
                            setRiderToEdit(rider);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => setRiderToDelete(rider)}
                          title="Delete Rider"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedRiders.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400">
                    No riders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <p>
            Showing {filteredRiders.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredRiders.length)} of {filteredRiders.length} delivery partners
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

      {/* Rider Modal */}
      <RiderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRiderToEdit(null);
        }}
        riderToEdit={riderToEdit}
      />

      {/* Verification Inspection Modal for Rider */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setSelectedVerification(null);
        }}
        item={selectedVerification}
      />

      {/* Single Rider Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!riderToDelete}
        onClose={() => setRiderToDelete(null)}
        onConfirm={() => {
          if (riderToDelete) {
            deleteRider(riderToDelete.id);
            setSelectedRiderIds((prev) => prev.filter((id) => id !== riderToDelete.id));
            setRiderToDelete(null);
          }
        }}
        title={`Delete Rider ${riderToDelete?.name || ''}?`}
        description={`Are you sure you want to delete ${riderToDelete?.name || 'this rider'} (${riderToDelete ? getDisplayId(riderToDelete) : ''}, Vehicle: ${riderToDelete?.vehicle || 'Fleet'})? This will deactivate their account and remove them from fleet dispatch.`}
        confirmText="Yes, Delete Rider"
      />

      {/* Bulk Delete Riders Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={() => {
          deleteRiders(selectedRiderIds);
          setSelectedRiderIds([]);
          setIsBulkDeleteModalOpen(false);
        }}
        title={`Delete ${selectedRiderIds.length} Selected Riders?`}
        description={`Are you sure you want to permanently delete and deactivate the ${selectedRiderIds.length} selected delivery riders? This will remove them from fleet dispatch.`}
        confirmText={`Yes, Delete (${selectedRiderIds.length}) Riders`}
      />
    </div>
  );
}
