import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Package,
  Users,
  Store,
  Truck,
  IndianRupee,
  Plus,
  ArrowUpRight,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { OrderModal } from '@/components/modals/OrderModal';
import { CustomerModal } from '@/components/modals/CustomerModal';
import { VendorModal } from '@/components/modals/VendorModal';
import { RiderModal } from '@/components/modals/RiderModal';
import { VerificationModal } from '@/components/modals/VerificationModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Order, VerificationItem } from '@/types';

const lineData = [
  { name: 'Mon', orders: 150, revenue: 32000 },
  { name: 'Tue', orders: 400, revenue: 84000 },
  { name: 'Wed', orders: 350, revenue: 76000 },
  { name: 'Thu', orders: 800, revenue: 168000 },
  { name: 'Fri', orders: 750, revenue: 154000 },
  { name: 'Sat', orders: 1200, revenue: 245000 },
  { name: 'Sun', orders: 1500, revenue: 310000 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders, customers, vendors, riders, verifications, isLiveSimulationActive } = useData();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Computations
  const totalRevenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const activeVendorsCount = vendors.filter((v) => v.status === 'Active').length;
  const activeRidersCount = riders.filter((r) => r.status === 'Online' || r.status === 'On Delivery').length;
  const pendingApprovals = verifications.filter((v) => v.status === 'Pending Review');

  // Service distribution percentages
  const serviceCounts: Record<string, number> = {};
  orders.forEach((o) => {
    serviceCounts[o.serviceName] = (serviceCounts[o.serviceName] || 0) + 1;
  });
  const totalServices = orders.length || 1;
  const serviceDistribution = [
    { name: 'Wash & Iron', value: Math.round(((serviceCounts['Wash & Iron'] || 6) / totalServices) * 100), color: '#2563EB' },
    { name: 'Dry Clean', value: Math.round(((serviceCounts['Dry Clean'] || 3) / totalServices) * 100), color: '#D97706' },
    { name: 'Only Ironing', value: Math.round(((serviceCounts['Only Ironing'] || 2) / totalServices) * 100), color: '#059669' },
    { name: 'Premium Care', value: Math.round(((serviceCounts['Premium Care'] || 1) / totalServices) * 100), color: '#7C3AED' },
  ];

  const handleExportDashboard = () => {
    exportToCsv(
      'yesdhobi_operations_summary',
      orders.map((o) => ({
        OrderID: o.id,
        Customer: o.customerName,
        Phone: o.customerPhone,
        Partner: o.partnerName,
        Rider: o.riderName,
        Service: o.serviceName,
        AmountINR: o.amount,
        Status: o.status,
        Date: o.pickupDate,
      }))
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Laundry':
      case 'Washing':
      case 'Ironing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Out for Delivery':
      case 'Ready':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending Pickup':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Yes Dhobi Command Hub</h2>
            {isLiveSimulationActive && (
              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Telemetry Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-city laundry dispatch, laundry partners capacity, and fleet monitoring.
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedOrder(null);
              setIsOrderModalOpen(true);
            }}
            className="shadow-sm shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-1" />
            Book Manual Order
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomerModalOpen(true)}
          >
            <Users className="w-3.5 h-3.5 mr-1" />
            + Customer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsVendorModalOpen(true)}
          >
            <Store className="w-3.5 h-3.5 mr-1" />
            + Vendor
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRiderModalOpen(true)}
          >
            <Truck className="w-3.5 h-3.5 mr-1" />
            + Rider
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportDashboard}
            title="Download full operational CSV report"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orders Card */}
        <Card
          className="hover:border-blue-300 transition-all cursor-pointer group"
          onClick={() => navigate('/orders')}
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Orders</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeOrdersCount}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-blue-600 flex items-center justify-between">
              <span>{orders.length} total logged</span>
              <span className="text-slate-400 group-hover:text-blue-600 flex items-center gap-0.5">
                View orders <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card
          className="hover:border-blue-300 transition-all cursor-pointer group"
          onClick={() => navigate('/customers')}
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Users</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{customers.length}</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-indigo-600 flex items-center justify-between">
              <span>{customers.filter((c) => c.status === 'VIP').length} VIP members</span>
              <span className="text-slate-400 group-hover:text-indigo-600 flex items-center gap-0.5">
                Manage <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Network */}
        <Card
          className="hover:border-blue-300 transition-all cursor-pointer group"
          onClick={() => navigate('/vendors')}
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Laundry Partners</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeVendorsCount}</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Store className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center justify-between">
              <span>{vendors.reduce((s, v) => s + v.capacityPerDay, 0)} kg/day capacity</span>
              <span className="text-slate-400 group-hover:text-emerald-600 flex items-center gap-0.5">
                Inspect <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status */}
        <Card
          className="hover:border-blue-300 transition-all cursor-pointer group"
          onClick={() => navigate('/riders')}
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Riders On Duty</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeRidersCount}</h3>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div className="text-xs font-semibold text-amber-600 flex items-center justify-between">
              <span>{riders.filter((r) => r.vehicle === 'Electric Bike').length} Green EVs</span>
              <span className="text-slate-400 group-hover:text-amber-600 flex items-center gap-0.5">
                Track GPS <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics & Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Weekly Order Volume & Revenue</CardTitle>
              <p className="text-xs text-slate-500">Aggregated pickup trends across all metropolitan zones</p>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold">
              ₹{(totalRevenue * 15).toLocaleString()} MTD
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: '#2563EB' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Service Type Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Service Mix</CardTitle>
            <button
              onClick={() => navigate('/services')}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Catalog →
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-4">
              {serviceDistribution.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="text-slate-900 font-bold">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
              <span className="text-blue-900 font-semibold">Average Order Value</span>
              <span className="font-bold text-blue-900">
                ₹{orders.length ? Math.round(totalRevenue / orders.length) : 240}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Orders Table & Pending Approvals List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Live Active Laundry Stream</CardTitle>
              <p className="text-xs text-slate-500">Click any row to view, dispatch rider or update status</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/orders')}
              className="text-xs text-blue-600 font-semibold"
            >
              All Orders ({orders.length}) →
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/50">
                  <tr>
                    <th className="px-5 py-3">Order ID</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Laundry Hub</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 7).map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderModalOpen(true);
                      }}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-blue-600 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-slate-400" />
                        {order.id}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400">{order.customerPhone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{order.partnerName}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-800">{order.serviceName}</span>
                        <span className="text-[10px] text-slate-400 block">{order.itemsCount} items</span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">₹{order.amount}</td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals / KYC Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">Pending KYC Queue</CardTitle>
              <p className="text-xs text-slate-500">Partner & rider credential verification</p>
            </div>
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="text-[10px] bg-red-100 text-red-800 font-bold border-red-200">
                {pendingApprovals.length} Action Needed
              </Badge>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {pendingApprovals.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedVerification(item);
                    setIsVerificationModalOpen(true);
                  }}
                  className="flex items-start p-3 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 bg-slate-50/50 cursor-pointer transition-all"
                >
                  <div className="bg-white p-2 rounded-lg text-blue-600 shadow-2xs border border-slate-100 mr-3">
                    {item.type === 'Vendor' ? <Store className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-slate-900 truncate text-xs">{item.name}</p>
                      <Badge variant="secondary" className="text-[9px] h-4">
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Docs: {item.docs.join(', ')} • {item.submittedDate}
                    </p>
                  </div>
                </div>
              ))}

              {pendingApprovals.length === 0 && (
                <div className="text-center p-6 text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  All KYC applications are up to date!
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/verifications')}
              className="w-full mt-4 text-xs font-bold text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              Open Full Verification Console ({verifications.length})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedOrder(null);
        }}
        orderToEdit={selectedOrder}
      />

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
      />

      <VendorModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
      />

      <RiderModal
        isOpen={isRiderModalOpen}
        onClose={() => setIsRiderModalOpen(false)}
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setSelectedVerification(null);
        }}
        item={selectedVerification}
      />
    </div>
  );
}
