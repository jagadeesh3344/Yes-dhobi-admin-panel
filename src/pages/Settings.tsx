import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Wallet, MapPin, Activity, Plus, Trash2, RotateCcw, CheckCircle2, Shield } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { ZoneModal } from '@/components/modals/ZoneModal';

interface ZoneItem {
  id: string;
  name: string;
  city: string;
  status: 'Operational' | 'Paused';
}

const initialZones: ZoneItem[] = [
  { id: '1', name: 'Indiranagar & HSR Layout', city: 'Bangalore', status: 'Operational' },
  { id: '2', name: 'Andheri West & Bandra', city: 'Mumbai', status: 'Operational' },
  { id: '3', name: 'Karol Bagh & Dwarka', city: 'Delhi NCR', status: 'Operational' },
  { id: '4', name: 'Kothrud & Viman Nagar', city: 'Pune', status: 'Operational' },
];

export default function Settings() {
  const { isLiveSimulationActive, setIsLiveSimulationActive, resetToFactoryDemo, settings, updateSettings } = useData();
  const { showToast } = useToast();

  // Form states
  const [brandName, setBrandName] = useState(settings.brandName || 'Yes Dhobi Technologies India');
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'operations@yesdhobi.com');
  const [operatingHours, setOperatingHours] = useState(settings.operatingHours || '06:00 AM - 11:00 PM');
  const [vendorCommission, setVendorCommission] = useState(String(settings.vendorCommissionRate || 20));
  const [riderBaseFee, setRiderBaseFee] = useState(String(settings.riderBaseFee || 40));
  const [minOrderValue, setMinOrderValue] = useState(String(settings.minOrderForFreePickup || 120));

  // Toggle flags
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode || false);
  const [smsAlerts, setSmsAlerts] = useState(settings.smsNotificationsOnDelivery ?? true);
  const [autoAssignRiders, setAutoAssignRiders] = useState(true);

  // Zones
  const [zones, setZones] = useState<ZoneItem[]>(initialZones);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<ZoneItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleApplySettings = () => {
    updateSettings({
      brandName,
      supportEmail,
      operatingHours,
      vendorCommissionRate: Number(vendorCommission),
      riderBaseFee: Number(riderBaseFee),
      minOrderForFreePickup: Number(minOrderValue),
      maintenanceMode,
      smsNotificationsOnDelivery: smsAlerts,
    });
    showToast('Configurations Saved', 'Global backoffice operational rules updated.');
  };

  const handleAddZone = (newZone: { name: string; city: string; status: 'Operational' | 'Paused' }) => {
    setZones((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newZone.name, city: newZone.city, status: newZone.status },
    ]);
    showToast('Service Zone Added', `Zone "${newZone.name}, ${newZone.city}" is now enabled for order dispatch.`);
  };

  const toggleZoneStatus = (id: string) => {
    let targetName = '';
    let nextStatus = '';
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === id) {
          const next = z.status === 'Operational' ? 'Paused' : 'Operational';
          targetName = z.name;
          nextStatus = next;
          return { ...z, status: next };
        }
        return z;
      })
    );
    if (targetName) {
      showToast('Zone Status Updated', `${targetName} is now ${nextStatus}.`, 'info');
    }
  };

  const removeZone = (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
    showToast('Zone Removed', 'Service zone decommissioned from dispatch routing.', 'info');
  };

  const handleFactoryReset = () => {
    if (confirm('Are you sure you want to reset all mock orders, customers, partners and telemetry to initial factory defaults?')) {
      resetToFactoryDemo();
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Platform Control & Configurations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure system operational parameters, commission engine splits, service zones, and live telemetry engine.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsResetConfirmOpen(true)}
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Reset Demo Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Configuration */}
        <Card className="rounded-2xl border-slate-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center space-x-2 text-slate-900">
              <SettingsIcon className="h-4 w-4 text-blue-600" />
              <span>General Platform Identity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Platform Corporate Name</label>
              <Input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="bg-slate-50 h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Operations Support Email</label>
              <Input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="bg-slate-50 h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Active Daily Operating Hours</label>
              <Input
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="bg-slate-50 h-9 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Commission Engine Rates */}
        <Card className="rounded-2xl border-slate-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center space-x-2 text-slate-900">
              <Wallet className="h-4 w-4 text-blue-600" />
              <span>Commission & Billing Rules</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Platform Commission Split (%)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={vendorCommission}
                  onChange={(e) => setVendorCommission(e.target.value)}
                  className="bg-slate-50 h-9 text-xs pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Rider Base Payout per Trip (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={riderBaseFee}
                  onChange={(e) => setRiderBaseFee(e.target.value)}
                  className="bg-slate-50 h-9 text-xs pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Minimum Order Value for Free Pickup (₹)</label>
              <div className="relative">
                <Input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="bg-slate-50 h-9 text-xs pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Service Zones */}
        <Card className="rounded-2xl border-slate-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center space-x-2 text-slate-900">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Active Metropolitan Zones</span>
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 font-bold"
              onClick={() => setIsZoneModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Zone
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-4 text-xs">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="flex justify-between items-center p-3 border border-slate-200 rounded-xl bg-slate-50/60 hover:bg-white transition-colors"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{zone.name}</span>
                  <span className="text-[10px] text-blue-600 font-semibold">{zone.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleZoneStatus(zone.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border cursor-pointer ${
                      zone.status === 'Operational'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {zone.status}
                  </button>
                  <button
                    onClick={() => setZoneToDelete(zone)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                    title="Remove Zone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Real-Time Telemetry & Maintenance Controls */}
        <Card className="rounded-2xl border-slate-200 shadow-2xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold flex items-center space-x-2 text-slate-900">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>Telemetry & Automation Engines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs">
            {/* Live simulation ticker */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <div>
                <p className="font-bold text-slate-900">Real-Time Simulation Engine</p>
                <p className="text-[10px] text-slate-500">
                  Periodically progresses laundry orders & updates rider GPS coordinates every 15 seconds
                </p>
              </div>
              <button
                onClick={() => setIsLiveSimulationActive((prev) => !prev)}
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                  isLiveSimulationActive ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                    isLiveSimulationActive ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-bold text-slate-900">System Maintenance Mode</p>
                <p className="text-[10px] text-slate-500">Pauses incoming customer orders on the mobile app</p>
              </div>
              <button
                onClick={() => setMaintenanceMode((prev) => !prev)}
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                  maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                    maintenanceMode ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Auto Dispatch */}
            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-bold text-slate-900">AI Rider Nearest Dispatch Routing</p>
                <p className="text-[10px] text-slate-500">Auto-assigns nearest available rider to new pickups</p>
              </div>
              <button
                onClick={() => setAutoAssignRiders((prev) => !prev)}
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                  autoAssignRiders ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                    autoAssignRiders ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* SMS */}
            <div className="flex items-center justify-between p-2">
              <div>
                <p className="font-bold text-slate-900">Push SMS Delivery Tracking Link</p>
                <p className="text-[10px] text-slate-500">Send WhatsApp / SMS updates to customer on pickup & drop</p>
              </div>
              <button
                onClick={() => setSmsAlerts((prev) => !prev)}
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                  smsAlerts ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-xs ${
                    smsAlerts ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Save Controls Bar */}
      <div className="fixed bottom-0 right-0 left-64 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-between px-8 z-10 shadow-lg">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Configuration syncs instantly to all regional micro-services</span>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('Changes Discarded', 'Reverted form values to saved state.', 'info')}
          >
            Discard
          </Button>
          <Button size="sm" onClick={handleApplySettings} className="bg-blue-600 shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Apply Settings Globally
          </Button>
        </div>
      </div>

      {/* Add Zone Modal */}
      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={() => setIsZoneModalOpen(false)}
        onAddZone={handleAddZone}
      />

      {/* Delete Zone Confirmation Modal */}
      <ConfirmModal
        isOpen={!!zoneToDelete}
        onClose={() => setZoneToDelete(null)}
        onConfirm={() => {
          if (zoneToDelete) {
            removeZone(zoneToDelete.id);
            setZoneToDelete(null);
          }
        }}
        title={`Remove Zone "${zoneToDelete?.name || ''}"?`}
        description={`Are you sure you want to decommission service zone "${zoneToDelete?.name || ''}, ${zoneToDelete?.city || ''}" from the live dispatch network?`}
        confirmText="Yes, Remove Zone"
      />

      {/* Factory Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetToFactoryDemo();
          setIsResetConfirmOpen(false);
        }}
        title="Reset All Platform Demo Data?"
        description="Are you sure you want to reset all mock orders, customers, partners, telemetry, and back-office records to initial factory defaults? Any new data created will be replaced with clean demo data."
        confirmText="Yes, Reset Everything"
      />
    </div>
  );
}
