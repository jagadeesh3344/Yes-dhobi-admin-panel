import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { CustomerModal } from '@/components/modals/CustomerModal';
import { exportToCsv } from '@/lib/exportCsv';
import { Customer } from '@/types';

export default function Customers() {
  const { customers } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extended customer list strictly matching the image 3 screenshot
  const defaultList: Customer[] = [
    {
      id: 'C-1029',
      name: 'Aaron Mehta',
      phone: '+91 98765 43210',
      email: 'aaronmehta@gmail.com',
      address: 'Flat 402, Sunshine Heights, Bandra West',
      city: 'Mumbai',
      totalOrders: 42,
      walletBalance: 8450,
      status: 'Active',
      registeredDate: '12 Jan 2024',
    },
    {
      id: 'C-1028',
      name: 'Priya Sharma',
      phone: '+91 91234 56781',
      email: 'priyasharma@yahoo.com',
      address: 'Plot 12, Indiranagar 100ft Road',
      city: 'Bengaluru',
      totalOrders: 28,
      walletBalance: 5230,
      status: 'Active',
      registeredDate: '24 Jan 2024',
    },
    {
      id: 'C-1027',
      name: 'Amit Patel',
      phone: '+91 98112 33144',
      email: 'amit.patel@rediffmail.com',
      address: 'C-34, Defence Colony',
      city: 'Delhi',
      totalOrders: 15,
      walletBalance: 3420,
      status: 'Inactive',
      registeredDate: '05 Feb 2024',
    },
    {
      id: 'C-1026',
      name: 'Vikram Singh',
      phone: '+91 97115 56577',
      email: 'vikram.singh@outlook.com',
      address: 'Tower B, DLF Cyber City',
      city: 'Gurugram',
      totalOrders: 55,
      walletBalance: 12580,
      status: 'Active',
      registeredDate: '15 Feb 2024',
    },
    {
      id: 'C-1025',
      name: 'Sneha Rao',
      phone: '+91 95112 44332',
      email: 'sneha.rao@gmail.com',
      address: 'Flat 101, Palm Meadows, Whitefield',
      city: 'Bengaluru',
      totalOrders: 9,
      walletBalance: 1650,
      status: 'Suspended',
      registeredDate: '03 Mar 2024',
    },
    {
      id: 'C-1024',
      name: 'Rajesh Iyer',
      phone: '+91 99887 76655',
      email: 'rajesh.iyer@gmail.com',
      address: 'B-12, Alwarpet High Road',
      city: 'Chennai',
      totalOrders: 31,
      walletBalance: 5120,
      status: 'Active',
      registeredDate: '12 Mar 2024',
    },
    {
      id: 'C-1023',
      name: 'Neha Gupta',
      phone: '+91 94412 11223',
      email: 'neha.gupta@corp.in',
      address: 'House 88, Sector 17',
      city: 'Chandigarh',
      totalOrders: 19,
      walletBalance: 3300,
      status: 'Active',
      registeredDate: '28 Mar 2024',
    },
    {
      id: 'C-1022',
      name: 'Sanjay Dutt',
      phone: '+91 98555 88885',
      email: 'sanjaydutt@gmail.com',
      address: 'Bungalow 7, Pali Hill',
      city: 'Mumbai',
      totalOrders: 5,
      walletBalance: 1100,
      status: 'Inactive',
      registeredDate: '22 Mar 2024',
    },
    {
      id: 'C-1021',
      name: 'Deepika Sen',
      phone: '+91 97785 55443',
      email: 'deepika.sen@design.co',
      address: 'Lake Gardens, South Kolkata',
      city: 'Kolkata',
      totalOrders: 23,
      walletBalance: 4800,
      status: 'Active',
      registeredDate: '29 Mar 2024',
    },
    {
      id: 'C-1020',
      name: 'Rohan Verma',
      phone: '+91 93322 11009',
      email: 'rohan.verma@tech.in',
      address: 'A-22, Baner Road',
      city: 'Pune',
      totalOrders: 12,
      walletBalance: 2100,
      status: 'Active',
      registeredDate: '02 Apr 2024',
    },
  ];

  const combinedCustomers = useMemo(() => {
    const existingIds = new Set(customers.map((c) => c.id));
    const uniqueDefault = defaultList.filter((d) => !existingIds.has(d.id));
    return [...customers, ...uniqueDefault];
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return combinedCustomers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && customer.status === 'Active') ||
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

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_customers',
      filteredCustomers.map((c) => ({
        CustomerID: c.id,
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
              placeholder="Search by name, email or phone..."
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

      {/* Customer Registry Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">ID</th>
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
              {paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">{customer.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{customer.name}</td>
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{customer.phone}</td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{customer.email}</td>
                  <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">{customer.totalOrders} orders</td>
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
                    <button
                      onClick={() => {
                        setCustomerToEdit(customer);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-slate-400">
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
            Showing 1-{Math.min(itemsPerPage, paginatedCustomers.length)} of 4,820 customers
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

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCustomerToEdit(null);
        }}
        customerToEdit={customerToEdit}
      />
    </div>
  );
}
