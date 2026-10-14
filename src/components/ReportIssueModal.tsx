import React, { useState } from 'react';
import { AlertTriangle, X, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Order, OrderIssue } from '../types';
import { DISPLAY_ADMIN_WHATSAPP, OFFICIAL_ADMIN_WHATSAPP } from '../data/menu';

interface ReportIssueModalProps {
  order: Order | null;
  orders?: Order[];
  isOpen: boolean;
  onClose: () => void;
  onSubmitIssue: (orderId: string, issue: OrderIssue) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  order,
  orders = [],
  isOpen,
  onClose,
  onSubmitIssue,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(order?.id || '');
  const [manualCoupon, setManualCoupon] = useState<string>(order?.couponCode || '');
  const [customerName, setCustomerName] = useState<string>(order?.customerName || '');
  const [customerPhone, setCustomerPhone] = useState<string>(order?.customerPhone || '');
  const [category, setCategory] = useState<OrderIssue['category']>('missing_item');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Sync when prop order changes
  React.useEffect(() => {
    if (order) {
      setSelectedOrderId(order.id);
      setManualCoupon(order.couponCode);
      setCustomerName(order.customerName);
      setCustomerPhone(order.customerPhone);
    }
  }, [order]);

  if (!isOpen) return null;

  const currentOrder = order || orders.find(o => o.id === selectedOrderId || o.couponCode.toLowerCase() === manualCoupon.trim().toLowerCase());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    const targetOrderId = currentOrder ? currentOrder.id : (selectedOrderId || 'GENERAL');
    const targetCoupon = currentOrder ? currentOrder.couponCode : (manualCoupon || 'NONE');
    const targetCustName = currentOrder ? currentOrder.customerName : (customerName || 'Valued Customer');
    const targetCustPhone = currentOrder ? currentOrder.customerPhone : (customerPhone || 'Not provided');

    const newIssue: OrderIssue = {
      id: `ISS-${Math.floor(1000 + Math.random() * 9000)}`,
      orderId: targetOrderId,
      couponCode: targetCoupon,
      customerName: targetCustName,
      customerPhone: targetCustPhone,
      category,
      title: getCategoryLabel(category),
      description: description.trim(),
      reportedAt: new Date().toISOString(),
      status: 'open',
    };

    onSubmitIssue(targetOrderId, newIssue);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const getCategoryLabel = (cat: OrderIssue['category']): string => {
    switch (cat) {
      case 'missing_item':
        return 'Missing Food Item or Side';
      case 'food_damaged':
        return 'Food Spilled or Damaged in Transit';
      case 'extreme_delay':
        return 'Extreme Delivery Delay';
      case 'wrong_order':
        return 'Received Incorrect Order';
      case 'rider_issue':
        return 'Courier Rider Conduct Issue';
      default:
        return 'Other Order Complaint';
    }
  };

  const getWhatsAppReportUrl = (): string => {
    const targetOrderId = currentOrder ? currentOrder.id : (selectedOrderId || 'GENERAL');
    const targetCoupon = currentOrder ? currentOrder.couponCode : (manualCoupon || 'NONE');
    const targetCustName = currentOrder ? currentOrder.customerName : (customerName || 'Valued Customer');
    const targetCustPhone = currentOrder ? currentOrder.customerPhone : (customerPhone || 'Not provided');
    const targetAddress = currentOrder?.deliveryAddress || 'Address on file';

    const text = encodeURIComponent(
      `⚠️ *COMPLAINT / ISSUE REPORT - ONITAWA'S CATERING*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `• Ticket Number: #${targetOrderId}\n` +
        `• Coupon Code: ${targetCoupon}\n` +
        `• Customer Name: ${targetCustName}\n` +
        `• Customer Phone: ${targetCustPhone}\n` +
        `• Category: ${getCategoryLabel(category)}\n` +
        `• Details: ${description}\n` +
        `• Delivery Address: ${targetAddress}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Please expedite resolution for this customer request in Admin Portal.`
    );
    const cleanNumber = OFFICIAL_ADMIN_WHATSAPP.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-stone-950 border border-stone-800 text-stone-100 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit',sans-serif]">
                {currentOrder ? `Report an Issue with Order #${currentOrder.id}` : 'File a Request or Complaint'}
              </h3>
              <p className="text-xs text-stone-400">
                {currentOrder ? (
                  <>Coupon: <span className="text-amber-400 font-mono font-semibold">{currentOrder.couponCode}</span> · Onitawa Dispute Desk</>
                ) : (
                  'Direct dispatch to Onitawa Admin Portal & Manager Desk'
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Report Filed Successfully</h4>
            <p className="text-xs text-stone-300 max-w-sm mx-auto">
              Your issue ticket has been registered in the Eatery management portal. An administrative file has also been prepared for record-keeping.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={getWhatsAppReportUrl()}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send to Admin WhatsApp ({DISPLAY_ADMIN_WHATSAPP})</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setDescription('');
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {!order && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-stone-900/60 border border-stone-800/80">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Coupon Code / Ticket #
                  </label>
                  <input
                    type="text"
                    required
                    value={manualCoupon}
                    onChange={e => setManualCoupon(e.target.value)}
                    placeholder="e.g. ONI-8492-X"
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0816 212 8815"
                    className="w-full px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Issue Category
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as OrderIssue['category'])}
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="missing_item">Missing Food Item or Condiments</option>
                <option value="food_damaged">Food Spilled / Packaging Damaged</option>
                <option value="extreme_delay">Extreme Delivery Delay / Rider Inactive</option>
                <option value="wrong_order">Received Wrong Food Package</option>
                <option value="rider_issue">Rider Contact / Navigation Dispute</option>
                <option value="other">Other Customer Service Concern</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Describe What Happened
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="Provide specific details so our kitchen and courier dispatch manager can resolve immediately..."
                className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-white text-xs placeholder:text-stone-600 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {/* Notice regarding admin WhatsApp */}
            <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-[11px] text-stone-400">
              📌 Filing an issue immediately alerts Onitawa’s Kitchen Portal and queues an administrative escalation duplicate to WhatsApp <span className="text-amber-400 font-mono font-medium">{DISPLAY_ADMIN_WHATSAPP}</span>.
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-red-900/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Complaint</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
