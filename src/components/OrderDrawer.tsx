import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  Ticket,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Sparkles,
  Printer,
  Building2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Bike,
  Store,
  FileDown,
} from 'lucide-react';
import { CartItem, Order } from '../types';
import {
  OFFICIAL_ADMIN_WHATSAPP,
  DISPLAY_ADMIN_WHATSAPP,
  COMPANY_BANK_ACCOUNT,
  EATERY_ASSISTED_BOOKING_FEE,
  STANDARD_DELIVERY_BASE_FEE,
} from '../data/menu';
import {
  getWhatsAppShareUrl,
  getCustomPromptWhatsAppUrl,
  loadSettings,
} from '../utils/storage';
import { PrintableTicketModal } from './PrintableTicketModal';

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onOrderPlaced: (order: Order) => void;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onOrderPlaced,
}) => {
  // Drawer Mode Tab: 'cart_checkout' | 'special_prompt'
  const [activeSubPage, setActiveSubPage] = useState<'cart_checkout' | 'special_prompt'>(
    'cart_checkout'
  );

  // Customer Contact
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+234 ');

  // Fulfillment Mode: 'pickup' | 'delivery'
  const [fulfillmentType, setFulfillmentType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [deliveryBookingMode, setDeliveryBookingMode] = useState<'user_books' | 'eatery_books_assisted'>(
    'user_books'
  );
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  // Payment Selection: 'bank_transfer_online' (Paid in Full) vs 'manual_collection' (Payment Due)
  const [paymentChoice, setPaymentChoice] = useState<'bank_transfer_online' | 'manual_collection'>(
    'bank_transfer_online'
  );

  // Special Prompt Request State
  const [promptText, setPromptText] = useState<string>('');

  // Bank Account from settings or company default
  const activeBankAccount = loadSettings().bankAccount || COMPANY_BANK_ACCOUNT;

  // Post-submission modal & Printable Ticket State
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [isVerifyingTransfer, setIsVerifyingTransfer] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Financial Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);

  let deliveryFee = 0;
  let assistedBookingFee = 0;
  if (fulfillmentType === 'delivery') {
    deliveryFee = STANDARD_DELIVERY_BASE_FEE;
    if (deliveryBookingMode === 'eatery_books_assisted') {
      assistedBookingFee = EATERY_ASSISTED_BOOKING_FEE;
      deliveryFee += assistedBookingFee;
    }
  }

  const totalAmount = subtotal + deliveryFee;

  if (!isOpen) return null;

  // Handle Standard Food Tray Checkout Submission
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim() || !customerPhone.trim()) return;

    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter your compulsory delivery location address.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];

    const ticketId = `TK-${randomSuffix}`;
    const couponCode = `ONI-${randomSuffix}-${randomChar}`;
    const bankPaymentReference = `REF-ONI-${randomSuffix}-${Math.floor(100 + Math.random() * 900)}`;

    const isGreen = paymentChoice === 'bank_transfer_online';

    const newOrder: Order = {
      id: ticketId,
      couponCode,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress.trim() : undefined,
      landmark: fulfillmentType === 'delivery' ? landmark.trim() : undefined,
      deliveryNotes: deliveryNotes.trim() || undefined,
      deliveryBookingMode: fulfillmentType === 'delivery' ? deliveryBookingMode : undefined,
      assistedBookingFee: fulfillmentType === 'delivery' ? assistedBookingFee : 0,
      items: [...cart],
      subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod: isGreen
        ? 'bank_transfer_online'
        : fulfillmentType === 'pickup'
        ? 'pay_on_pickup'
        : 'pay_on_delivery',
      paymentStatus: isGreen ? 'paid_verified' : 'manual_collection',
      ticketColor: isGreen ? 'green' : 'yellow',
      bankPaymentReference: isGreen ? bankPaymentReference : undefined,
      status: 'pending',
      whatsappAdminNumber: OFFICIAL_ADMIN_WHATSAPP,
    };

    setCreatedOrder(newOrder);
    setIsSubmitting(false);
  };

  // Handle Special Custom Prompt Submission
  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !promptText.trim()) return;

    if (fulfillmentType === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter your compulsory delivery address for your prompt order.');
      return;
    }

    setIsSubmitting(true);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)];
    const ticketId = `PRM-${randomSuffix}`;
    const couponCode = `PRM-${randomSuffix}-${randomChar}`;
    const bankPaymentReference = `REF-PRM-${randomSuffix}-${Math.floor(100 + Math.random() * 900)}`;

    const isGreen = paymentChoice === 'bank_transfer_online';

    const customOrder: Order = {
      id: ticketId,
      couponCode,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      fulfillmentType,
      deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress.trim() : undefined,
      landmark: fulfillmentType === 'delivery' ? landmark.trim() : undefined,
      deliveryNotes: deliveryNotes.trim() || undefined,
      deliveryBookingMode: fulfillmentType === 'delivery' ? deliveryBookingMode : undefined,
      assistedBookingFee: fulfillmentType === 'delivery' ? assistedBookingFee : 0,
      isCustomPrompt: true,
      customPromptText: promptText.trim(),
      items: [],
      subtotal: subtotal || 0,
      deliveryFee,
      totalAmount: totalAmount || (fulfillmentType === 'delivery' ? deliveryFee : 0),
      paymentMethod: isGreen
        ? 'bank_transfer_online'
        : fulfillmentType === 'pickup'
        ? 'pay_on_pickup'
        : 'pay_on_delivery',
      paymentStatus: isGreen ? 'paid_verified' : 'manual_collection',
      ticketColor: isGreen ? 'green' : 'yellow',
      bankPaymentReference: isGreen ? bankPaymentReference : undefined,
      status: 'pending',
      whatsappAdminNumber: OFFICIAL_ADMIN_WHATSAPP,
    };

    // Set order into state and open the full printable ticket modal first so user prints or saves PDF before sending WhatsApp
    setCreatedOrder(customOrder);
    setIsPrintModalOpen(true);
    setIsSubmitting(false);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(activeBankAccount.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleFastCheckTransfer = () => {
    setIsVerifyingTransfer(true);
    setTimeout(() => {
      setIsVerifyingTransfer(false);
      setIsPrintModalOpen(true);
    }, 900);
  };

  const handleCompleteOrderFlow = (andSendWhatsApp: boolean = false) => {
    if (!createdOrder) return;

    if (andSendWhatsApp) {
      const url = getWhatsAppShareUrl(createdOrder);
      window.open(url, '_blank');
    }

    onOrderPlaced(createdOrder);
    setCreatedOrder(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-lg h-full bg-stone-950 border-l border-stone-800 text-stone-100 flex flex-col shadow-2xl">
          {/* Drawer Top Header & Sub-page Switcher */}
          <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-900/70 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white font-['Outfit',sans-serif] flex items-center gap-2">
                  <span>Onitawa Order Tray</span>
                  {activeSubPage === 'cart_checkout' && (
                    <span className="text-xs font-mono font-normal text-amber-400">
                      ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-400">
                  Select fulfillment, seamless bank payment, or send custom chef prompts.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-page Navigation Tabs */}
            {!createdOrder && (
              <div className="flex items-center gap-2 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveSubPage('cart_checkout')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeSubPage === 'cart_checkout'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Dishes Tray ({cart.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubPage('special_prompt')}
                  className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    activeSubPage === 'special_prompt'
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Special Prompt Request</span>
                </button>
              </div>
            )}
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {createdOrder ? (
              /* Post-submission Screen with Official Ticket and Bank Fast-Check */
              <div className="py-4 space-y-5 text-center">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ring-4 ${
                    createdOrder.ticketColor === 'green'
                      ? 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/10'
                      : 'bg-amber-500/20 text-amber-400 ring-amber-500/10'
                  }`}
                >
                  {createdOrder.ticketColor === 'green' ? (
                    <CheckCircle2 className="w-9 h-9" />
                  ) : (
                    <AlertCircle className="w-9 h-9" />
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white font-['Outfit',sans-serif]">
                    Order Request Filed Successfully!
                  </h3>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                        createdOrder.ticketColor === 'green'
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      }`}
                    >
                      {createdOrder.ticketColor === 'green'
                        ? '🟢 PAID IN FULL (BANK VERIFIED)'
                        : '⚠️ PAYMENT DUE (MANUAL COLLECTION)'}
                    </span>
                  </div>
                </div>

                {/* Perforated Coupon Badge */}
                <div
                  className={`p-4 rounded-2xl astro-ticket-notch text-center border relative overflow-hidden ${
                    createdOrder.ticketColor === 'green'
                      ? 'bg-emerald-950/40 border-emerald-500/40'
                      : 'bg-amber-950/40 border-amber-500/40'
                  }`}
                >
                  <span className="text-[11px] font-bold tracking-widest uppercase text-stone-400">
                    Pairing Ticket Coupon Code
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-white tracking-widest my-1 text-amber-300">
                    {createdOrder.couponCode}
                  </div>
                  <div className="text-xs text-stone-300 flex items-center justify-center gap-2">
                    <span>Ticket #{createdOrder.id}</span>
                    <span>·</span>
                    <span className="capitalize">{createdOrder.fulfillmentType}</span>
                    {createdOrder.bankPaymentReference && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-emerald-400">
                          {createdOrder.bankPaymentReference}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Customer Ticket Highlight - Step 1 */}
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-left text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">
                        Step 1: Save Customer Ticket as PDF
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Generates your Customer Copy PDF with full sender trail & pairing coupon
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPrintModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Save as PDF</span>
                    </button>
                  </div>
                  <p className="text-stone-400 text-[11px] leading-relaxed pt-1 border-t border-stone-800">
                    Your official ticket will have <strong className="text-white uppercase">“Customer Copy”</strong> clearly stamped on it with{' '}
                    <strong
                      className={
                        createdOrder.ticketColor === 'green' ? 'text-emerald-400' : 'text-amber-400'
                      }
                    >
                      {createdOrder.ticketColor === 'green' ? 'PAID IN FULL (BANK TRANSFER)' : 'PAYMENT DUE (COLLECT ON DELIVERY)'}
                    </strong>
                    . Tapping Save as PDF downloads the receipt directly to your phone or computer.
                  </p>
                </div>

                {/* Action Buttons - Step 2 */}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleCompleteOrderFlow(true)}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Step 2: Send Duplicate File to WhatsApp ({DISPLAY_ADMIN_WHATSAPP})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCompleteOrderFlow(false)}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Proceed to Live Tracking Dashboard</span>
                  </button>
                </div>
              </div>
            ) : activeSubPage === 'special_prompt' ? (
              /* SPECIAL PROMPT REQUEST SUB-PAGE */
              <form onSubmit={handleCustomPromptSubmit} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                  ✨ <strong>Custom Chef Prompt / Special Catering Request:</strong>
                  <br />
                  Send your bespoke dish combination, dietary instructions, or party request. Admin receives it directly as a formatted text on WhatsApp (
                  <span className="font-mono text-amber-300 font-bold">{DISPLAY_ADMIN_WHATSAPP}</span>) with an official ticket.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. Babatunde Alabi"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Your Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+234 802 000 0000"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs font-mono placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Enter Your Special Food / Catering Prompt *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={promptText}
                    onChange={e => setPromptText(e.target.value)}
                    placeholder="e.g. Please prepare 4 packs of extra-soft Amala with strictly goat meat and dry fish in separate containers for an evening event, mild pepper..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 resize-none leading-relaxed"
                  />
                </div>

                {/* FULFILLMENT SELECTION: DIRECT PICKUP VS COMPULSORY DELIVERY LOCATION */}
                <div className="space-y-3 pt-2 border-t border-stone-800">
                  <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                    How will you receive your prompt order?
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('pickup')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        fulfillmentType === 'pickup'
                          ? 'border-amber-400 bg-amber-500/10 text-white font-bold ring-1 ring-amber-400/30'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Store className="w-4 h-4 mb-1 text-amber-400" />
                      <div>Picking Up Directly</div>
                      <span className="text-[10px] text-stone-400 block font-normal">
                        At Counter (₦0 fee)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFulfillmentType('delivery')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        fulfillmentType === 'delivery'
                          ? 'border-amber-400 bg-amber-500/10 text-white font-bold ring-1 ring-amber-400/30'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white'
                      }`}
                    >
                      <Bike className="w-4 h-4 mb-1 text-amber-400" />
                      <div>Doorstep Delivery</div>
                      <span className="text-[10px] text-stone-400 block font-normal">
                        Courier to address
                      </span>
                    </button>
                  </div>

                  {fulfillmentType === 'delivery' && (
                    <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/30 space-y-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-stone-200 mb-1">
                          Compulsory Delivery Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                          placeholder="Street name, building number, landmark"
                          className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <label className="flex items-start gap-2 p-2 rounded-lg bg-stone-950 border border-stone-800 cursor-pointer">
                          <input
                            type="radio"
                            name="promptBookingMode"
                            checked={deliveryBookingMode === 'user_books'}
                            onChange={() => setDeliveryBookingMode('user_books')}
                            className="mt-0.5 text-amber-500"
                          />
                          <div>
                            <span className="font-semibold text-white">I will book courier rider</span>
                            <span className="text-[10px] text-stone-400 block">Est: ₦1,200</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-2 p-2 rounded-lg bg-stone-950 border border-stone-800 cursor-pointer">
                          <input
                            type="radio"
                            name="promptBookingMode"
                            checked={deliveryBookingMode === 'eatery_books_assisted'}
                            onChange={() => setDeliveryBookingMode('eatery_books_assisted')}
                            className="mt-0.5 text-amber-500"
                          />
                          <div>
                            <span className="font-semibold text-white">Eatery books on my behalf</span>
                            <span className="text-[10px] text-amber-300 block">Includes +₦500 booking fee</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* PAYMENT OPTION: BANK TRANSFER (PAID IN FULL) VS MANUAL PAY (PAYMENT DUE) */}
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <h4 className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                    Payment Status & Mode
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        paymentChoice === 'bank_transfer_online'
                          ? 'border-emerald-500 bg-emerald-950/30 text-white font-bold ring-1 ring-emerald-500/30'
                          : 'border-stone-800 bg-stone-900 text-stone-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="promptPaymentChoice"
                        checked={paymentChoice === 'bank_transfer_online'}
                        onChange={() => setPaymentChoice('bank_transfer_online')}
                        className="sr-only"
                      />
                      <span className="text-emerald-400 font-bold block">🟢 Paid in Full</span>
                      <span className="text-[10px] text-stone-300">Paid Complete (Company Bank)</span>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        paymentChoice === 'manual_collection'
                          ? 'border-amber-500 bg-amber-950/30 text-white font-bold ring-1 ring-amber-500/30'
                          : 'border-stone-800 bg-stone-900 text-stone-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="promptPaymentChoice"
                        checked={paymentChoice === 'manual_collection'}
                        onChange={() => setPaymentChoice('manual_collection')}
                        className="sr-only"
                      />
                      <span className="text-amber-400 font-bold block">⚠️ Payment Due</span>
                      <span className="text-[10px] text-stone-300">Pay Cash/POS Handover</span>
                    </label>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-400">
                  📄 Clicking generate displays your official full printable ticket ({paymentChoice === 'bank_transfer_online' ? 'Paid in Full' : 'Payment Due'}) with complete customer trail and PDF save option, and prepares the admin WhatsApp duplicate dispatch.
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !promptText.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  <Ticket className="w-4 h-4" />
                  <span>
                    Generate {paymentChoice === 'bank_transfer_online' ? 'Paid in Full' : 'Payment Due'} Ticket & Review
                  </span>
                </button>
              </form>
            ) : (
              /* STANDARD FOOD TRAY CHECKOUT */
              <>
                {/* Itemized List */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Selected Dishes
                  </h3>
                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-stone-500 text-xs">
                      Your tray is currently empty. Explore Onitawa’s delicacies and add your
                      favorites!
                    </div>
                  ) : (
                    cart.map((item, index) => (
                      <div
                        key={`${item.menuItem.id}-${index}`}
                        className="p-3 rounded-xl bg-stone-900/70 border border-stone-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <img
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-white truncate">{item.menuItem.name}</div>
                          <div className="text-[11px] text-stone-400">
                            {item.selectedSpicy || 'Standard Spice'}
                            {item.selectedSwallow ? ` · ${item.selectedSwallow}` : ''}
                          </div>
                          <div className="font-mono text-amber-400 font-semibold mt-0.5">
                            ₦{(item.menuItem.price * item.quantity).toLocaleString()}
                          </div>
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-stone-950 rounded-lg p-1 border border-stone-800">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-mono font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center text-stone-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(index)}
                          className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <form id="order-form" onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
                    {/* Customer Contact */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        Customer (Sender) Details
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-stone-300 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            placeholder="e.g. Babatunde Alabi"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-stone-300">
                            Phone Number *
                          </label>
                          <span className="text-[10px] text-amber-400 font-medium">
                            Rings 3-min automated call when ready 📞
                          </span>
                        </div>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            placeholder="+234 802 000 0000"
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs font-mono placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* FULFILLMENT MODE: PICKUP VS DELIVERY */}
                    <div className="space-y-3 pt-2 border-t border-stone-800">
                      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        How will you receive your order?
                      </h3>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <button
                          type="button"
                          onClick={() => setFulfillmentType('pickup')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            fulfillmentType === 'pickup'
                              ? 'border-amber-400 bg-amber-500/10 text-white font-bold ring-1 ring-amber-400/30'
                              : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white'
                          }`}
                        >
                          <Store className="w-5 h-5 mb-1 text-amber-400" />
                          <div>Picking Up Directly</div>
                          <span className="text-[10px] text-stone-400 block font-normal">
                            At Onitawa Kitchen Counter (₦0 fee)
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFulfillmentType('delivery')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            fulfillmentType === 'delivery'
                              ? 'border-amber-400 bg-amber-500/10 text-white font-bold ring-1 ring-amber-400/30'
                              : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white'
                          }`}
                        >
                          <Bike className="w-5 h-5 mb-1 text-amber-400" />
                          <div>Doorstep Delivery</div>
                          <span className="text-[10px] text-stone-400 block font-normal">
                            Deliver to my address via courier
                          </span>
                        </button>
                      </div>

                      {/* If Delivery: Compulsory Location and Booking Method */}
                      {fulfillmentType === 'delivery' && (
                        <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-amber-500/30 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-stone-200 mb-1">
                              Compulsory Delivery Address *
                            </label>
                            <div className="relative">
                              <MapPin className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                required
                                value={deliveryAddress}
                                onChange={e => setDeliveryAddress(e.target.value)}
                                placeholder="Street name, building number, apartment/office"
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-300 mb-1">
                              Landmark / Area
                            </label>
                            <input
                              type="text"
                              value={landmark}
                              onChange={e => setLandmark(e.target.value)}
                              placeholder="e.g. Near Ebeano Supermarket / Lekki Phase 1"
                              className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          {/* Who books courier? */}
                          <div>
                            <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                              Courier Dispatch Booking Option:
                            </label>
                            <div className="space-y-2 text-xs">
                              <label className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                                <input
                                  type="radio"
                                  name="bookingParty"
                                  checked={deliveryBookingMode === 'user_books'}
                                  onChange={() => setDeliveryBookingMode('user_books')}
                                  className="mt-0.5 text-amber-500"
                                />
                                <div>
                                  <span className="font-semibold text-white block">
                                    I will book the courier rider myself
                                  </span>
                                  <span className="text-[11px] text-stone-400">
                                    Standard delivery estimate: ₦{STANDARD_DELIVERY_BASE_FEE.toLocaleString()}
                                  </span>
                                </div>
                              </label>

                              <label className="flex items-start gap-2.5 p-2 rounded-xl bg-stone-950 border border-stone-800 cursor-pointer">
                                <input
                                  type="radio"
                                  name="bookingParty"
                                  checked={deliveryBookingMode === 'eatery_books_assisted'}
                                  onChange={() => setDeliveryBookingMode('eatery_books_assisted')}
                                  className="mt-0.5 text-amber-500"
                                />
                                <div>
                                  <span className="font-semibold text-white block">
                                    Eatery books courier on my behalf
                                  </span>
                                  <span className="text-[11px] text-amber-300">
                                    Includes ₦{EATERY_ASSISTED_BOOKING_FEE} concierge dispatch booking fee (Total delivery: ₦{(STANDARD_DELIVERY_BASE_FEE + EATERY_ASSISTED_BOOKING_FEE).toLocaleString()})
                                  </span>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SEAMLESS COMPANY BANK PAYMENT & TICKET TYPE */}
                    <div className="space-y-3 pt-2 border-t border-stone-800">
                      <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                        Payment & Printable Ticket Type
                      </h3>

                      <div className="space-y-2.5">
                        {/* Option A: Bank Transfer (Green Ticket) */}
                        <label
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            paymentChoice === 'bank_transfer_online'
                              ? 'border-emerald-500/80 bg-emerald-950/20 ring-1 ring-emerald-500/30'
                              : 'border-stone-800 bg-stone-900/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentChoice === 'bank_transfer_online'}
                            onChange={() => setPaymentChoice('bank_transfer_online')}
                            className="mt-1 text-emerald-500"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-emerald-400" />
                                <span>Seamless Bank Transfer to Company Account</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                PAID IN FULL
                              </span>
                            </div>
                            <p className="text-stone-400 text-[11px] mt-1">
                              Transfers directly to Onitawa’s company bank account. Triggers instant fast check and generates official paid coupon ticket.
                            </p>

                            {/* Bank Details Snippet */}
                            {paymentChoice === 'bank_transfer_online' && (
                              <div className="mt-3 p-3 rounded-xl bg-stone-950 border border-emerald-900/50 space-y-1.5 font-mono text-[11px]">
                                <div className="text-stone-400 flex justify-between">
                                  <span>Bank:</span>
                                  <strong className="text-white">{activeBankAccount.bankName}</strong>
                                </div>
                                <div className="text-stone-400 flex justify-between">
                                  <span>Account Name:</span>
                                  <strong className="text-white truncate max-w-[200px]">
                                    {activeBankAccount.accountName}
                                  </strong>
                                </div>
                                <div className="text-stone-400 flex justify-between items-center">
                                  <span>Account No:</span>
                                  <div className="flex items-center gap-2">
                                    <strong className="text-amber-400 text-xs">
                                      {activeBankAccount.accountNumber}
                                    </strong>
                                    <button
                                      type="button"
                                      onClick={handleCopyAccount}
                                      className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                                      title="Copy Account Number"
                                    >
                                      {copiedAccount ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                <div className="text-stone-500 text-[10px] pt-1 border-t border-stone-800">
                                  Amount to Transfer: <strong>₦{totalAmount.toLocaleString()}</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        </label>

                        {/* Option B: Manual Payment after Confirmation (Payment Due) */}
                        <label
                          className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            paymentChoice === 'manual_collection'
                              ? 'border-amber-500/80 bg-amber-950/20 ring-1 ring-amber-500/30'
                              : 'border-stone-800 bg-stone-900/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentChoice === 'manual_collection'}
                            onChange={() => setPaymentChoice('manual_collection')}
                            className="mt-1 text-amber-500"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4 text-amber-400" />
                                <span>Pay After Confirmation (On Handover)</span>
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                PAYMENT DUE (MANUAL COLLECTION)
                              </span>
                            </div>
                            <p className="text-stone-400 text-[11px] mt-1">
                              Pay cash / POS upon receiving your meal. Kitchen and dispatch will record Payment Due for manual collection.
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Drawer Bottom Total & Action Button */}
          {!createdOrder && activeSubPage === 'cart_checkout' && cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-900/90 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span>Food Subtotal</span>
                  <span className="font-mono">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Fulfillment ({fulfillmentType === 'pickup' ? 'Counter Pickup' : 'Courier'})
                  </span>
                  <span className="font-mono">
                    {deliveryFee > 0 ? `₦${deliveryFee.toLocaleString()}` : 'FREE (₦0)'}
                  </span>
                </div>
                {assistedBookingFee > 0 && (
                  <div className="flex justify-between text-[11px] text-amber-400">
                    <span>Eatery Assisted Booking Concierge</span>
                    <span className="font-mono">+₦{assistedBookingFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-stone-800">
                  <span>Total Amount</span>
                  <span className="font-mono text-amber-400">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                form="order-form"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <Ticket className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Processing...'
                    : paymentChoice === 'bank_transfer_online'
                    ? 'Confirm Bank Transfer & View Paid Ticket'
                    : 'File Order & View Payment Due Ticket'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Printable Ticket Modal (Customer View) */}
      <PrintableTicketModal
        order={createdOrder}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        viewMode="customer"
      />
    </>
  );
};
