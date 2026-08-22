import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Rider } from '@/types';
import { useData } from '@/context/DataContext';
import { MapPin, Navigation, Bike, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  riderToEdit?: Rider | null;
  mode?: 'edit' | 'track';
}

export const RiderModal: React.FC<RiderModalProps> = ({
  isOpen,
  onClose,
  riderToEdit,
  mode = 'edit',
}) => {
  const { addRider, updateRider, orders } = useData();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState<'Electric Bike' | 'Scooter' | 'Bicycle' | 'Van'>('Electric Bike');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [zone, setZone] = useState('Indiranagar & HSR');
  const [status, setStatus] = useState<'Online' | 'Offline' | 'On Delivery'>('Online');
  const [weeklyEarnings, setWeeklyEarnings] = useState(0);

  useEffect(() => {
    if (riderToEdit) {
      setName(riderToEdit.name);
      setPhone(riderToEdit.phone);
      setVehicle(riderToEdit.vehicle);
      setVehiclePlate(riderToEdit.vehiclePlate || '');
      setZone(riderToEdit.zone);
      setStatus(riderToEdit.status);
      setWeeklyEarnings(riderToEdit.weeklyEarnings);
    } else {
      setName('');
      setPhone('');
      setVehicle('Electric Bike');
      setVehiclePlate('KA 01 EV ' + Math.floor(1000 + Math.random() * 9000));
      setZone('Indiranagar & HSR');
      setStatus('Online');
      setWeeklyEarnings(0);
    }
  }, [riderToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (riderToEdit) {
      updateRider(riderToEdit.id, {
        name,
        phone,
        vehicle,
        vehiclePlate,
        zone,
        status,
        weeklyEarnings: Number(weeklyEarnings),
      });
    } else {
      addRider({
        name,
        phone,
        vehicle,
        vehiclePlate,
        zone,
        status,
        totalDeliveries: 0,
        rating: 5.0,
        weeklyEarnings: Number(weeklyEarnings),
        currentLat: 12.9716 + (Math.random() - 0.5) * 0.05,
        currentLng: 77.5946 + (Math.random() - 0.5) * 0.05,
      });
    }
    onClose();
  };

  const activeOrder = riderToEdit?.activeOrderId
    ? orders.find((o) => o.id === riderToEdit.activeOrderId)
    : orders.find((o) => o.riderName === riderToEdit?.name && o.status !== 'Delivered' && o.status !== 'Cancelled');

  if (mode === 'track' && riderToEdit) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Live Fleet Tracking: ${riderToEdit.name}`}
        subtitle={`ID: ${riderToEdit.id} • ${riderToEdit.vehicle} (${riderToEdit.vehiclePlate || 'Standard'})`}
        maxWidth="xl"
        footer={
          <Button variant="outline" onClick={onClose}>
            Close Tracker
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Simulated Map View Visualizer */}
          <div className="relative h-60 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between p-4 text-white shadow-inner">
            {/* Grid background effect */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #38bdf8 1px, transparent 1px), radial-gradient(circle, #38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: '0 0, 12px 12px',
              }}
            />

            {/* Top info badge */}
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-emerald-300">Live GPS Stream Active</span>
              </div>
              <div className="text-xs bg-slate-800/80 px-2.5 py-1 rounded-md text-slate-300">
                Zone: {riderToEdit.zone}
              </div>
            </div>

            {/* Central Animated Marker */}
            <div className="relative z-10 flex flex-col items-center justify-center my-auto">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-14 h-14 bg-sky-500/20 rounded-full animate-ping" />
                <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-sky-500/50 border-2 border-white">
                  <Navigation className="w-5 h-5 animate-pulse transform -rotate-45" />
                </div>
              </div>
              <div className="mt-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-md text-xs font-mono border border-slate-700 text-slate-200">
                Lat: {riderToEdit.currentLat?.toFixed(4) || '12.9716'}, Lng: {riderToEdit.currentLng?.toFixed(4) || '77.5946'}
              </div>
            </div>

            {/* Bottom road simulation bar */}
            <div className="relative z-10 flex justify-between items-center text-xs text-slate-300 bg-slate-800/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-sky-400" />
                <span>Speed: <strong>24 km/h</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Safety Compliance: <strong>100%</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <Phone className="w-3.5 h-3.5" />
                <span>{riderToEdit.phone}</span>
              </div>
            </div>
          </div>

          {/* Active Assigned Order card */}
          {activeOrder ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Currently Handling Order {activeOrder.id}
                </span>
                <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded font-semibold">
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-gray-700">
                <strong>Customer:</strong> {activeOrder.customerName} ({activeOrder.customerPhone})
              </p>
              <p className="text-gray-600">
                <strong>Pickup/Delivery:</strong> {activeOrder.customerAddress || 'Indiranagar, Bangalore'}
              </p>
              <p className="text-gray-600">
                <strong>Partner Hub:</strong> {activeOrder.partnerName}
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center text-xs text-gray-500">
              Rider is currently waiting in dispatch queue for new pickup requests.
            </div>
          )}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={riderToEdit ? `Edit Rider: ${riderToEdit.name}` : 'Onboard New Delivery Rider'}
      subtitle={riderToEdit ? 'Modify fleet details and active working zone' : 'Add a new delivery driver to the Yes Dhobi logistics network'}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {riderToEdit ? 'Save Rider Profile' : 'Onboard Rider'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Rider Full Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            placeholder="e.g. Rahul Sharma"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
              placeholder="+91 92211 44332"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Zone</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            >
              <option value="Indiranagar & HSR">Indiranagar & HSR (Bangalore)</option>
              <option value="Andheri West & Bandra">Andheri West & Bandra (Mumbai)</option>
              <option value="Karol Bagh & Dwarka">Karol Bagh & Dwarka (Delhi)</option>
              <option value="Kothrud & Viman Nagar">Kothrud & Viman Nagar (Pune)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Type</label>
            <select
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            >
              <option value="Electric Bike">Electric Bike (Green EV)</option>
              <option value="Scooter">Scooter (Petrol)</option>
              <option value="Bicycle">Bicycle (Eco Cycle)</option>
              <option value="Van">Van / Tempo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Plate / Registration</label>
            <input
              type="text"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 uppercase"
              placeholder="KA 01 EV 9021"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Current Duty Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-semibold"
            >
              <option value="Online">Online (Ready for Dispatch)</option>
              <option value="Offline">Offline (Off Duty)</option>
              <option value="On Delivery">On Delivery (En Route)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Weekly Earnings Accrued (₹)</label>
            <input
              type="number"
              min="0"
              value={weeklyEarnings}
              onChange={(e) => setWeeklyEarnings(Number(e.target.value))}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
