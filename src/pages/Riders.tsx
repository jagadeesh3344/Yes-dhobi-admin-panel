import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Download, Trash2, Edit3, Truck, Bike, BatteryCharging, Star, Navigation } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { RiderModal } from '@/components/modals/RiderModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Rider } from '@/types';

export default function Riders() {
  const { riders, deleteRider, toggleRiderStatus, isLiveSimulationActive } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riderToEdit, setRiderToEdit] = useState<Rider | null>(null);
  const [riderToDelete, setRiderToDelete] = useState<Rider | null>(null);

  const filteredRiders = useMemo(() => {
    return riders.filter((rider) => {
      const matchesSearch =
        rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rider.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVehicle = selectedVehicle === 'All' || rider.vehicle === selectedVehicle;
      const matchesStatus = selectedStatus === 'All' || rider.status === selectedStatus;

      return matchesSearch && matchesVehicle && matchesStatus;
    });
  }, [riders, searchQuery, selectedVehicle, selectedStatus]);

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
        Status: r.status,
        ActiveOrders: r.activeOrders,
        TotalDeliveries: r.totalDeliveries,
        Rating: r.rating,
        WeeklyEarningsINR: r.weeklyEarnings,
        CurrentLat: r.currentLocation?.lat,
        CurrentLng: r.currentLocation?.lng,
      }))
    );
  };

  const onlineCount = riders.filter((r) => r.status === 'Online' || r.status === 'On Delivery').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Rider Fleet & Telemetry</h2>
            {isLiveSimulationActive && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Navigation className="w-2.5 h-2.5 animate-spin text-emerald-600" />
                Live GPS
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor on-duty logistics agents, electric fleet battery, active order deliveries, and payouts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Fleet CSV ({filteredRiders.length})
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setRiderToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Onboard New Rider
          </Button>
        </div>
      </div>

      {/* Fleet KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active On-Duty</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              {onlineCount} / {riders.length}
            </h3>
          </div>
          <Truck className="w-8 h-8 text-blue-600 p-1.5 bg-blue-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">EV Fleet Ratio</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              {Math.round((riders.filter((r) => r.vehicle === 'Electric Bike').length / (riders.length || 1)) * 100)}% Green
            </h3>
          </div>
          <BatteryCharging className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Weekly Payouts</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
              ₹{riders.reduce((s, r) => s + r.weeklyEarnings, 0).toLocaleString()}
            </h3>
          </div>
          <Bike className="w-8 h-8 text-indigo-600 p-1.5 bg-indigo-50 rounded-xl" />
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
                placeholder="Search by rider name, phone, plate #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white"
              />
            </div>

            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Vehicle Types</option>
              <option value="Electric Bike">Electric Bike (EV)</option>
              <option value="Scooter">Scooter</option>
              <option value="Bicycle">Bicycle</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Duty Statuses</option>
              <option value="Online">Online & Ready</option>
              <option value="On Delivery">On Active Delivery</option>
              <option value="Offline">Offline</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredRiders.length} delivery partners
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">ID</th>
                <th className="px-5 py-3 whitespace-nowrap">Rider Name</th>
                <th className="px-5 py-3 whitespace-nowrap">Phone</th>
                <th className="px-5 py-3 whitespace-nowrap">Vehicle & Plate</th>
                <th className="px-5 py-3 whitespace-nowrap">Zone / GPS Coord</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Live Status</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Orders Delivered</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Rating</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Weekly Earnings</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRiders.map((rider) => (
                <tr key={rider.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-400 whitespace-nowrap">
                    {rider.id}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-bold text-slate-900">{rider.name}</p>
                    <p className="text-[10px] text-slate-400">{rider.activeOrders} active bag(s)</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                    {rider.phone}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-slate-800">{rider.vehicle}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{rider.vehicleNumber}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded block w-fit mb-0.5">
                      {rider.zone}
                    </span>
                    {rider.currentLocation && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {rider.currentLocation.lat.toFixed(4)}, {rider.currentLocation.lng.toFixed(4)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {rider.status === 'Online' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online
                      </span>
                    )}
                    {rider.status === 'On Delivery' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <Truck className="w-2.5 h-2.5" />
                        On Delivery
                      </span>
                    )}
                    {rider.status === 'Offline' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Offline
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {rider.totalDeliveries}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {rider.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    ₹{rider.weeklyEarnings.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold px-2.5"
                        onClick={() => {
                          setRiderToEdit(rider);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Track/Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[10px] font-bold px-2 text-slate-600 hover:bg-slate-100"
                        onClick={() => toggleRiderStatus(rider.id)}
                      >
                        {rider.status === 'Offline' ? 'Go Online' : 'Go Offline'}
                      </Button>
                      <button
                        onClick={() => setRiderToDelete(rider)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Rider"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRiders.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No riders found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!riderToDelete}
        onClose={() => setRiderToDelete(null)}
        onConfirm={() => {
          if (riderToDelete) {
            deleteRider(riderToDelete.id);
            setRiderToDelete(null);
          }
        }}
        title={`Remove Rider from Fleet?`}
        description={`Are you sure you want to remove rider "${riderToDelete?.name || 'this rider'}" (${riderToDelete?.vehicleNumber || ''})? Any active delivery assignments will need to be reassigned.`}
        confirmText="Yes, Remove Rider"
      />
    </div>
  );
}
