import React, { useState, useEffect } from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Ticket,
  FileDown,
  Check,
  Building,
  User,
} from 'lucide-react';
import { Order } from '../types';
import { DISPLAY_ADMIN_WHATSAPP } from '../data/menu';
import { getWhatsAppShareUrl } from '../utils/storage';
import { exportOrderTicketAsPdf } from '../utils/pdfGenerator';

export interface PrintableTicketModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  viewMode?: 'customer' | 'admin';
}

export const PrintableTicketModal: React.FC<PrintableTicketModalProps> = ({
  order,
  isOpen,
  onClose,
  viewMode = 'customer',
}) => {
  const isAdmin = viewMode === 'admin';
  // Admin defaults to eatery copy, customer defaults to customer copy
  const [copyType, setCopyType] = useState<'customer' | 'eatery'>(
    isAdmin ? 'eatery' : 'customer'
  );
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<string | null>(null);

  // Sync copy type if viewMode changes
  useEffect(() => {
    setCopyType(isAdmin ? 'eatery' : 'customer');
  }, [isAdmin, isOpen]);

  if (!isOpen || !order) return null;

  const isGreenPaid = order.ticketColor === 'green';
  const isCustomerCopy = copyType === 'customer';

  // CUSTOMER ACTION: Tapping Print Button Generates & Saves PDF File directly
  const handleCustomerSavePdf = () => {
    try {
      exportOrderTicketAsPdf(order, 'customer');
      setDownloadSuccessNotice('Customer Copy PDF file saved to your device!');
      setTimeout(() => setDownloadSuccessNotice(null), 4000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  // ADMIN ACTION: Tapping Print Button Directly Prints Copies to Physical Printer
  const handleAdminDirectPrint = () => {
    window.print();
  };

  // Secondary download action for admin if they also want PDF copy
  const handleAdminDownloadPdf = () => {
    exportOrderTicketAsPdf(order, copyType);
    setDownloadSuccessNotice(
      `${copyType === 'eatery' ? "Onitawa's Copy" : 'Customer Copy'} PDF saved to device!`
    );
    setTimeout(() => setDownloadSuccessNotice(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-stone-950 border border-stone-800 text-stone-100 shadow-2xl overflow-hidden my-auto">
        {/* Modal Controls Bar */}
        <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 bg-stone-900/70 print:hidden">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {isAdmin ? 'Eatery Ticket Manager' : 'Official Coupon Ticket'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* If Customer View: Print Button generates & saves PDF file */}
            {!isAdmin ? (
              <button
                type="button"
                onClick={handleCustomerSavePdf}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                title="Save ticket as PDF file"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Save as PDF</span>
              </button>
            ) : (
              /* If Admin View: Print Button prints physical copies directly */
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAdminDirectPrint}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  title="Direct physical print"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket Copy</span>
                </button>

                <button
                  type="button"
                  onClick={handleAdminDownloadPdf}
                  className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center"
                  title="Export PDF backup"
                >
                  <FileDown className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* COPY SELECTOR (For Admin: can toggle between Onitawa's Copy and Customer Copy) */}
        {isAdmin && (
          <div className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-xs print:hidden">
            <span className="text-stone-400 text-[11px] font-medium">Select Copy Type to Print:</span>
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setCopyType('eatery')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copyType === 'eatery'
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Onitawa's Copy</span>
              </button>
              <button
                type="button"
                onClick={() => setCopyType('customer')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copyType === 'customer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Customer Copy</span>
              </button>
            </div>
          </div>
        )}

        {/* Download notification banner */}
        {downloadSuccessNotice && (
          <div className="px-4 py-2.5 bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{downloadSuccessNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadSuccessNotice(null)}
              className="text-stone-400 hover:text-white text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TICKET CONTAINER (Paid in Full vs Payment Due) */}
        <div
          id="printable-ticket-content"
          className={`p-6 sm:p-8 space-y-5 ${
            isGreenPaid
              ? 'bg-emerald-950/20 border-2 border-emerald-500/60'
              : 'bg-amber-950/20 border-2 border-amber-500/60'
          }`}
        >
          {/* PROMINENT COPY BANNER: CUSTOMER COPY vs ONITAWA'S COPY */}
          <div
            className={`py-2 px-4 rounded-xl text-center border font-black tracking-widest uppercase text-sm ${
              isCustomerCopy
                ? 'bg-stone-900 border-stone-700 text-emerald-400 shadow-sm'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
            }`}
          >
            {isCustomerCopy ? '★ CUSTOMER COPY ★' : "★ ONITAWA'S COPY (EATERY & KITCHEN LEDGER) ★"}
            <span className="block text-[10px] tracking-normal font-medium text-stone-400 mt-0.5 capitalize">
              {isCustomerCopy
                ? 'Personal receipt & meal collection token'
                : 'Cashier & kitchen dispatch record'}
            </span>
          </div>

          {/* Payment Status Header */}
          <div
            className={`p-3.5 rounded-2xl border text-center ${
              isGreenPaid
                ? 'bg-emerald-900/40 border-emerald-500/80 text-emerald-100'
                : 'bg-amber-900/40 border-amber-500/80 text-amber-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2 text-xs font-black tracking-wider uppercase mb-1">
              {isGreenPaid ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PAID IN FULL • PAYMENT COMPLETED & VERIFIED</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>PAYMENT DUE • MANUALLY PAYING CUSTOMER</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90">
              {isGreenPaid
                ? 'All bank transfer fees have been verified. Release food package without collecting money.'
                : 'Customer will pay manually upon handover. Collect cash/POS at pickup counter or doorstep.'}
            </p>
          </div>

          {/* Onitawa Brand Header */}
          <div className="flex items-start justify-between border-b border-stone-800 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
                Onitawa’s Catering Service
              </h2>
              <span className="text-[11px] text-stone-400 block mt-0.5">
                Plot 12 Commercial Avenue, Onitawa Hub • Lagos
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                Admin Line: {DISPLAY_ADMIN_WHATSAPP}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                Ticket Number
              </span>
              <span className="font-mono text-lg font-black text-white">#{order.id}</span>
            </div>
          </div>

          {/* Perforated Coupon Box with Explicit Copy Distinction */}
          <div
            className={`p-4 rounded-2xl astro-ticket-notch text-center border ${
              isGreenPaid
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
            }`}
          >
            <div className="text-[10px] uppercase tracking-widest font-extrabold opacity-80">
              PAIRING DISPATCH COUPON CODE •{' '}
              <span className="underline">
                {isCustomerCopy ? 'CUSTOMER COPY' : "ONITAWA'S COPY"}
              </span>
            </div>
            <div className="text-3xl font-mono font-black tracking-widest my-1 text-white">
              {order.couponCode}
            </div>
            <div className="text-[11px] opacity-80">
              {isCustomerCopy
                ? 'Present this coupon code at counter or courier rider to verify and release meal'
                : 'Confirm this coupon code matches customer before handing over package'}
            </div>
          </div>

          {/* Sender & Delivery Trail Details (Full User Info & Request) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-900/60 p-4 rounded-2xl border border-stone-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Customer (Sender) Full Info
              </span>
              <div className="font-bold text-white text-sm">{order.customerName}</div>
              <div className="font-mono text-stone-300">{order.customerPhone}</div>
              <div className="text-[10px] text-stone-500 mt-1">
                Registered Contact & Auto-Call Target
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                Fulfillment Mode & Delivery Trail
              </span>
              <div className="font-bold text-white capitalize">
                {order.fulfillmentType === 'pickup'
                  ? 'Counter Pickup (Direct Eatery Collection)'
                  : 'Courier Doorstep Delivery'}
              </div>
              {order.fulfillmentType === 'delivery' ? (
                <div className="text-[11px] text-stone-300 mt-1 space-y-0.5">
                  <div>
                    📍 <strong>Address:</strong> {order.deliveryAddress}
                  </div>
                  {order.landmark && (
                    <div>
                      🏷️ <strong>Landmark:</strong> {order.landmark}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[11px] text-stone-400 mt-0.5">
                  🏪 Onitawa Hub Counter, Plot 12 Commercial Avenue, Lagos
                </div>
              )}
            </div>

            {order.deliveryNotes && (
              <div className="col-span-full pt-2 border-t border-stone-800/80 text-[11px]">
                <span className="text-amber-400 font-bold">Special Customer Note / Instructions: </span>
                <span className="text-stone-300 italic">“{order.deliveryNotes}”</span>
              </div>
            )}

            {order.fulfillmentType === 'delivery' && (
              <div className="col-span-full pt-2 border-t border-stone-800/80 text-[11px]">
                <span className="text-stone-400">Courier Booking Dispatch Trail: </span>
                <span className="text-white font-medium">
                  {order.deliveryBookingMode === 'eatery_books_assisted'
                    ? 'Eatery Booked on-behalf of customer (+₦500 concierge fee)'
                    : 'Customer Self-Initiated Courier Rider'}
                </span>
                {order.rider && (
                  <div className="text-emerald-400 font-mono mt-0.5">
                    Assigned Rider: {order.rider.name} ({order.rider.phone}) • {order.rider.bikeModel} [
                    {order.rider.plateNumber}]
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order Specifications / Items */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
              Itemized Meal Order & Specifications
            </span>
            <div className="bg-stone-900/40 rounded-xl p-3 border border-stone-800/80 space-y-2">
              {order.isCustomPrompt ? (
                <div className="p-2.5 rounded bg-stone-950 text-amber-300 italic border border-amber-500/20">
                  <div className="text-[10px] text-amber-400 font-bold uppercase not-italic mb-1">
                    Special Custom Prompt Order:
                  </div>
                  “{order.customPromptText}”
                </div>
              ) : (
                order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-stone-200">
                    <div>
                      <span className="font-mono font-bold text-white">{it.quantity}x</span>{' '}
                      <span>{it.menuItem.name}</span>
                      <span className="text-[10px] text-stone-500 block">
                        • {it.selectedSpicy || 'Standard'}
                        {it.selectedSwallow ? ` | Swallow: ${it.selectedSwallow}` : ''}
                      </span>
                    </div>
                    <span className="font-mono text-stone-300">
                      ₦{(it.menuItem.price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Financial Ledger */}
          <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Food Subtotal</span>
              <span className="font-mono">₦{order.subtotal.toLocaleString()}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-stone-400">
                <span>
                  Delivery & Booking Fee
                  {order.assistedBookingFee ? ` (incl. ₦500 assisted fee)` : ''}
                </span>
                <span className="font-mono">₦{order.deliveryFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-bold text-white pt-2 border-t border-stone-800">
              <span>Total Payable</span>
              <span className="font-mono text-base text-amber-400">
                ₦{order.totalAmount.toLocaleString()}
              </span>
            </div>

            {order.bankPaymentReference && (
              <div className="mt-2 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                <span className="text-stone-400">Bank Reference Code:</span>
                <span className="font-mono font-bold text-amber-300">
                  {order.bankPaymentReference}
                </span>
              </div>
            )}
          </div>

          {/* Footer Receipt Notice */}
          <div className="pt-2 text-center text-[10px] text-stone-500 space-y-1">
            <div>Created: {new Date(order.createdAt).toLocaleString()}</div>
            <div>
              {isCustomerCopy
                ? "Customer Copy Receipt • Thank you for choosing Onitawa's!"
                : "Onitawa's Kitchen & Cashier Internal Record Ledger"}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions - Step-by-Step Flow: Print/Save PDF First, Then WhatsApp */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Customer: Save PDF Button */}
            {!isAdmin ? (
              <button
                type="button"
                onClick={handleCustomerSavePdf}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>1. Save Ticket (PDF File)</span>
              </button>
            ) : (
              /* Admin: Direct Print Button */
              <button
                type="button"
                onClick={handleAdminDirectPrint}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>1. Print Copies (Printer)</span>
              </button>
            )}

            <a
              href={getWhatsAppShareUrl(order)}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. WhatsApp Duplicate ({DISPLAY_ADMIN_WHATSAPP})</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
          >
            Close Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
