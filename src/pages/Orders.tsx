import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Download, Filter, Trash2, Edit3, Bike, Store, CheckCircle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { OrderModal } from '@/components/modals/OrderModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Order, OrderStatus } from '@/types';

export default function Orders() {
  const { orders, updateOrderStatus, deleteOrder } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  // Dynamic counts
  const pendingPickupCount = orders.filter((o) => o.status === 'Pending Pickup' || o.status === 'Assigned').length;
  const inProcessCount = orders.filter(
    (o) => o.status === 'In Laundry' || o.status === 'Washing' || o.status === 'Ironing' || o.status === 'Ready'
  ).length;
  const outForDeliveryCount = orders.filter((o) => o.status === 'Out for Delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.riderName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesService = selectedService === 'All' || order.serviceName === selectedService;
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && order.status !== 'Delivered' && order.status !== 'Cancelled') ||
        order.status === selectedStatus;

      return matchesSearch && matchesService && matchesStatus;
    });
  }, [orders, searchQuery, selectedService, selectedStatus]);

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_orders_master',
      filteredOrders.map((o) => ({
        OrderID: o.id,
        Customer: o.customerName,
        Phone: o.customerPhone,
        Address: o.customerAddress || 'N/A',
        Partner: o.partnerName,
        Rider: o.riderName,
        Service: o.serviceName,
        ItemsCount: o.itemsCount,
        Details: o.itemDetails || 'N/A',
        AmountINR: o.amount,
        Status: o.status,
        PaymentMethod: o.paymentMethod,
        PaymentStatus: o.paymentStatus,
        PickupDate: o.pickupDate,
        DeliveryDate: o.deliveryDate || 'N/A',
      }))
    );
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Laundry':
      case 'Washing':
      case 'Ironing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Ready':
      case 'Out for Delivery':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending Pickup':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Orders Master Registry</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full lifecycle control over customer laundry orders, processing stages, and rider dispatch.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV ({filteredOrders.length})
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setOrderToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Manual Order
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards - Clean 3-Card Grid without Blinking/Ping */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Process (Washing & Ironing)</p>
            <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{inProcessCount}</h3>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Out for Delivery</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{outForDeliveryCount}</h3>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivered Completed</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{deliveredCount}</h3>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by Order ID, Customer, Rider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white"
              />
            </div>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Services</option>
              <option value="Wash & Iron">Wash & Iron</option>
              <option value="Dry Clean">Dry Clean</option>
              <option value="Only Ironing">Only Ironing</option>
              <option value="Premium Care">Premium Care</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses ({orders.length})</option>
              <option value="Active">Active Only</option>
              <option value="Pending Pickup">Pending Pickup</option>
              <option value="Assigned">Assigned</option>
              <option value="In Laundry">In Laundry</option>
              <option value="Washing">Washing</option>
              <option value="Ironing">Ironing</option>
              <option value="Ready">Ready</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {(searchQuery || selectedService !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedService('All');
                  setSelectedStatus('All');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline px-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-slate-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Order ID</th>
                <th className="px-5 py-3 whitespace-nowrap">Customer</th>
                <th className="px-5 py-3 whitespace-nowrap">Vendor Hub</th>
                <th className="px-5 py-3 whitespace-nowrap">Assigned Rider</th>
                <th className="px-5 py-3 whitespace-nowrap">Service Details</th>
                <th className="px-5 py-3 whitespace-nowrap">Amount</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Live Status</th>
                <th className="px-5 py-3 whitespace-nowrap">Pickup Slot</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-extrabold text-blue-600 whitespace-nowrap">
                    {order.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-[10px] text-slate-400">{order.customerPhone}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-medium whitespace-nowrap">
                    {order.partnerName}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        order.riderName === 'Unassigned'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      <Bike className="w-3 h-3 text-slate-400" />
                      {order.riderName}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{order.serviceName}</p>
                    <p className="text-[10px] text-slate-400">
                      {order.itemsCount} items {order.itemDetails ? `• ${order.itemDetails}` : ''}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-bold text-slate-900">₹{order.amount}</p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer whitespace-nowrap outline-none ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      <option value="Pending Pickup">Pending Pickup</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Laundry">In Laundry</option>
                      <option value="Washing">Washing</option>
                      <option value="Ironing">Ironing</option>
                      <option value="Ready">Ready</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                    {order.pickupDate}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold px-2.5"
                        onClick={() => {
                          setOrderToEdit(order);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Manage
                      </Button>
                      <button
                        onClick={() => setOrderToDelete(order)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No orders matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOrderToEdit(null);
        }}
        orderToEdit={orderToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) {
            deleteOrder(orderToDelete.id);
            setOrderToDelete(null);
          }
        }}
        title={`Delete Order #${orderToDelete?.id || ''}?`}
        description={`Are you sure you want to delete the order for ${orderToDelete?.customerName || 'this customer'} (${orderToDelete?.serviceName || 'Laundry Service'})? This action will permanently remove this order from active records.`}
        confirmText="Yes, Delete Order"
      />
    </div>
  );
}
