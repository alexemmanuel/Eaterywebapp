import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Download,
  X,
  MessageSquare,
  Ticket,
  Calendar,
  DollarSign,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Printer,
} from 'lucide-react';
import { Order } from '../types';
import { exportOrdersToCSV, formatOrderDuplicateText, getWhatsAppShareUrl } from '../utils/storage';
import { DISPLAY_ADMIN_WHATSAPP } from '../data/menu';
import { PrintableTicketModal } from './PrintableTicketModal';

interface OrderRecordsModalProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onSelectOrderForTracking: (order: Order) => void;
}

export const OrderRecordsModal: React.FC<OrderRecordsModalProps> = ({
  orders,
  isOpen,
  onClose,
  onSelectOrderForTracking,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInspectOrder, setSelectedInspectOrder] = useState<Order | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [ticketToPrint, setTicketToPrint] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        order.couponCode.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        order.customerPhone.toLowerCase().includes(q) ||
        (order.deliveryAddress || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && order.status === 'completed') ||
        (statusFilter === 'ready' && order.status === 'ready') ||
        (statusFilter === 'issues' && (order.issues?.length || 0) > 0) ||
        (statusFilter === 'active' && order.status !== 'completed');

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Accounting analytics metrics
  const totalRevenue = useMemo(
    () => orders.reduce((acc, curr) => acc + curr.totalAmount, 0),
    [orders]
  );
  const completedCount = useMemo(
    () => orders.filter(o => o.status === 'completed').length,
    [orders]
  );
  const totalIssues = useMemo(
    () => orders.reduce((acc, curr) => acc + (curr.issues?.length || 0), 0),
    [orders]
  );

  if (!isOpen) return null;

  const handleCopyDuplicate = (order: Order) => {
    const text = formatOrderDuplicateText(order);
    navigator.clipboard.writeText(text);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-stone-950 border border-stone-800 text-stone-100 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
                Order Archive & Accounting Ledger
              </h2>
              <p className="text-xs text-stone-400">
                Recall past requests for customer service, dispute verification, and accounting audits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportOrdersToCSV(orders)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors border border-stone-700"
              title="Download CSV file for spreadsheet accounting"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Accounting KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-stone-900/30 border-b border-stone-800 text-xs">
          <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
            <span className="text-stone-400">Total Bookings</span>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{orders.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
            <span className="text-stone-400">Total Revenue</span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
              ₦{totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
            <span className="text-stone-400">Completed Deliveries</span>
            <div className="text-lg font-bold font-mono text-teal-400 mt-0.5">{completedCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800">
            <span className="text-stone-400">Admin Records Phone</span>
            <div className="text-xs font-bold font-mono text-amber-400 mt-1 truncate">
              {DISPLAY_ADMIN_WHATSAPP}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-stone-800 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Coupon Code (e.g. ONI-8492), Ticket #, Customer Phone..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
            {['all', 'active', 'ready', 'completed', 'issues'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-900 text-stone-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Content list & Inspection split */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-xs">
              No matching order records found. Try adjusting your search query.
            </div>
          ) : (
            filteredOrders.map(order => {
              const isInspect = selectedInspectOrder?.id === order.id;
              const hasIssues = (order.issues?.length || 0) > 0;

              return (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isInspect
                      ? 'border-amber-400/80 bg-amber-500/5 ring-1 ring-amber-400/20'
                      : 'border-stone-800 bg-stone-900/50 hover:bg-stone-900'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-800/80 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-white">#{order.id}</span>
                      <span className="text-stone-500">·</span>
                      <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                        {order.couponCode}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                          order.ticketColor === 'green'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {order.ticketColor === 'green' ? '🟢 PAID IN FULL' : '⚠️ PAYMENT DUE'}
                      </span>
                      {hasIssues && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold">
                          Issue Reported
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-stone-400">
                      <span className="font-mono">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="capitalize font-semibold text-stone-200">
                        Status: <span className="text-amber-400">{order.status.replace(/_/g, ' ')}</span>
                      </span>
                    </div>
                  </div>

                  {/* Customer & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs">
                    <div>
                      <span className="text-stone-500 text-[11px] block">Customer</span>
                      <span className="text-stone-200 font-semibold">{order.customerName}</span>
                      <span className="text-stone-400 block font-mono text-[11px]">{order.customerPhone}</span>
                    </div>

                    <div>
                      <span className="text-stone-500 text-[11px] block">Delivery Location</span>
                      <span className="text-stone-300 line-clamp-1">{order.deliveryAddress}</span>
                      {order.landmark && <span className="text-stone-500 text-[11px] block truncate">{order.landmark}</span>}
                    </div>

                    <div>
                      <span className="text-stone-500 text-[11px] block">Order Value</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ₦{order.totalAmount.toLocaleString()}
                      </span>
                      <span className="text-stone-500 text-[11px] block">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items · {order.paymentMethod.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInspectOrder(isInspect ? null : order)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium"
                      >
                        {isInspect ? 'Hide Details' : 'View Duplicate File'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyDuplicate(order)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium"
                      >
                        {copiedOrderId === order.id ? 'Copied!' : 'Copy Summary'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketToPrint(order)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-medium flex items-center gap-1 border border-stone-700"
                        title="Print Official Ticket"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Ticket</span>
                      </button>
                      <a
                        href={getWhatsAppShareUrl(order)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-medium flex items-center gap-1 border border-emerald-500/20"
                        title="Send duplicate directly to administrative WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Record</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectOrderForTracking(order);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5 transition-transform active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Track / Manage Request</span>
                    </button>
                  </div>

                  {/* Expanded Duplicate File Viewer */}
                  {isInspect && (
                    <div className="mt-3 p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-300 whitespace-pre-wrap leading-relaxed">
                      {formatOrderDuplicateText(order)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Printable Ticket Modal - Admin Eatery Copy */}
      <PrintableTicketModal
        order={ticketToPrint}
        isOpen={!!ticketToPrint}
        onClose={() => setTicketToPrint(null)}
        viewMode="admin"
      />
    </div>
  );
};
