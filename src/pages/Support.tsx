import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Headphones, CheckCircle2, AlertTriangle, Clock, Plus, Download, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { SupportTicketModal } from '@/components/modals/SupportTicketModal';
import { NewTicketModal } from '@/components/modals/NewTicketModal';
import { SupportTicket } from '@/types';
import { exportToCsv } from '@/lib/exportCsv';
import { useToast } from '@/context/ToastContext';

export default function Support() {
  const { tickets, updateTicketStatus } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const openTicketsCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.by.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
      const matchesRole = selectedRole === 'All' || t.role === selectedRole;
      const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;

      return matchesSearch && matchesPriority && matchesRole && matchesStatus;
    });
  }, [tickets, searchQuery, selectedPriority, selectedRole, selectedStatus]);

  const handleQuickClose = (ticket: SupportTicket) => {
    updateTicketStatus(ticket.id, 'Resolved');
    showToast('Ticket Resolved', `Ticket #${ticket.id} marked as resolved.`);
  };

  const handleNewTicket = () => {
    setIsNewTicketModalOpen(true);
  };

  const handleExport = () => {
    exportToCsv(
      'yesdhobi_support_tickets',
      filteredTickets.map((t) => ({
        TicketID: t.id,
        Subject: t.subject,
        RaisedBy: t.by,
        UserRole: t.role,
        Category: t.category,
        Priority: t.priority,
        Status: t.status,
        CreatedDate: t.createdAt,
        MessagesCount: t.messages.length,
      }))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Laundry Operations Helpdesk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve customer garment complaints, pickup delays, partner disputes, and wallet refund claims.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Tickets
          </Button>
          <Button size="sm" onClick={handleNewTicket}>
            <Plus className="h-4 w-4 mr-1.5" />
            Log Support Claim
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Tickets</p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{openTicketsCount}</h3>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Needs prompt operator reply</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
                <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{inProgressCount}</h3>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Headphones className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Under active investigation</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Cases</p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{resolvedCount}</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-600">99.4% customer satisfaction</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-2xs">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Turnaround</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">1.8 Hours</h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400">Target SLA: 4 Hours max</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search ticket ID, customer name, issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-white"
              />
            </div>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-medium focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All User Roles</option>
              <option value="Customer">Customer Tickets</option>
              <option value="Vendor">Vendor Tickets</option>
              <option value="Rider">Rider Tickets</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 text-xs rounded-xl border border-slate-200 text-slate-700 bg-white font-semibold focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500">
            {filteredTickets.length} tickets matching
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100 bg-slate-50/80">
              <tr>
                <th className="px-5 py-3 whitespace-nowrap">Ticket ID</th>
                <th className="px-5 py-3 whitespace-nowrap w-2/5">Subject & Description</th>
                <th className="px-5 py-3 whitespace-nowrap">Raised By</th>
                <th className="px-5 py-3 whitespace-nowrap">User Role</th>
                <th className="px-5 py-3 whitespace-nowrap">Category</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Priority</th>
                <th className="px-5 py-3 whitespace-nowrap text-center">Status</th>
                <th className="px-5 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                    {t.id}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-slate-900 line-clamp-1">{t.subject}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {t.messages.length} message(s) • Reported {t.createdAt}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                    {t.by}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        t.role === 'Customer'
                          ? 'bg-blue-50 text-blue-700'
                          : t.role === 'Vendor'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {t.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                    {t.category}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {t.priority === 'High' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        High Priority
                      </span>
                    )}
                    {t.priority === 'Medium' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Medium
                      </span>
                    )}
                    {t.priority === 'Low' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                        Low
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center whitespace-nowrap">
                    {t.status === 'Open' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        Open
                      </span>
                    )}
                    {t.status === 'In Progress' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        In Progress
                      </span>
                    )}
                    {t.status === 'Resolved' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Resolved
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        size="sm"
                        className="h-7 text-xs font-semibold px-2.5 bg-blue-600"
                        onClick={() => {
                          setSelectedTicket(t);
                          setIsModalOpen(true);
                        }}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Reply / Resolve
                      </Button>

                      {t.status !== 'Resolved' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs font-semibold px-2 text-slate-600 hover:bg-slate-100"
                          onClick={() => handleQuickClose(t)}
                        >
                          Close
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No tickets found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Ticket Chat Modal */}
      <SupportTicketModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />

      {/* New Support Ticket Modal */}
      <NewTicketModal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
      />
    </div>
  );
}
