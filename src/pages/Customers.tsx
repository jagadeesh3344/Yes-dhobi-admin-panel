import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, ChevronLeft, ChevronRight, Trash2, Copy, Check } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { CustomerModal } from '@/components/modals/CustomerModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { exportToCsv } from '@/lib/exportCsv';
import { formatCustomerDisplayId } from '@/lib/idUtils';
import { Customer } from '@/types';

export default function Customers() {
  const { customers, deleteCustomer, deleteCustomers } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const combinedCustomers = customers;

  const getDisplayId = (c: Customer) => c.displayId || formatCustomerDisplayId(c.id);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredCustomers = useMemo(() => {
    return combinedCustomers.filter((customer) => {
      const dispId = getDisplayId(customer);
      const q = searchQuery.toLowerCase().trim();
      const numOnly = dispId.replace(/\D/g, '');

      const matchesSearch =
        !q ||
        customer.name.toLowerCase().includes(q) ||
        customer.phone.toLowerCase().includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.id.toLowerCase().includes(q) ||
        dispId.toLowerCase().includes(q) ||
        numOnly.includes(q);

      const matchesStatus =
        selectedStatus === 'All'
          ? customer.status !== 'Inactive' && customer.status !== 'Suspended'
          : (selectedStatus === 'Active' && customer.status === 'Active') ||
            (selectedStatus === 'VIP' && customer.status === 'VIP') ||
            (selectedStatus === 'Suspended' && customer.status === 'Suspended') ||
            (selectedStatus === 'Inactive' && customer.status === 'Inactive');

      return matchesSearch && matchesStatus;
    });
  }, [combinedCustomers, searchQuery, selectedStatus]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCustomers.slice(start, start + itemsPerPage);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;

  // Checkbox selection helpers
  const isAllSelected =
    paginatedCustomers.length > 0 &&
    paginatedCustomers.every((c) => selectedCustomerIds.includes(c.id));
  const isSomeSelected =
    paginatedCustomers.some((c) => selectedCustomerIds.includes(c.id)) && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      const pageIds = new Set(paginatedCustomers.map((c) => c.id));
      setSelectedCustomerIds((prev) => prev.filter((id) => !pageIds.has(id)));
    } else {
      const pageIds = paginatedCustomers.map((c) => c.id);
      setSelectedCustomerIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedCustomerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_customers',
      filteredCustomers.map((c) => ({
        CustomerID: getDisplayId(c),
        SystemID: c.id,
        Name: c.name,
        Phone: c.phone,
        Email: c.email,
        TotalOrders: c.totalOrders,
        TotalSpendINR: c.walletBalance,
        Status: c.status,
        JoinedDate: c.registeredDate,
      }))
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
      case 'VIP':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Suspended':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Inactive':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID (e.g. CUST-40599), name, email, phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 text-xs sm:text-sm bg-white border-slate-200 rounded-xl"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Status: All Customers</option>
            <option value="Active">Active</option>
            <option value="VIP">VIP</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
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
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedCustomerIds.length > 0 && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-900 px-4 py-2.5 rounded-xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-semibold">
              {selectedCustomerIds.length} customer{selectedCustomerIds.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCustomerIds([])}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-white/60 rounded-lg transition-colors cursor-pointer"
            >
              Clear selection
            </button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="h-8 px-3 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedCustomerIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Customer Registry Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="w-10 px-4 py-3.5">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    title="Select all on this page"
                  />
                </th>
                <th className="px-5 py-3.5 whitespace-nowrap">Customer ID</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Customer Name</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Phone</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Email</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Total Orders</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Total Spend</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Joined Date</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.map((customer) => {
                const isSelected = selectedCustomerIds.includes(customer.id);
                const displayId = getDisplayId(customer);
                return (
                  <tr
                    key={customer.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-blue-50/50 hover:bg-blue-50/70' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="w-10 px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(customer.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        aria-label={`Select customer ${customer.name}`}
                      />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 group">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/70">
                          {displayId}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(customer.id, displayId);
                          }}
                          title={`Copy ID: ${displayId} (System ID: ${customer.id})`}
                          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Copy customer ID"
                        >
                          {copiedId === customer.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{customer.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate max-w-[220px]">
                        {[customer.address, customer.city, customer.pincode].filter(Boolean).join(', ') || 'No address saved'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap font-medium">{customer.phone}</td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{customer.email}</td>
                    <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap font-medium">{customer.totalOrders} orders</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">₹{customer.walletBalance.toLocaleString()}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap min-w-[75px] ${getStatusBadge(
                          customer.status
                        )}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{customer.registeredDate}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setCustomerToEdit(customer);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => setCustomerToDelete(customer)}
                          title="Delete Customer"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400">
                    No customers found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <p>
            Showing {filteredCustomers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
          </p>
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

      {/* Customer Edit/Add Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
      />

      {/* Single Customer Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete.id);
            setSelectedCustomerIds((prev) => prev.filter((id) => id !== customerToDelete.id));
            setCustomerToDelete(null);
          }
        }}
        title={`Delete Customer ${customerToDelete?.name || ''}?`}
        description={`Are you sure you want to delete ${customerToDelete?.name || 'this customer'} (${customerToDelete ? getDisplayId(customerToDelete) : ''}, Phone: ${customerToDelete?.phone || 'N/A'})? This will deactivate their account and remove them from active records.`}
        confirmText="Yes, Delete Customer"
      />

      {/* Bulk Delete Customers Confirmation Modal */}
      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={() => {
          deleteCustomers(selectedCustomerIds);
          setSelectedCustomerIds([]);
          setIsBulkDeleteModalOpen(false);
        }}
        title={`Delete ${selectedCustomerIds.length} Selected Customers?`}
        description={`Are you sure you want to permanently delete and deactivate the ${selectedCustomerIds.length} selected customer accounts? This action will remove them from active records.`}
        confirmText={`Yes, Delete (${selectedCustomerIds.length}) Customers`}
      />
    </div>
  );
}
