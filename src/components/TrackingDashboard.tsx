import React, { useState, useEffect } from 'react';
import {
  Bike,
  CheckCircle2,
  Clock,
  Phone,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Ticket,
  ChevronRight,
  MapPin,
  Sparkles,
  Play,
  RotateCcw,
  Printer,
} from 'lucide-react';
import { Order, CourierProvider, RiderDetails, OrderIssue } from '../types';
import { LiveMap } from './LiveMap';
import { CourierSelector } from './CourierSelector';
import { ReportIssueModal } from './ReportIssueModal';
import { PrintableTicketModal } from './PrintableTicketModal';
import { getWhatsAppShareUrl } from '../utils/storage';
import { DISPLAY_ADMIN_WHATSAPP } from '../data/menu';

interface TrackingDashboardProps {
  order: Order | null;
  onUpdateOrder: (updated: Order) => void;
  onOpenTracker: () => void;
  onOpenNewOrder: () => void;
}

export const TrackingDashboard: React.FC<TrackingDashboardProps> = ({
  order,
  onUpdateOrder,
  onOpenTracker,
  onOpenNewOrder,
}) => {
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isSimulatingRider, setIsSimulatingRider] = useState<boolean>(true);
  const [courierLoading, setCourierLoading] = useState<boolean>(false);

  // Live simulation of rider movement along the path
  useEffect(() => {
    if (!order || !order.rider || order.status === 'completed') return;

    if (!isSimulatingRider) return;

    const interval = window.setInterval(() => {
      onUpdateOrder({
        ...order,
        riderProgressPercent: Math.min(100, (order.riderProgressPercent || 15) + 3),
        status:
          (order.riderProgressPercent || 15) + 3 >= 100
            ? 'arrived'
            : (order.riderProgressPercent || 15) + 3 >= 50
            ? 'in_transit'
            : 'rider_at_eatery',
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [order, isSimulatingRider]);

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 text-stone-500 flex items-center justify-center mx-auto">
          <Ticket className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-bold text-white">No Active Order Selected</h3>
        <p className="text-xs text-stone-400 max-w-sm mx-auto">
          Place a fresh catering request or recall an existing ticket from your records to track delivery in real time.
        </p>
        <button
          type="button"
          onClick={onOpenNewOrder}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <span>Order Fresh Food</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const handleCourierBooked = (courier: CourierProvider, rider: RiderDetails) => {
    setCourierLoading(true);
    setTimeout(() => {
      onUpdateOrder({
        ...order,
        selectedCourier: courier,
        rider,
        status: 'rider_assigned',
        riderProgressPercent: 15,
      });
      setCourierLoading(false);
    }, 600);
  };

  const handleReceivedOrder = () => {
    onUpdateOrder({
      ...order,
      status: 'completed',
      riderProgressPercent: 100,
      receivedAt: new Date().toISOString(),
    });
  };

  const handleReportIssue = (orderId: string, issue: OrderIssue) => {
    const existingIssues = order.issues || [];
    onUpdateOrder({
      ...order,
      status: 'issue_reported',
      issues: [issue, ...existingIssues],
    });
  };

  const isCompleted = order.status === 'completed';
  const isReady = order.status === 'ready';
  const hasCourier = !!order.rider;
  const progress = order.riderProgressPercent || (isCompleted ? 100 : isReady ? 20 : 5);

  return (
    <div className="space-y-6">
      {/* Active Order Summary Header */}
      <div className="rounded-3xl astro-glass astro-ticket-notch p-6 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-white/10">
        <div className="pl-2 space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-lg font-black text-white">Ticket #{order.id}</span>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 font-extrabold tracking-wider astro-glow-amber">
              COUPON: {order.couponCode}
            </span>

            {/* Payment Status Badge */}
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                order.ticketColor === 'green'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
              }`}
            >
              {order.ticketColor === 'green'
                ? '🟢 PAID IN FULL'
                : '⚠️ PAYMENT DUE (MANUAL PAY)'}
            </span>
          </div>

          <div className="text-xs text-stone-400 flex flex-wrap items-center gap-2">
            <span>Customer: <strong className="text-stone-200">{order.customerName}</strong></span>
            <span>·</span>
            <span className="font-mono text-stone-300">📞 {order.customerPhone}</span>
            <span>·</span>
            <span>
              {order.fulfillmentType === 'pickup'
                ? '🏪 Direct Counter Pickup'
                : `📍 ${order.deliveryAddress || 'Address Provided'}`}
            </span>
            {order.bankPaymentReference && (
              <>
                <span>·</span>
                <span className="font-mono text-emerald-400">Ref: {order.bankPaymentReference}</span>
              </>
            )}
          </div>
        </div>

        {/* Action badges & Printable Ticket */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Coupon Ticket</span>
          </button>

          <a
            href={getWhatsAppShareUrl(order)}
            target="_blank"
            rel="noreferrer"
            className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            title={`Send duplicate file to Admin WhatsApp (${DISPLAY_ADMIN_WHATSAPP})`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Admin WhatsApp File</span>
          </a>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="flex-1 lg:flex-none px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-950/60 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>

      {/* Progress Stepper Bar */}
      <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider">
            Live Order Status: <span className="text-amber-400">{order.status.replace(/_/g, ' ')}</span>
          </span>
          <span className="font-mono text-stone-400 font-medium">{progress}% Complete</span>
        </div>

        {/* Progress line */}
        <div className="w-full h-2 rounded-full bg-stone-950 overflow-hidden border border-stone-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timeline checkpoints */}
        <div className="grid grid-cols-4 gap-2 text-[11px] text-center">
          <div className={order.status !== 'pending' ? 'text-amber-400 font-bold' : 'text-stone-300'}>
            1. Order Filed
          </div>
          <div
            className={
              order.status === 'ready' || hasCourier || isCompleted
                ? 'text-amber-400 font-bold'
                : 'text-stone-500'
            }
          >
            2. Food Ready
          </div>
          <div className={hasCourier ? 'text-emerald-400 font-bold' : 'text-stone-500'}>
            3. Courier En Route
          </div>
          <div className={isCompleted ? 'text-teal-400 font-bold' : 'text-stone-500'}>
            4. Food Received
          </div>
        </div>
      </div>

      {/* COMPLETED CELEBRATION BANNER */}
      {isCompleted && (
        <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-teal-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Order Completed & Received!</div>
              <p className="text-teal-300/80 text-[11px]">
                Food package was confirmed received by customer. Administrative record closed.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-teal-400 bg-teal-950/80 px-3 py-1.5 rounded-lg border border-teal-500/20">
            {order.receivedAt ? new Date(order.receivedAt).toLocaleTimeString() : 'Verified'}
          </span>
        </div>
      )}

      {/* COURIER DISPATCH BOOKING (User-Initiated) */}
      {!hasCourier && !isCompleted && (
        <div>
          {isReady ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">Your Food is Hot & Ready!</div>
                  <p className="text-emerald-300/80 text-[11px] mt-0.5">
                    Your phone received the automated online call. Present coupon{' '}
                    <strong className="text-amber-300 font-mono">{order.couponCode}</strong> or dispatch a rider below.
                  </p>
                </div>
              </div>

              <CourierSelector
                couponCode={order.couponCode}
                onCourierSelected={handleCourierBooked}
                isLoading={courierLoading}
              />
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-stone-800 bg-stone-900/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-white">Kitchen is Preparing Your Delicacy</h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Onitawa’s chefs are freshly cooking your order. When the kitchen marks “Ready”, an automated 3-minute online phone call rings on{' '}
                <span className="font-mono text-amber-300 font-semibold">{order.customerPhone}</span>.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onOpenTracker}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  View All Orders on Live Request Board
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE MAP & DISPATCH TELEMETRY (When courier assigned or in progress) */}
      {hasCourier && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Outfit',sans-serif] flex items-center gap-2">
              <Bike className="w-5 h-5 text-amber-400" />
              <span>Real-Time Courier Live Map Tracking</span>
            </h3>

            {/* Simulation Play/Pause Controls */}
            {!isCompleted && (
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsSimulatingRider(prev => !prev)}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 hover:text-white flex items-center gap-1"
                >
                  <Play className={`w-3 h-3 ${isSimulatingRider ? 'text-emerald-400' : 'text-stone-500'}`} />
                  <span>{isSimulatingRider ? 'Live GPS Active' : 'Paused'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Map Display */}
          <LiveMap
            progressPercent={progress}
            kitchenName="Onitawa's Catering Hub"
            destinationAddress={order.deliveryAddress || 'Onitawa Kitchen Counter Pickup'}
            rider={order.rider || null}
            status={order.status}
          />

          {/* Assigned Rider Card & Customer Confirmation */}
          <div className="p-4 sm:p-5 rounded-2xl border border-stone-800 bg-stone-900/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
                🏍️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{order.rider?.name}</span>
                  <span className="text-xs text-amber-300">★ {order.rider?.rating}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                    {order.rider?.courierName}
                  </span>
                </div>
                <div className="text-xs text-stone-400 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Bike: <strong className="text-stone-300">{order.rider?.bikeModel}</strong></span>
                  <span>·</span>
                  <span className="font-mono text-amber-400">Plate: {order.rider?.plateNumber}</span>
                  <span>·</span>
                  <a
                    href={`tel:${order.rider?.phone}`}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> {order.rider?.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* THE PRIMARY "RECEIVED" BUTTON */}
            {!isCompleted ? (
              <button
                type="button"
                onClick={handleReceivedOrder}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Tap "Received" — Mark Order Completed</span>
              </button>
            ) : (
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Delivery Handover Verified</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reported Issues Section */}
      {(order.issues?.length || 0) > 0 && (
        <div className="p-4 rounded-2xl bg-stone-900 border border-red-900/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Active Issues / Complaints on Ticket #{order.id}</span>
          </div>
          {order.issues!.map(iss => (
            <div
              key={iss.id}
              className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 space-y-1"
            >
              <div className="flex items-center justify-between font-semibold text-white">
                <span>{iss.title}</span>
                <span className="text-[10px] text-amber-400 uppercase font-mono">{iss.status}</span>
              </div>
              <p className="text-stone-400">{iss.description}</p>
              <span className="text-[10px] text-stone-500 block">
                Reported: {new Date(iss.reportedAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      <ReportIssueModal
        order={order}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIssue={handleReportIssue}
      />

      {/* Printable Ticket Modal (Customer View) */}
      <PrintableTicketModal
        order={order}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        viewMode="customer"
      />
    </div>
  );
};
