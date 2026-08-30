import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  Package,
  Users,
  Store,
  Truck,
  IndianRupee,
  Plus,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { OrderModal } from '@/components/modals/OrderModal';
import { CustomerModal } from '@/components/modals/CustomerModal';
import { RiderModal } from '@/components/modals/RiderModal';
import { VerificationModal } from '@/components/modals/VerificationModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Order, VerificationItem } from '@/types';

const weeklyData = [
  { name: 'Mon', orders: 150 },
  { name: 'Tue', orders: 400 },
  { name: 'Wed', orders: 350 },
  { name: 'Thu', orders: 800 },
  { name: 'Fri', orders: 750 },
  { name: 'Sat', orders: 1200 },
  { name: 'Sun', orders: 1500 },
];

const serviceTypeData = [
  { name: 'Wash & Fold', percentage: 52, color: '#2563EB' },
  { name: 'Dry Clean', percentage: 26, color: '#F59E0B' },
  { name: 'Only Ironing', percentage: 17, color: '#06B6D4' },
  { name: 'Premium Care', percentage: 5, color: '#F43F5E' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { orders, customers, vendors, riders, verifications } = useData();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<VerificationItem | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  const handleExportDashboard = () => {
    exportToCsv(
      'yesdhobi_operational_report',
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
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Ready':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Pending Pickup':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const pendingApprovalsList = [
    {
      id: 'V-APP-1',
      name: 'Pune Wash Hub',
      type: 'Vendor',
      loc: 'Kothrud, Pune',
      time: '10 mins ago',
      phone: '+91 98220 11223',
      docs: ['Shop License', 'GSTIN', 'Aadhaar Card'],
      submittedDate: 'Today, 10:15 AM',
      status: 'Pending Review' as const,
      city: 'Pune',
    },
    {
      id: 'R-APP-2',
      name: 'Ajay Devan',
      type: 'Rider',
      loc: 'Saket, Delhi',
      time: '1 hour ago',
      phone: '+91 98110 55443',
      docs: ['Driving License', 'RC Book', 'Aadhaar Card'],
      submittedDate: 'Today, 09:30 AM',
      status: 'Pending Review' as const,
      city: 'Delhi',
    },
    {
      id: 'V-APP-3',
      name: 'Super Dry Cleaners',
      type: 'Vendor',
      loc: 'HSR Layout, Bengaluru',
      time: '2 hours ago',
      phone: '+91 99001 88776',
      docs: ['Shop Act Registration', 'Electricity Bill', 'PAN Card'],
      submittedDate: 'Today, 08:45 AM',
      status: 'Pending Review' as const,
      city: 'Bengaluru',
    },
    {
      id: 'R-APP-4',
      name: 'Sunil Yadav',
      type: 'Rider',
      loc: 'Andheri West, Mumbai',
      time: '5 hours ago',
      phone: '+91 98200 44332',
      docs: ['Commercial DL', 'Vehicle Insurance', 'PAN Card'],
      submittedDate: 'Today, 06:15 AM',
      status: 'Pending Review' as const,
      city: 'Mumbai',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 5 KPI Stat Cards in One Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Orders Today */}
        <Card
          className="bg-white border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
          onClick={() => navigate('/orders')}
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Orders Today</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">1,482</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+12.4% vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card
          className="bg-white border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
          onClick={() => navigate('/customers')}
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Customers</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">28,450</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+8.2% vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Vendors */}
        <Card
          className="bg-white border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
          onClick={() => navigate('/vendors')}
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Vendors</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">532</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Store className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+1.5% vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Riders */}
        <Card
          className="bg-white border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
          onClick={() => navigate('/riders')}
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500">Active Riders</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">1,120</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs font-semibold text-rose-500">
              <TrendingDown className="w-3.5 h-3.5 mr-1" />
              <span>-0.6% vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Revenue */}
        <Card
          className="bg-white border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer"
          onClick={() => navigate('/revenue')}
        >
          <CardContent className="p-4 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-500">Daily Revenue</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">₹1,84,500</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+18.5% vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row: Weekly Order Analytics & Revenue by Service Type */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Order Analytics (2 Cols) */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Weekly Order Analytics</CardTitle>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              Online
            </span>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} ticks={[0, 500, 1000, 1500]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#2563EB"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Service Type (1 Col) */}
        <Card className="bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-bold text-slate-900">Revenue by Service Type</CardTitle>
            <button
              onClick={handleExportDashboard}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Export Detailed report
            </button>
          </CardHeader>
          <CardContent>
            <div className="h-[210px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceTypeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'Share']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {serviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mt-2 px-1">
              <span>Wash: 52%</span>
              <span>Dry Clean: 26%</span>
              <span>Iron: 17%</span>
              <span>Premium: 5%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Active & Recent Orders & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active & Recent Orders Table (2 Cols) */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Active & Recent Orders</CardTitle>
            <button
              onClick={() => navigate('/orders')}
              className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              View All Orders →
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100 bg-slate-50/70">
                  <tr>
                    <th className="px-5 py-3 whitespace-nowrap">Order ID</th>
                    <th className="px-5 py-3 whitespace-nowrap">Customer</th>
                    <th className="px-5 py-3 whitespace-nowrap">Laundry Partner</th>
                    <th className="px-5 py-3 whitespace-nowrap">Service</th>
                    <th className="px-5 py-3 whitespace-nowrap">Amount</th>
                    <th className="px-5 py-3 text-right whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.slice(0, 6).map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderModalOpen(true);
                      }}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-blue-600 whitespace-nowrap">{order.id}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{order.customerName}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{order.partnerName}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{order.serviceName}</span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">₹{order.amount}</td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap min-w-[90px] ${getStatusBadge(
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

        {/* Pending Approvals (1 Col) */}
        <Card className="bg-white border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900">Pending Approvals</CardTitle>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                18 New
              </span>
            </CardHeader>
            <CardContent className="pt-3">
              <p className="text-xs text-slate-500 mb-4">
                Verify new laundry shop onboarding requests and delivery rider applications.
              </p>

              <div className="space-y-3">
                {pendingApprovalsList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedVerification({
                        id: item.id,
                        name: item.name,
                        type: item.type as 'Vendor' | 'Rider',
                        phone: item.phone,
                        submittedDate: item.submittedDate,
                        docs: item.docs,
                        status: item.status,
                        city: item.city,
                      });
                      setIsVerificationModalOpen(true);
                    }}
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/30 bg-slate-50/50 cursor-pointer transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-xs truncate">{item.name}</p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            item.type === 'Vendor'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.loc} • {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>

          <div className="p-4 pt-0">
            <Button
              variant="outline"
              onClick={() => navigate('/verifications')}
              className="w-full text-xs font-bold text-blue-600 bg-blue-50/60 border-blue-200 hover:bg-blue-100 py-2.5 rounded-xl cursor-pointer"
            >
              Go to Verifications Panel
            </Button>
          </div>
        </Card>
      </div>

      {/* Modals for Interactivity */}
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
