import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  ChefHat,
  Database,
  AlertTriangle,
  Settings,
  LogOut,
  Search,
  Download,
  Printer,
  Phone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Bike,
  Store,
  DollarSign,
  Check,
  Eye,
  Trash2,
} from 'lucide-react';
import { Order, OrderStatus, OrderIssue, AdminSettings } from '../types';
import { exportOrdersToCSV, getWhatsAppShareUrl, saveSettings } from '../utils/storage';
import { DISPLAY_ADMIN_WHATSAPP, OFFICIAL_ADMIN_WHATSAPP } from '../data/menu';
import { PrintableTicketModal } from './PrintableTicketModal';

interface AdminPortalProps {
  orders: Order[];
  complaints: OrderIssue[];
  settings: AdminSettings;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateOrder: (order: Order) => void;
  onUpdateComplaintStatus: (
    issueId: string,
    newStatus: 'open' | 'investigating' | 'resolved',
    notes?: string
  ) => void;
  onUpdateSettings: (newSettings: AdminSettings) => void;
  onTriggerCustomerCall: (order: Order) => void;
}

const ADMIN_STORAGE_AUTH_KEY = 'onitawas_admin_session_auth';
const DEFAULT_ADMIN_PIN = '1234';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  orders,
  complaints,
  settings,
  onUpdateOrderStatus,
  onUpdateOrder,
  onUpdateComplaintStatus,
  onUpdateSettings,
  onTriggerCustomerCall,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_STORAGE_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [activeAdminTab, setActiveAdminTab] = useState<
    'kitchen' | 'database' | 'complaints' | 'settings'
  >('kitchen');

  // Database Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  // Printable Ticket Modal State
  const [ticketToPrint, setTicketToPrint] = useState<Order | null>(null);

  // Settings form state
  const [bankName, setBankName] = useState(settings.bankAccount?.bankName || 'Palmpay');
  const [accountName, setAccountName] = useState(
    settings.bankAccount?.accountName || 'Muideen Akolade'
  );
  const [accountNumber, setAccountNumber] = useState(
    settings.bankAccount?.accountNumber || '8162128815'
  );
  const [adminPhone, setAdminPhone] = useState(
    settings.adminWhatsAppNumber || OFFICIAL_ADMIN_WHATSAPP
  );
  const [kitchenName, setKitchenName] = useState(settings.kitchenName || "Onitawa's Kitchen Hub");
  const [kitchenAddress, setKitchenAddress] = useState(
    settings.kitchenAddress || 'Plot 12 Commercial Avenue, Onitawa Hub, Lagos'
  );
  const [savedSettingsSuccess, setSavedSettingsSuccess] = useState(false);

  // Authentication Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === DEFAULT_ADMIN_PIN) {
      setIsAuthenticated(true);
      setAuthError('');
      try {
        sessionStorage.setItem(ADMIN_STORAGE_AUTH_KEY, 'true');
      } catch (err) {
        console.error('Session auth error:', err);
      }
    } else {
      setAuthError('Incorrect Admin PIN. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEnteredPin('');
    try {
      sessionStorage.removeItem(ADMIN_STORAGE_AUTH_KEY);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AdminSettings = {
      ...settings,
      adminWhatsAppNumber: adminPhone,
      kitchenName,
      kitchenAddress,
      bankAccount: {
        ...settings.bankAccount,
        bankName,
        accountName,
        accountNumber,
      },
    };
    onUpdateSettings(updated);
    saveSettings(updated);
    setSavedSettingsSuccess(true);
    setTimeout(() => setSavedSettingsSuccess(false), 2500);
  };

  // Filtered orders for Master Database
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      !searchQuery.trim() ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.couponCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment =
      paymentFilter === 'all' ||
      (paymentFilter === 'paid' && order.ticketColor === 'green') ||
      (paymentFilter === 'due' && order.ticketColor === 'yellow');

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate quick metrics for ledger
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const paidRevenue = orders
    .filter(o => o.ticketColor === 'green')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const dueRevenue = orders
    .filter(o => o.ticketColor === 'yellow')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const openComplaintsCount = complaints.filter(c => c.status !== 'resolved').length;

  // Unauthenticated Login View
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-stone-900 border border-stone-800 p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit',sans-serif]">
              Admin Operations Portal
            </h2>
            <p className="text-xs text-stone-400">
              Restricted management area for Onitawa kitchen ledger, live database records, and dispute resolution desk.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Enter Administrative Security PIN
              </label>
              <input
                type="password"
                required
                maxLength={8}
                value={enteredPin}
                onChange={e => {
                  setEnteredPin(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-700 text-white text-center text-lg font-mono tracking-widest focus:outline-none focus:border-amber-400 transition-colors"
                autoFocus
              />
              {authError && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Login</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Portal Suite
  return (
    <div className="space-y-6">
      {/* Admin Top Header Banner */}
      <div className="rounded-3xl bg-stone-900 border border-stone-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
                Onitawa Admin Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                Authorized Session
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Kitchen operations, private customer ledger, disputes desk & bank details.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Page Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
        <button
          type="button"
          onClick={() => setActiveAdminTab('kitchen')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'kitchen'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Live Kitchen Queue</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-950/20 text-[10px] font-mono">
            {orders.filter(o => o.status !== 'completed').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('database')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'database'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Master Order Database</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-950/20 text-[10px] font-mono">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('complaints')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeAdminTab === 'complaints'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Disputes & Requests Desk</span>
          {openComplaintsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-bold font-mono">
              {openComplaintsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveAdminTab('settings')}
          className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeAdminTab === 'settings'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-stone-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Business & Bank Details</span>
        </button>
      </div>

      {/* TAB 1: LIVE KITCHEN QUEUE */}
      {activeAdminTab === 'kitchen' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>
              Kitchen Dispatch Queue: <strong className="text-white">{orders.length}</strong> total tickets recorded
            </span>
            <span className="text-amber-400 font-mono">Admin Line: {DISPLAY_ADMIN_WHATSAPP}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map(order => {
              const isGreen = order.ticketColor === 'green';
              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 shadow-lg ${
                    order.status === 'completed'
                      ? 'bg-stone-900/50 border-stone-800 opacity-80'
                      : 'bg-stone-900 border-stone-800'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-300 text-base">
                            #{order.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isGreen
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isGreen ? '🟢 PAID IN FULL' : '⚠️ PAYMENT DUE'}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 block mt-0.5">
                          Coupon: <strong className="font-mono text-amber-400">{order.couponCode}</strong>
                        </span>
                      </div>

                      <span className="text-[11px] text-stone-400 font-mono">
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Customer:</span>
                        <strong className="text-white">{order.customerName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Phone:</span>
                        <span className="font-mono text-amber-400">{order.customerPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Fulfillment:</span>
                        <span className="text-stone-200 capitalize">
                          {order.fulfillmentType === 'pickup'
                            ? '🏪 Counter Pickup'
                            : `🛵 Delivery (${order.deliveryAddress?.slice(0, 20) || 'Lekki'})`}
                        </span>
                      </div>
                    </div>

                    {/* Meal Items (Full view for Admin) */}
                    <div className="text-xs space-y-1">
                      <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                        Prepared Delicacies:
                      </span>
                      {order.isCustomPrompt ? (
                        <p className="italic text-amber-300 text-[11px] bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                          "{order.customPromptText}"
                        </p>
                      ) : (
                        order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-stone-300 text-xs">
                            <span>
                              {it.quantity}x {it.menuItem.name}
                            </span>
                            <span className="text-stone-500">
                              {it.selectedSpicy ? `[${it.selectedSpicy}]` : ''}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Operational Controls */}
                  <div className="space-y-2 pt-3 border-t border-stone-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-400">Status:</span>
                      <select
                        value={order.status}
                        onChange={e =>
                          onUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-700 text-amber-300 font-bold text-xs focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing (Cooking)</option>
                        <option value="ready">Ready (Alert Call)</option>
                        <option value="picked_up">Picked Up (Rider)</option>
                        <option value="in_transit">In Transit</option>
                        <option value="completed">Completed (Handover)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTicketToPrint(order)}
                        className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Print Onitawa Eatery Copy Ticket"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Print Ticket</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onTriggerCustomerCall(order)}
                        className="py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Trigger Automated 3-Min Phone Call"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Alert</span>
                      </button>

                      <a
                        href={getWhatsAppShareUrl(order)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex items-center justify-center transition-colors"
                        title="Send Duplicate to WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER ORDER DATABASE & LEDGER */}
      {activeAdminTab === 'database' && (
        <div className="space-y-4">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-stone-900 border border-stone-800 p-4">
              <span className="text-[11px] text-stone-400 font-semibold uppercase block">
                Total Orders Recorded
              </span>
              <strong className="text-2xl font-black text-white font-mono">{orders.length}</strong>
            </div>

            <div className="rounded-2xl bg-stone-900 border border-stone-800 p-4">
              <span className="text-[11px] text-stone-400 font-semibold uppercase block">
                Total Gross Volume
              </span>
              <strong className="text-2xl font-black text-amber-400 font-mono">
                ₦{totalRevenue.toLocaleString()}
              </strong>
            </div>

            <div className="rounded-2xl bg-stone-900 border border-stone-800 p-4">
              <span className="text-[11px] text-emerald-400 font-semibold uppercase block">
                Paid in Full (Bank Verified)
              </span>
              <strong className="text-2xl font-black text-emerald-400 font-mono">
                ₦{paidRevenue.toLocaleString()}
              </strong>
            </div>

            <div className="rounded-2xl bg-stone-900 border border-stone-800 p-4">
              <span className="text-[11px] text-amber-400 font-semibold uppercase block">
                Payment Due (Manual Collection)
              </span>
              <strong className="text-2xl font-black text-amber-300 font-mono">
                ₦{dueRevenue.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* Database Controls: Search, Filters, CSV Export */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-900 border border-stone-800">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by customer, phone, coupon..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs focus:outline-none"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid in Full</option>
                <option value="due">Payment Due</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => exportOrdersToCSV(orders)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Accounting Ledger (CSV)</span>
            </button>
          </div>

          {/* Database Table */}
          <div className="overflow-x-auto rounded-2xl border border-stone-800 bg-stone-900 shadow-xl">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Ticket / Coupon</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Fulfillment</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4 text-right">Total (NGN)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/80">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-white block">#{order.id}</span>
                      <span className="text-[11px] text-amber-400">{order.couponCode}</span>
                    </td>
                    <td className="py-3 px-4 text-stone-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-white block">{order.customerName}</strong>
                      <span className="font-mono text-stone-400 text-[11px]">
                        {order.customerPhone}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="block capitalize">
                        {order.fulfillmentType === 'pickup' ? 'Counter Pickup' : 'Delivery'}
                      </span>
                      {order.deliveryAddress && (
                        <span className="text-[10px] text-stone-500 block truncate max-w-xs">
                          {order.deliveryAddress}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.ticketColor === 'green'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {order.ticketColor === 'green' ? 'Paid in Full' : 'Payment Due'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      ₦{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[11px] font-semibold capitalize">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTicketToPrint(order)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 transition-colors"
                          title="Print Ticket"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={getWhatsAppShareUrl(order)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 transition-colors"
                          title="Send to WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DISPUTES & REQUESTS DESK */}
      {activeAdminTab === 'complaints' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>
              All customer complaints & special requests routed directly to Onitawa Admin Portal.
            </span>
            <span className="text-amber-400 font-semibold">
              Open Concerns: {openComplaintsCount}
            </span>
          </div>

          {complaints.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Customer Disputes Recorded</h3>
              <p className="text-xs text-stone-400">All customer deliveries are running smoothly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {complaints.map(complaint => {
                const isOpen = complaint.status === 'open';
                const isInvestigating = complaint.status === 'investigating';
                const isResolved = complaint.status === 'resolved';

                return (
                  <div
                    key={complaint.id}
                    className={`rounded-2xl border p-5 shadow-lg space-y-4 ${
                      isResolved
                        ? 'bg-stone-900/60 border-stone-800'
                        : isOpen
                        ? 'bg-stone-900 border-red-500/40'
                        : 'bg-stone-900 border-amber-500/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white text-sm">
                          {complaint.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isOpen
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : isInvestigating
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {complaint.status}
                        </span>
                        <span className="text-xs text-amber-400 font-semibold">
                          {complaint.title}
                        </span>
                      </div>

                      <span className="text-xs text-stone-400 font-mono">
                        {new Date(complaint.reportedAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Complaint Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                        <span className="text-stone-500 text-[11px] block">Customer:</span>
                        <strong className="text-white block">
                          {complaint.customerName || 'Valued Customer'}
                        </strong>
                        <span className="font-mono text-amber-400 text-[11px]">
                          {complaint.customerPhone || 'N/A'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                        <span className="text-stone-500 text-[11px] block">Ticket / Coupon:</span>
                        <span className="font-mono text-white block">
                          #{complaint.orderId || 'N/A'}
                        </span>
                        <span className="font-mono text-amber-400 text-[11px]">
                          Coupon: {complaint.couponCode || 'N/A'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-stone-950 border border-stone-800/80">
                        <span className="text-stone-500 text-[11px] block">Dispute Category:</span>
                        <span className="text-stone-200 capitalize font-medium">
                          {complaint.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Description of Issue */}
                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800 text-xs">
                      <span className="text-stone-400 font-semibold block mb-1">
                        Reported Details:
                      </span>
                      <p className="text-stone-200 leading-relaxed">{complaint.description}</p>
                    </div>

                    {complaint.resolutionNotes && (
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200">
                        <strong className="block mb-0.5">Admin Resolution Notes:</strong>
                        <span>{complaint.resolutionNotes}</span>
                      </div>
                    )}

                    {/* Status Management Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {complaint.status !== 'resolved' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateComplaintStatus(
                                  complaint.id,
                                  'investigating',
                                  'Kitchen is actively investigating with dispatch rider.'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
                            >
                              Mark Investigating
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onUpdateComplaintStatus(
                                  complaint.id,
                                  'resolved',
                                  'Resolved with customer directly.'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Mark Resolved</span>
                            </button>
                          </>
                        )}
                        {complaint.status === 'resolved' && (
                          <button
                            type="button"
                            onClick={() => onUpdateComplaintStatus(complaint.id, 'open')}
                            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
                          >
                            Re-open Complaint
                          </button>
                        )}
                      </div>

                      {complaint.customerPhone && (
                        <a
                          href={`https://wa.me/${complaint.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${complaint.customerName || 'Customer'}, this is Onitawa Catering regarding your request ticket #${complaint.orderId}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat Customer on WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BUSINESS SETTINGS & BANK DETAILS */}
      {activeAdminTab === 'settings' && (
        <div className="max-w-2xl rounded-2xl bg-stone-900 border border-stone-800 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit',sans-serif]">
              Administrative Configuration & Bank Account
            </h3>
            <p className="text-xs text-stone-400">
              Manage bank transfer checkout destination and notification WhatsApp numbers.
            </p>
          </div>

          {savedSettingsSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Settings and bank account details saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            {/* Bank details card */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Active Bank Account Details
              </span>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. Palmpay, OPay, GTBank"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  placeholder="e.g. Muideen Akolade"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  placeholder="e.g. 8162128815"
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Admin Phone */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Admin WhatsApp Record Destination Number
              </label>
              <input
                type="text"
                required
                value={adminPhone}
                onChange={e => setAdminPhone(e.target.value)}
                placeholder="+1 484 996 1808"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
              <span className="text-[11px] text-stone-500 mt-0.5 block">
                All order duplicates and customer complaints dispatch to this number.
              </span>
            </div>

            {/* Kitchen Name & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Kitchen Hub Name
                </label>
                <input
                  type="text"
                  value={kitchenName}
                  onChange={e => setKitchenName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Kitchen Hub Address
                </label>
                <input
                  type="text"
                  value={kitchenAddress}
                  onChange={e => setKitchenAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-stone-950 border border-stone-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Update Configuration</span>
            </button>
          </form>
        </div>
      )}

      {/* Printable Ticket Modal (Admin Eatery Copy) */}
      <PrintableTicketModal
        order={ticketToPrint}
        isOpen={!!ticketToPrint}
        onClose={() => setTicketToPrint(null)}
        viewMode="admin"
      />
    </div>
  );
};
