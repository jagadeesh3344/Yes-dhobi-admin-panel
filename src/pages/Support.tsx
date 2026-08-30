import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { SupportTicketModal } from '@/components/modals/SupportTicketModal';
import { NewTicketModal } from '@/components/modals/NewTicketModal';
import { SupportTicket } from '@/types';
import { exportToCsv } from '@/lib/exportCsv';

export default function Support() {
  const { tickets } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const defaultSupportTickets: SupportTicket[] = [
    {
      id: 'TKT-8901',
      subject: 'Missing 2 Silk Shirts in Order #ORD-8492',
      by: 'Aaron Mehta',
      role: 'Customer',
      category: 'Missing Items',
      priority: 'High',
      status: 'Open',
      createdAt: '12 Apr, 10:30 AM',
      messages: [{ sender: 'Aaron Mehta', text: 'Garments missing from pickup return parcel.', time: '10:30 AM' }],
    },
    {
      id: 'TKT-8902',
      subject: 'Delay in Pickup due to Heavy Rain',
      by: 'Suresh Patel',
      role: 'Rider',
      category: 'Delayed Delivery',
      priority: 'Medium',
      status: 'In Progress',
      createdAt: '12 Apr, 09:15 AM',
      messages: [{ sender: 'Suresh Patel', text: 'Waterlogging at SV road junction causing route delay.', time: '09:15 AM' }],
    },
    {
      id: 'TKT-8903',
      subject: 'Color bleeding dispute on Designer Saree',
      by: 'Royal Drycleaners',
      role: 'Vendor',
      category: 'Garment Damage',
      priority: 'Urgent',
      status: 'Open',
      createdAt: '11 Apr, 04:45 PM',
      messages: [{ sender: 'Royal Drycleaners', text: 'Customer saree had pre-existing chemical stains.', time: '04:45 PM' }],
    },
    {
      id: 'TKT-8904',
      subject: 'Double charge on UPI transaction #TXN-902',
      by: 'Priya Sharma',
      role: 'Customer',
      category: 'Billing & Refund',
      priority: 'Medium',
      status: 'Resolved',
      createdAt: '11 Apr, 02:10 PM',
      messages: [{ sender: 'Priya Sharma', text: 'Account debited twice for order ORD-8488.', time: '02:10 PM' }],
    },
    {
      id: 'TKT-8905',
      subject: 'GPS Navigation map pin wrong location',
      by: 'Vijay Verma',
      role: 'Rider',
      category: 'App Issue',
      priority: 'Low',
      status: 'Resolved',
      createdAt: '10 Apr, 11:20 AM',
      messages: [{ sender: 'Vijay Verma', text: 'Address coordinates were 500m away from entrance.', time: '11:20 AM' }],
    },
    {
      id: 'TKT-8906',
      subject: 'Special steam press request for wedding suits',
      by: 'Vikram Singh',
      role: 'Customer',
      category: 'Special Request',
      priority: 'Low',
      status: 'Open',
      createdAt: '10 Apr, 08:30 AM',
      messages: [{ sender: 'Vikram Singh', text: 'Please use extra delicate hanger packing.', time: '08:30 AM' }],
    },
  ];

  const combinedTickets = useMemo(() => {
    const existingIds = new Set(tickets.map((t) => t.id));
    const uniqueDefault = defaultSupportTickets.filter((d) => !existingIds.has(d.id));
    return [...tickets, ...uniqueDefault];
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return combinedTickets.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.by.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
      const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
      const matchesCategory = selectedCategory === 'All' || t.category.toLowerCase().includes(selectedCategory.toLowerCase());

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [combinedTickets, searchQuery, selectedStatus, selectedPriority, selectedCategory]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, currentPage]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_support_tickets',
      filteredTickets.map((t) => ({
        TicketID: t.id,
        Subject: t.subject,
        RaisedBy: `${t.role}: ${t.by}`,
        Category: t.category,
        Priority: t.priority,
        Status: t.status,
        CreatedDate: t.createdAt,
      }))
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'High':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
      default:
        return 'bg-blue-50 text-blue-600 border-blue-200';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ticket ID, subject, raised by..."
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
            <option value="All">Status: All Tickets</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Priority: All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">Category: All Categories</option>
            <option value="Missing Items">Missing Items</option>
            <option value="Delayed Delivery">Delayed Delivery</option>
            <option value="Garment Damage">Garment Damage</option>
            <option value="Billing & Refund">Billing & Refund</option>
            <option value="App Issue">App Issue</option>
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
          <Button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="h-10 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm shadow-blue-600/20"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Ticket
          </Button>
        </div>
      </div>

      {/* Support Tickets Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100 bg-slate-50/70">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">Ticket ID</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Subject</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Raised By</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Category</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Priority</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 whitespace-nowrap">Created Date</th>
                <th className="px-5 py-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">{ticket.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900 max-w-xs truncate">{ticket.subject}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-semibold text-slate-900">{ticket.by}</p>
                    <p className="text-[10px] text-slate-500">{ticket.role}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">{ticket.category}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap min-w-[70px] ${getPriorityBadge(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap min-w-[80px] ${getStatusBadge(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">{ticket.createdAt}</td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setIsModalOpen(true);
                      }}
                      className="px-3.5 py-1 text-xs font-bold text-blue-600 bg-blue-50/60 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}

              {paginatedTickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No support tickets found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
          <p>Showing 1-{paginatedTickets.length} of 18 support tickets</p>
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

      {/* Support Ticket Details Modal */}
      {selectedTicket && (
        <SupportTicketModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
        />
      )}

      {/* New Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
      />
    </div>
  );
}
