import React, { useState, useEffect } from 'react';
import {
  Clock,
  Shield,
  Search,
  CheckCircle2,
  Bike,
  Store,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface PublicRequestTrackerProps {
  orders: Order[];
  onOpenReportModal: (order: Order) => void;
  onViewPrivateTicket: (order: Order) => void;
  onNavigateToMenu: () => void;
}

export const PublicRequestTracker: React.FC<PublicRequestTrackerProps> = ({
  orders,
  onOpenReportModal,
  onViewPrivateTicket,
  onNavigateToMenu,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Real-time ticker to auto-expire completed orders after 10 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  /**
   * 10-Minute Expiration Rule:
   * Orders expire from public user section 10 mins after being completed.
   */
  const getMinutesSinceCompletion = (order: Order): number => {
    if (order.status !== 'completed') return 0;
    const completionTime = new Date(
      order.receivedAt || order.readyAt || order.createdAt
    ).getTime();
    return (now - completionTime) / (1000 * 60);
  };

  // Filter public orders based on 10-minute expiration rule
  const publicOrders = orders.filter(order => {
    if (order.status === 'completed') {
      const minutesElapsed = getMinutesSinceCompletion(order);
      // Expire 10 minutes after completion
      if (minutesElapsed > 10) {
        return false;
      }
    }
    return true;
  });

  // Sort by date and time (newest first)
  const sortedOrders = [...publicOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Apply search query filter
  const filteredOrders = sortedOrders.filter(order => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    return (
      order.couponCode.toLowerCase().includes(query) ||
      order.id.toLowerCase().includes(query)
    );
  });

  // Map order status to user request progress:
  // Pending -> Preparing -> Delivery -> Completed
  const getProgressStage = (
    status: OrderStatus
  ): { step: number; label: string; description: string } => {
    switch (status) {
      case 'pending':
        return {
          step: 1,
          label: 'Order Pending',
          description: 'Request received and queued for Onitawa kitchen.',
        };
      case 'preparing':
        return {
          step: 2,
          label: 'Kitchen Cooking',
          description: 'Authentic delicacies currently on the stove.',
        };
      case 'ready':
      case 'rider_assigned':
      case 'rider_at_eatery':
      case 'picked_up':
      case 'in_transit':
      case 'arrived':
        return {
          step: 3,
          label: 'Out for Delivery / Counter Ready',
          description: 'Dispatched with courier or awaiting counter pickup.',
        };
      case 'completed':
        return {
          step: 4,
          label: 'Completed & Handed Over',
          description: 'Successfully received by customer.',
        };
      case 'issue_reported':
        return {
          step: 2,
          label: 'In Review Desk',
          description: 'Admin portal actively managing customer update.',
        };
      default:
        return {
          step: 1,
          label: 'Pending',
          description: 'Queued.',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Live Queue & Dispatch Board</span>
            </span>
            <span className="text-stone-400 font-mono text-[11px]">
              Auto-refreshes · 10-Min Post-Completion Expiration
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit',sans-serif] tracking-tight">
            Track Customer Requests & Live Orders
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Monitor real-time progress from <strong className="text-amber-400">Pending</strong> to{' '}
            <strong className="text-amber-400">Delivery</strong> to{' '}
            <strong className="text-emerald-400">Completed</strong>. Requests are ordered chronologically by time and date, and automatically expire from this public board 10 minutes after successful completion.
          </p>

          {/* PRIVACY GUARANTEE NOTICE */}
          <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-amber-500/20 text-xs text-stone-300 flex items-start gap-3 mt-4">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-amber-300 block font-bold mb-0.5">
                Customer Privacy Guarantee:
              </strong>
              <span>
                To protect customer privacy, meal contents, dish items, and private phone numbers are never displayed publicly. Only verified Coupon IDs, timestamps, fulfillment modes, and progression stages are visible.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Summary Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Coupon ID (e.g. ONI-8492) or Ticket #"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs placeholder:text-stone-500 font-mono uppercase focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 text-xs text-stone-400">
          <span className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Active on Board: <strong className="text-white">{filteredOrders.length}</strong></span>
          </span>
          <button
            type="button"
            onClick={onNavigateToMenu}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Order Delicacies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Orders List / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-3xl bg-stone-900/40 border border-stone-800/80 p-8">
          <Clock className="w-10 h-10 text-stone-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Active Requests Found</h3>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            {searchQuery
              ? `No requests matched "${searchQuery}". Check your coupon digits or view the entire queue.`
              : 'All recent orders have either completed and expired past the 10-minute window, or are currently being placed.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-stone-800 text-stone-200 text-xs font-semibold hover:bg-stone-700 transition-colors"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map(order => {
            const progress = getProgressStage(order.status);
            const isCompleted = order.status === 'completed';
            const minutesElapsed = getMinutesSinceCompletion(order);
            const remainingMins = Math.max(1, Math.ceil(10 - minutesElapsed));

            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-lg ${
                  isCompleted
                    ? 'bg-stone-900/60 border-emerald-900/40 hover:border-emerald-500/40'
                    : 'bg-stone-900/90 border-stone-800 hover:border-stone-700'
                }`}
              >
                {/* Top Row: Coupon ID & Date/Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/80">
                  <div className="flex items-center gap-3">
                    {/* Official Coupon Badge */}
                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40">
                      <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                        COUPON ID:
                      </span>
                      <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                        {order.couponCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon(order.couponCode)}
                        className="p-1 rounded text-amber-400 hover:text-white transition-colors"
                        title="Copy Coupon ID"
                      >
                        {copiedCoupon === order.couponCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className="text-xs text-stone-400 font-mono">
                      Ticket #{order.id}
                    </span>
                  </div>

                  {/* Submission Time & Date */}
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      <span>{formattedDate} at {formattedTime}</span>
                    </span>

                    {/* Expiration Counter for Completed Orders */}
                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 text-[11px] font-semibold">
                        Expires in {remainingMins}m
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Tracker: Pending -> Preparing -> Delivery -> Completed */}
                <div className="py-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Status Progression:</span>
                      <strong className="text-amber-400">{progress.label}</strong>
                    </span>
                    <span className="text-[11px] text-stone-400 hidden sm:inline">
                      {progress.description}
                    </span>
                  </div>

                  {/* 4-Step Visual Stepper */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    {/* Step 1: Pending */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full transition-colors ${
                          progress.step >= 1 ? 'bg-amber-400' : 'bg-stone-800'
                        }`}
                      />
                      <span
                        className={`font-semibold block ${
                          progress.step === 1 ? 'text-amber-400' : 'text-stone-400'
                        }`}
                      >
                        1. Pending
                      </span>
                    </div>

                    {/* Step 2: Kitchen */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full transition-colors ${
                          progress.step >= 2 ? 'bg-amber-400' : 'bg-stone-800'
                        }`}
                      />
                      <span
                        className={`font-semibold block ${
                          progress.step === 2 ? 'text-amber-400' : 'text-stone-400'
                        }`}
                      >
                        2. Kitchen
                      </span>
                    </div>

                    {/* Step 3: Delivery */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full transition-colors ${
                          progress.step >= 3 ? 'bg-amber-400' : 'bg-stone-800'
                        }`}
                      />
                      <span
                        className={`font-semibold block ${
                          progress.step === 3 ? 'text-amber-400' : 'text-stone-400'
                        }`}
                      >
                        3. Delivery
                      </span>
                    </div>

                    {/* Step 4: Completed */}
                    <div className="space-y-1.5">
                      <div
                        className={`h-2 rounded-full transition-colors ${
                          progress.step >= 4 ? 'bg-emerald-400' : 'bg-stone-800'
                        }`}
                      />
                      <span
                        className={`font-semibold block ${
                          progress.step >= 4 ? 'text-emerald-400' : 'text-stone-400'
                        }`}
                      >
                        4. Completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Fulfillment & Privacy Shielded Content */}
                <div className="pt-4 border-t border-stone-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5">
                    {/* Fulfillment and Payment Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-stone-800 text-stone-200 flex items-center gap-1.5">
                        {order.fulfillmentType === 'pickup' ? (
                          <>
                            <Store className="w-3.5 h-3.5 text-amber-400" />
                            <span>Counter Pickup</span>
                          </>
                        ) : (
                          <>
                            <Bike className="w-3.5 h-3.5 text-amber-400" />
                            <span>Courier Doorstep Delivery</span>
                          </>
                        )}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded font-semibold ${
                          order.ticketColor === 'green'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {order.ticketColor === 'green' ? '🟢 Paid in Full' : '⚠️ Payment Due'}
                      </span>
                    </div>

                    {/* PRIVACY ENFORCEMENT: Content is explicitly hidden */}
                    <div className="flex items-center gap-2 text-stone-400 text-[11px]">
                      <Lock className="w-3 h-3 text-stone-500" />
                      <span>Meal contents:</span>
                      <strong className="text-stone-300 font-medium">
                        Hidden for Customer Privacy
                      </strong>
                      <span>·</span>
                      <span>
                        {order.isCustomPrompt
                          ? 'Special Chef Prompt Request'
                          : `${order.items.reduce((s, i) => s + i.quantity, 0)} items recorded`}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Customer */}
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => onViewPrivateTicket(order)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-700"
                      title="View your verified personal ticket and save as PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Customer Ticket</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenReportModal(order)}
                      className="px-3 py-2 rounded-xl bg-stone-800/60 hover:bg-stone-800 text-stone-400 hover:text-red-400 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Report an issue or delay with this request"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Report Issue</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
