import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Download, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { RiderModal } from '@/components/modals/RiderModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Rider } from '@/types';

export default function Riders() {
  const { riders } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riderToEdit, setRiderToEdit] = useState<Rider | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const defaultRidersList: Rider[] = [
    {
      id: 'R-401',
      name: 'Ramesh Kumar',
      phone: '+91 98765 00001',
      vehicle: 'Electric Bike',
      vehicleNumber: 'MH-02-AB-1234',
      zone: 'Bandra West',
      status: 'Online',
      activeOrders: 2,
      totalDeliveries: 348,
      rating: 4.8,
      weeklyEarnings: 6800,
    },
    {
      id: 'R-402',
      name: 'Suresh Patel',
      phone: '+91 98765 00002',
      vehicle: 'Motorcycle',
      vehicleNumber: 'MH-02-CD-5678',
      zone: 'Andheri East',
      status: 'On Delivery',
      activeOrders: 3,
      totalDeliveries: 512,
      rating: 4.9,
      weeklyEarnings: 8200,
    },
    {
      id: 'R-403',
      name: 'Vijay Verma',
      phone: '+91 98765 00003',
      vehicle: 'Electric Bike',
      vehicleNumber: 'MH-02-EF-9012',
      zone: 'Powai Central',
      status: 'Online',
      activeOrders: 1,
      totalDeliveries: 289,
      rating: 4.7,
      weeklyEarnings: 5900,
    },
    {
      id: 'R-404',
      name: 'Deepak Sharma',
      phone: '+91 98765 00004',
      vehicle: 'Electric Bike',
      vehicleNumber: 'MH-02-GH-3456',
      zone: 'Worli South',
      status: 'Offline',
      activeOrders: 0,
      totalDeliveries: 420,
      rating: 4.6,
      weeklyEarnings: 4500,
    },
    {
      id: 'R-405',
      name: 'Manoj Tiwari',
      phone: '+91 98765 00005',
      vehicle: 'Motorcycle',
      vehicleNumber: 'MH-02-IJ-7890',
      zone: 'Juhu Tara',
      status: 'On Delivery',
      activeOrders: 2,
      totalDeliveries: 198,
      rating: 4.8,
      weeklyEarnings: 5100,
    },
    {
      id: 'R-406',
      name: 'Anil Deshmukh',
      phone: '+91 98765 00006',
      vehicle: 'Van',
      vehicleNumber: 'MH-02-KL-2345',
      zone: 'Goregaon West',
      status: 'Online',
      activeOrders: 0,
      totalDeliveries: 620,
      rating: 4.9,
      weeklyEarnings: 9400,
    },
    {
      id: 'R-407',
      name: 'Prakash Rao',
      phone: '+91 98765 00007',
      vehicle: 'Electric Bike',
      vehicleNumber: 'MH-02-MN-6789',
      zone: 'Chembur East',
      status: 'Offline',
      activeOrders: 0,
      totalDeliveries: 154,
      rating: 4.5,
      weeklyEarnings: 3200,
    },
    {
      id: 'R-408',
      name: 'Karan Malhotra',
      phone: '+91 98765 00008',
      vehicle: 'Motorcycle',
      vehicleNumber: 'MH-02-OP-0123',
      zone: 'Bandra East',
      status: 'On Delivery',
      activeOrders: 2,
      totalDeliveries: 310,
      rating: 4.7,
      weeklyEarnings: 6100,
    },
  ];

  const combinedRiders = useMemo(() => {
    const existingIds = new Set(riders.map((r) => r.id));
    const uniqueDefault = defaultRidersList.filter((d) => !existingIds.has(d.id));
    return [...riders, ...uniqueDefault];
  }, [riders]);

  const filteredRiders = useMemo(() => {
    return combinedRiders.filter((rider) => {
      const matchesSearch =
        rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVehicle =
        selectedVehicle === 'All' ||
        (selectedVehicle === 'Electric Bike' && rider.vehicle === 'Electric Bike') ||
        (selectedVehicle === 'Motorcycle' && rider.vehicle === 'Motorcycle') ||
        (selectedVehicle === 'Van' && rider.vehicle === 'Van');

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Available' && (rider.status === 'Online' || rider.status === 'Available')) ||
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

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_rider_fleet',
      filteredRiders.map((r) => ({
        RiderID: r.id,
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

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by rider name, phone, plate #..."
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

      {/* Fleet Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100 bg-slate-50/70">
              <tr>
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
                return (
                  <tr
                    key={rider.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">{rider.id}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{rider.name}</p>
                      <p className="text-[11px] text-slate-500">{rider.phone}</p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <p className="text-slate-800 font-medium">
                        {rider.vehicle} <span className="text-slate-400">({rider.vehicleNumber})</span>
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
                      <button
                        onClick={() => {
                          setRiderToEdit(rider);
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

              {paginatedRiders.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
                    No riders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <p>Showing 1-{paginatedRiders.length} of 48 delivery partners</p>
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
    </div>
  );
}
