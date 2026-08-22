import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { SupportTicket } from '@/types';
import { useData } from '@/context/DataContext';
import { Send, UserCheck, MessageSquare } from 'lucide-react';

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
}

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({ isOpen, onClose, ticket }) => {
  const { replyTicket, updateTicketStatus, updateTicketPriority } = useData();
  const [replyText, setReplyText] = useState('');

  if (!ticket) return null;

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    replyTicket(ticket.id, replyText.trim());
    setReplyText('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Support Case: #${ticket.id}`}
      subtitle={`Subject: "${ticket.subject}"`}
      maxWidth="xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Quick Status:</span>
            <select
              value={ticket.status}
              onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
              className="text-xs bg-white border border-gray-200 rounded-lg p-1.5 font-semibold"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={ticket.priority}
              onChange={(e) => updateTicketPriority(ticket.id, e.target.value as any)}
              className="text-xs bg-white border border-gray-200 rounded-lg p-1.5 font-semibold"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>

          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Ticket Header Metadata */}
        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-gray-500 block">Raised By</span>
            <span className="font-bold text-gray-900">{ticket.by} ({ticket.role})</span>
          </div>
          <div>
            <span className="text-gray-500 block">Category</span>
            <span className="font-semibold text-gray-900">{ticket.category}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Reported At</span>
            <span className="font-semibold text-gray-900">{ticket.createdAt}</span>
          </div>
        </div>

        {/* Message Thread */}
        <div className="space-y-3 min-h-[160px] max-h-[260px] overflow-y-auto p-2 bg-slate-50/50 rounded-xl border border-slate-100">
          {ticket.messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col ${msg.isStaff ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.isStaff
                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-80">
                  <span className="font-bold flex items-center gap-1">
                    {msg.isStaff ? <UserCheck className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                    {msg.sender}
                  </span>
                  <span>{msg.time}</span>
                </div>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Response Box */}
        <form onSubmit={handleSendReply} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Type official support message or customer resolution note..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 text-xs bg-white border border-gray-200 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit">
            <Send className="w-4 h-4 mr-1.5" />
            Send Reply
          </Button>
        </form>
      </div>
    </Modal>
  );
};
