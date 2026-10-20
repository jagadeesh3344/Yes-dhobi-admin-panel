import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Vendor } from '@/types';
import { useData } from '@/context/DataContext';
import { MapPin } from 'lucide-react';
import { VendorMapModal } from './VendorMapModal';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorToEdit?: Vendor | null;
}

export const VendorModal: React.FC<VendorModalProps> = ({ isOpen, onClose, vendorToEdit }) => {
  const { addVendor, updateVendor } = useData();

  const [name, setName] = useState('');
  const [owner, setOwner] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [zone, setZone] = useState('Indiranagar & HSR');
  const [capacityPerDay, setCapacityPerDay] = useState(150);
  const [commissionRate, setCommissionRate] = useState(20);
  const [status, setStatus] = useState<'Active' | 'Pending Verification' | 'Suspended'>('Active');
  const [lat, setLat] = useState<number | undefined>(undefined);
  const [lng, setLng] = useState<number | undefined>(undefined);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    if (vendorToEdit) {
      setName(vendorToEdit.name);
      setOwner(vendorToEdit.owner);
      setPhone(vendorToEdit.phone);
      setLocation(vendorToEdit.location);
      setZone(vendorToEdit.zone);
      setCapacityPerDay(vendorToEdit.capacityPerDay);
      setCommissionRate(vendorToEdit.commissionRate);
      setStatus(vendorToEdit.status);
      setLat(vendorToEdit.lat);
      setLng(vendorToEdit.lng);
    } else {
      setName('');
      setOwner('');
      setPhone('');
      setLocation('');
      setZone('Indiranagar & HSR');
      setCapacityPerDay(120);
      setCommissionRate(20);
      setStatus('Active');
      setLat(undefined);
      setLng(undefined);
    }
  }, [vendorToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !owner.trim()) return;

    if (vendorToEdit) {
      updateVendor(vendorToEdit.id, {
        name,
        owner,
        phone,
        location,
        zone,
        capacityPerDay: Number(capacityPerDay),
        commissionRate: Number(commissionRate),
        status,
        lat,
        lng,
      });
    } else {
      addVendor({
        name,
        owner,
        phone,
        location: location || 'Bangalore Central',
        zone,
        capacityPerDay: Number(capacityPerDay),
        activeOrders: 0,
        commissionRate: Number(commissionRate),
        status,
        rating: 4.8,
        totalRevenue: 0,
        lat,
        lng,
      });
    }
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={vendorToEdit ? `Edit Partner: ${vendorToEdit.name}` : 'Onboard New Laundry Partner'}
        subtitle={vendorToEdit ? 'Modify shop details, capacity and commission terms' : 'Register a new dhobi/laundry vendor shop in the network'}
        maxWidth="lg"
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              onClick={() => setShowMapModal(true)}
              className="flex items-center gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Get Maps
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {vendorToEdit ? 'Save Partner Details' : 'Onboard Partner'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Shop / Business Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
                placeholder="e.g. Royal Cleaners"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Owner / Manager Name *</label>
              <input
                type="text"
                required
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
                placeholder="e.g. Mukesh Sharma"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
                placeholder="+91 98111 22334"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Operating Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
              >
                <option value="Indiranagar & HSR">Indiranagar & HSR (Bangalore)</option>
                <option value="Andheri West & Bandra">Andheri West & Bandra (Mumbai)</option>
                <option value="Karol Bagh & Dwarka">Karol Bagh & Dwarka (Delhi)</option>
                <option value="Kothrud & Viman Nagar">Kothrud & Viman Nagar (Pune)</option>
                <option value="Madhapur & Hitec City">Madhapur & Hitec City (Hyderabad)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">Physical Shop Address</label>
              {lat && lng && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  GPS Synced ({lat.toFixed(4)}, {lng.toFixed(4)})
                </span>
              )}
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
              placeholder="Shop 14, 100ft Road, Near Metro Station"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Daily Capacity (Kg)</label>
              <input
                type="number"
                min="10"
                value={capacityPerDay}
                onChange={(e) => setCapacityPerDay(Number(e.target.value))}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Platform Commission %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Verification Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>

      {/* Vendor Location Map Modal */}
      <VendorMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        vendorName={name || vendorToEdit?.name || 'Partner Shop'}
        address={location}
        zone={zone}
        phone={phone}
        initialLat={lat}
        initialLng={lng}
        onSaveCoordinates={(newLat, newLng) => {
          setLat(newLat);
          setLng(newLng);
        }}
      />
    </>
  );
};
