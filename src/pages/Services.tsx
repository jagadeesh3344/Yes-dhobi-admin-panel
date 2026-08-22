import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, WashingMachine, Shirt, Wind, Sparkles, Droplets, Home, Trash2, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useData } from '@/context/DataContext';
import { ServiceModal } from '@/components/modals/ServiceModal';
import { SurchargeModal } from '@/components/modals/SurchargeModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { ServiceCategory, SurchargeRule } from '@/types';
import { useToast } from '@/context/ToastContext';

export default function Services() {
  const {
    services,
    surcharges,
    deleteService,
    toggleServiceStatus,
    toggleSurchargeStatus,
    deleteSurcharge,
  } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState<ServiceCategory | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceCategory | null>(null);

  const [isSurchargeModalOpen, setIsSurchargeModalOpen] = useState(false);
  const [surchargeToEdit, setSurchargeToEdit] = useState<SurchargeRule | null>(null);
  const [surchargeToDelete, setSurchargeToDelete] = useState<SurchargeRule | null>(null);

  const getServiceIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Shirt':
        return Shirt;
      case 'Wind':
        return Wind;
      case 'Sparkles':
        return Sparkles;
      case 'Droplets':
        return Droplets;
      case 'Home':
        return Home;
      default:
        return WashingMachine;
    }
  };

  const filteredServices = useMemo(() => {
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [services, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Services & Pricing Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure laundry offerings, per-kg/per-piece rates, turnaround lead times, and dynamic peak surcharges.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-white"
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              setServiceToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => {
          const Icon = getServiceIcon(service.iconName);
          return (
            <Card
              key={service.id}
              className="flex flex-col rounded-2xl border-slate-200 shadow-2xs hover:border-blue-300 transition-all group"
            >
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <button
                      onClick={() => toggleServiceStatus(service.id)}
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                        service.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {service.status}
                    </button>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1">{service.name}</h4>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{service.description}</p>

                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Standard Rate:</span>
                      <span className="font-extrabold text-slate-900">
                        ₹{service.ratePerKgOrItem}{service.rateUnit}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Turnaround Time:</span>
                      <span className="font-bold text-blue-600">{service.leadTimeHours} Hours SLA</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-semibold"
                    onClick={() => {
                      setServiceToEdit(service);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit Configuration
                  </Button>
                  <button
                    onClick={() => setServiceToDelete(service)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Surcharges Table */}
      <Card className="rounded-2xl border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Surcharges & Dynamic Modifier Rules</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated pricing multipliers applied during checkout</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold"
            onClick={() => {
              setSurchargeToEdit(null);
              setIsSurchargeModalOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Surcharge Rule
          </Button>
        </div>

        <div className="overflow-x-auto p-0">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Rule Name</th>
                <th className="px-5 py-3 whitespace-nowrap">Condition Trigger</th>
                <th className="px-5 py-3 whitespace-nowrap">Surcharge / Modifier</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Status</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {surcharges.map((surcharge) => (
                <tr key={surcharge.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {surcharge.rule}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600">{surcharge.trigger}</td>
                  <td className="px-5 py-3.5 font-extrabold text-blue-600 whitespace-nowrap">
                    {surcharge.modifier}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <button
                      onClick={() => toggleSurchargeStatus(surcharge.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer ${
                        surcharge.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {surcharge.status} (Toggle)
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs font-semibold px-2"
                        onClick={() => {
                          setSurchargeToEdit(surcharge);
                          setIsSurchargeModalOpen(true);
                        }}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <button
                        onClick={() => setSurchargeToDelete(surcharge)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setServiceToEdit(null);
        }}
        serviceToEdit={serviceToEdit}
      />

      {/* Surcharge Rule Modal */}
      <SurchargeModal
        isOpen={isSurchargeModalOpen}
        onClose={() => {
          setIsSurchargeModalOpen(false);
          setSurchargeToEdit(null);
        }}
        surchargeToEdit={surchargeToEdit}
      />

      {/* Delete Service Confirmation Modal */}
      <ConfirmModal
        isOpen={!!serviceToDelete}
        onClose={() => setServiceToDelete(null)}
        onConfirm={() => {
          if (serviceToDelete) {
            deleteService(serviceToDelete.id);
            setServiceToDelete(null);
          }
        }}
        title={`Delete Service Category "${serviceToDelete?.name || ''}"?`}
        description={`Are you sure you want to remove ${serviceToDelete?.name || 'this category'} from catalog? Customers will no longer be able to select this service.`}
        confirmText="Yes, Delete Service"
      />

      {/* Delete Surcharge Confirmation Modal */}
      <ConfirmModal
        isOpen={!!surchargeToDelete}
        onClose={() => setSurchargeToDelete(null)}
        onConfirm={() => {
          if (surchargeToDelete) {
            deleteSurcharge(surchargeToDelete.id);
            setSurchargeToDelete(null);
          }
        }}
        title={`Delete Surcharge Rule?`}
        description={`Are you sure you want to delete rule "${surchargeToDelete?.rule || ''}" (${surchargeToDelete?.modifier || ''})?`}
        confirmText="Yes, Delete Rule"
      />
    </div>
  );
}
