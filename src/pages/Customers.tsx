import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Plus, Trash2, Edit3, UserCheck, Shield, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { CustomerModal } from '@/components/modals/CustomerModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Customer } from '@/types';

export default function Customers() {
  const { customers, deleteCustomer } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'All' || customer.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, selectedStatus]);

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_customers',
      filteredCustomers.map((c) => ({
        CustomerID: c.id,
        Name: c.name,
        Phone: c.phone,
        Email: c.email,
        TotalOrders: c.totalOrders,
        WalletBalanceINR: c.walletBalance,
        Status: c.status,
        Address: c.address,
        City: c.city,
        RegisteredDate: c.registeredDate,
        LastOrder: c.lastOrderDate || 'Never',
      }))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Customer Accounts & Wallets</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer directories, wallet cashback balances, order frequency, and VIP tiers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV ({filteredCustomers.length})
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCustomerToEdit(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Customer
          </Button>
        </div>
      </div>

      {/* Customer Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{customers.length}</h3>
          </div>
          <UserCheck className="w-8 h-8 text-blue-600 p-1.5 bg-blue-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIP Gold Members</p>
            <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">
              {customers.filter((c) => c.status === 'VIP').length}
            </h3>
          </div>
          <Shield className="w-8 h-8 text-indigo-600 p-1.5 bg-indigo-50 rounded-xl" />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Wallet Float</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
              ₹{customers.reduce((acc, c) => acc + c.walletBalance, 0).toLocaleString()}
            </h3>
          </div>
          <Wallet className="w-8 h-8 text-emerald-600 p-1.5 bg-emerald-50 rounded-xl" />
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
                placeholder="Search by name, email, address or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Customer Tiers</option>
              <option value="Active">Active Users</option>
              <option value="VIP">VIP Gold Tier</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {filteredCustomers.length} accounts found
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">ID</th>
                <th className="px-5 py-3 whitespace-nowrap">Customer Name</th>
                <th className="px-5 py-3 whitespace-nowrap">Contact & City</th>
                <th className="px-5 py-3 whitespace-nowrap">Delivery Address</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Orders</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Wallet Balance</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Status</th>
                <th className="px-5 py-3 whitespace-nowrap">Joined Date</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-400 whitespace-nowrap">
                    {customer.id}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-bold text-slate-900">{customer.name}</p>
                    <p className="text-[10px] text-slate-400">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="text-slate-700 font-medium">{customer.phone}</p>
                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-semibold">
                      {customer.city}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">
                    {customer.address}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {customer.totalOrders}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ₹{customer.walletBalance}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {customer.status === 'VIP' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        VIP Gold
                      </span>
                    )}
                    {customer.status === 'Active' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Active
                      </span>
                    )}
                    {customer.status === 'Inactive' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                    {customer.registeredDate}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs font-semibold px-2.5"
                        onClick={() => {
                          setCustomerToEdit(customer);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <button
                        onClick={() => setCustomerToDelete(customer)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No customers found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete.id);
            setCustomerToDelete(null);
          }
        }}
        title={`Delete Customer Profile?`}
        description={`Are you sure you want to remove ${customerToDelete?.name || 'this customer'} (${customerToDelete?.phone || ''})? Their account and laundry history will be removed.`}
        confirmText="Yes, Remove Customer"
      />
    </div>
  );
}
