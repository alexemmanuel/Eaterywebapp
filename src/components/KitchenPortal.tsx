import React, { useState } from 'react';
import {
  ChefHat,
  PhoneCall,
  CheckCircle,
  Clock,
  Bike,
  AlertCircle,
  FileText,
  MessageSquare,
  Sparkles,
  Search,
  ExternalLink,
  Printer,
} from 'lucide-react';
import { Order } from '../types';
import { playKitchenChime } from '../utils/audio';
import { formatOrderDuplicateText, getWhatsAppShareUrl } from '../utils/storage';
import { DISPLAY_ADMIN_WHATSAPP } from '../data/menu';
import { PrintableTicketModal } from './PrintableTicketModal';

interface KitchenPortalProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: Order['status']) => void;
  onTriggerCustomerCall: (order: Order) => void;
  onOpenRecords: () => void;
}

export const KitchenPortal: React.FC<KitchenPortalProps> = ({
  orders,
  onUpdateOrderStatus,
  onTriggerCustomerCall,
  onOpenRecords,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready' | 'completed'>('all');
  const [search, setSearch] = useState<string>('');
  const [activeDuplicateOrderId, setActiveDuplicateOrderId] = useState<string | null>(null);
  const [ticketToPrint, setTicketToPrint] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'pending' && order.status === 'pending') ||
      (filter === 'preparing' && order.status === 'preparing') ||
      (filter === 'ready' && order.status === 'ready') ||
      (filter === 'completed' && order.status === 'completed');

    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      order.couponCode.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const handleMarkReady = (order: Order) => {
    playKitchenChime();
    onUpdateOrderStatus(order.id, 'ready');
    // Trigger automated 3-minute online phone call to customer
    onTriggerCustomerCall(order);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <span className="text-amber-400 font-semibold">New Ticket</span>;
      case 'preparing':
        return <span className="text-blue-400 font-semibold">In Kitchen (Cooking)</span>;
      case 'ready':
        return <span className="text-emerald-400 font-semibold">Hot & Ready (Called)</span>;
      case 'rider_assigned':
      case 'in_transit':
      case 'arrived':
        return <span className="text-purple-400 font-semibold">With Courier Rider</span>;
      case 'completed':
        return <span className="text-teal-400 font-semibold">Received & Completed</span>;
      default:
        return <span className="text-stone-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Kitchen Management Banner */}
      <div className="rounded-2xl border border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
                Onitawa’s Kitchen & Eatery Management
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                LIVE DISPATCH CONSOLE
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Tapping <span className="text-emerald-400 font-semibold">“Ready”</span> rings an automated 3-minute voice phone call to customer’s phone with their coupon ticket.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onOpenRecords}
            className="flex-1 md:flex-none px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 border border-stone-700 transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Accounting Ledger ({orders.length})</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-2xl border border-stone-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { id: 'all', label: `All Orders (${orders.length})` },
            { id: 'pending', label: 'New Tickets' },
            { id: 'preparing', label: 'Cooking' },
            { id: 'ready', label: 'Ready for Courier' },
            { id: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search ticket, coupon, phone..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400 font-mono"
          />
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-12 text-center text-stone-500 text-xs rounded-2xl border border-stone-800 bg-stone-950">
            No orders found under this category.
          </div>
        ) : (
          filteredOrders.map(order => {
            const hasIssues = (order.issues?.length || 0) > 0;
            const isReady = order.status === 'ready';

            return (
              <div
                key={order.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isReady
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : 'border-stone-800 bg-stone-900/40'
                }`}
              >
                <div>
                  {/* Order Ticket Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-white">#{order.id}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                        {order.couponCode}
                      </span>
                    </div>

                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Customer Information & Fulfillment / Payment Tag */}
                  <div className="my-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200">{order.customerName}</span>
                      <span className="font-mono text-amber-300 font-medium">{order.customerPhone}</span>
                    </div>

                    {/* Payment Status Indicator */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase ${
                          order.ticketColor === 'green'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {order.ticketColor === 'green'
                          ? '🟢 PAID IN FULL'
                          : '⚠️ PAYMENT DUE: MANUAL COLLECT'}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                        {order.fulfillmentType === 'pickup'
                          ? '🏪 Counter Pickup'
                          : `🛵 Courier Delivery${
                              order.deliveryBookingMode === 'eatery_books_assisted'
                                ? ' (Eatery Books)'
                                : ''
                            }`}
                      </span>
                    </div>

                    <div className="text-stone-400 text-[11px] line-clamp-1">
                      {order.fulfillmentType === 'pickup'
                        ? '📍 Direct pickup at Onitawa Kitchen Counter'
                        : `📍 ${order.deliveryAddress || 'Address Provided'}`}
                    </div>
                    {order.deliveryNotes && (
                      <div className="text-amber-200/90 text-[11px] italic bg-amber-500/5 p-1.5 rounded border border-amber-500/10">
                        Note: “{order.deliveryNotes}”
                      </div>
                    )}
                  </div>

                  {/* Food Items Ordered */}
                  <div className="my-3 p-3 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      Preparation Specs:
                    </span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between text-stone-300">
                        <div>
                          <span className="font-mono font-bold text-white">{item.quantity}x</span>{' '}
                          <span>{item.menuItem.name}</span>
                          <span className="text-[11px] text-stone-500 block">
                            • {item.selectedSpicy || 'Standard Spice'}
                            {item.selectedSwallow ? ` | ${item.selectedSwallow}` : ''}
                          </span>
                        </div>
                        <span className="font-mono text-stone-400 text-[11px]">
                          ₦{(item.menuItem.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Issues notification if any */}
                  {hasIssues && (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Customer Dispute Active</div>
                        <div className="text-[11px]">{order.issues![0].description}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kitchen Control Action Buttons */}
                <div className="pt-3 border-t border-stone-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-400">Total Bill</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ₦{order.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                        className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Start Cooking</span>
                      </button>
                    )}

                    {(order.status === 'pending' || order.status === 'preparing') && (
                      <button
                        type="button"
                        onClick={() => handleMarkReady(order)}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5 animate-bounce" />
                        <span>Mark Ready & Call Customer</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => onTriggerCustomerCall(order)}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Re-ring the automated 3-minute online phone call"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Re-ring Online Call</span>
                      </button>
                    )}

                    {/* Print Coupon Ticket Button (Green or Yellow) */}
                    <button
                      type="button"
                      onClick={() => setTicketToPrint(order)}
                      className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 transition-colors flex items-center justify-center cursor-pointer"
                      title="Print Official Coupon Ticket"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* WhatsApp Duplicate Dispatch Link to +1 484 996 1808 */}
                    <a
                      href={getWhatsAppShareUrl(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-stone-700 transition-colors flex items-center justify-center"
                      title={`Send duplicate file to Admin WhatsApp (${DISPLAY_ADMIN_WHATSAPP})`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
