import React, { useState, useEffect } from 'react';
import {
  Order,
  CartItem,
  MenuItem,
  OrderStatus,
  OrderIssue,
  AdminSettings,
} from './types';
import {
  getInitialOrders,
  saveOrders,
  getInitialComplaints,
  saveComplaints,
  loadSettings,
  saveSettings,
} from './utils/storage';
import { DISPLAY_ADMIN_WHATSAPP } from './data/menu';
import { Navbar, AppNavTab } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { PublicRequestTracker } from './components/PublicRequestTracker';
import { TrackingDashboard } from './components/TrackingDashboard';
import { AdminPortal } from './components/AdminPortal';
import { OrderDrawer } from './components/OrderDrawer';
import { IncomingCallModal } from './components/IncomingCallModal';
import { ReportIssueModal } from './components/ReportIssueModal';
import { PrintableTicketModal } from './components/PrintableTicketModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Lock, AlertTriangle, Activity, UtensilsCrossed } from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<Order[]>(getInitialOrders);
  const [complaints, setComplaints] = useState<OrderIssue[]>(getInitialComplaints);
  const [settings, setSettings] = useState<AdminSettings>(loadSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<AppNavTab>('menu');
  const [activeOrderId, setActiveOrderId] = useState<string>(() => {
    const initial = getInitialOrders();
    return initial[0]?.id || '';
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Standalone Complaint / Issue Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportTargetOrder, setReportTargetOrder] = useState<Order | null>(null);

  // Customer Printable Ticket Modal
  const [viewingCustomerTicket, setViewingCustomerTicket] = useState<Order | null>(null);

  // Incoming Call State (triggered when Eatery marks order as Ready)
  const [incomingCallOrder, setIncomingCallOrder] = useState<Order | null>(null);
  const [isIncomingCallOpen, setIsIncomingCallOpen] = useState<boolean>(false);

  // Save orders to localStorage on any change
  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  // Save complaints to localStorage on any change
  useEffect(() => {
    saveComplaints(complaints);
  }, [complaints]);

  const activeOrder = orders.find(o => o.id === activeOrderId) || orders[0] || null;

  // Cart operations
  const handleAddToCart = (menuItem: MenuItem, spicy?: string, swallow?: string) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item =>
          item.menuItem.id === menuItem.id &&
          item.selectedSpicy === spicy &&
          item.selectedSwallow === swallow
      );

      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }

      return [...prev, { menuItem, quantity: 1, selectedSpicy: spicy, selectedSwallow: swallow }];
    });
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCart(prev => {
      const next = [...prev];
      next[index].quantity = newQty;
      return next;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Order Placement
  const handleOrderPlaced = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setActiveOrderId(newOrder.id);
    // User sees their personal live tracking and receipt
    setActiveTab('tracking');
  };

  // Status Update from Kitchen or Delivery
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const updated: Order = {
            ...order,
            status: newStatus,
            readyAt: newStatus === 'ready' ? new Date().toISOString() : order.readyAt,
            receivedAt: newStatus === 'completed' ? new Date().toISOString() : order.receivedAt,
          };
          return updated;
        }
        return order;
      })
    );
  };

  const handleUpdateOrder = (updated: Order) => {
    setOrders(prev => prev.map(o => (o.id === updated.id ? updated : o)));
  };

  // Complaint Handling
  const handleSubmitComplaint = (orderId: string, issue: OrderIssue) => {
    setComplaints(prev => [issue, ...prev]);
    // Also attach to matching order if applicable
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const existing = order.issues || [];
          return {
            ...order,
            status: 'issue_reported',
            issues: [issue, ...existing],
          };
        }
        return order;
      })
    );
  };

  const handleUpdateComplaintStatus = (
    issueId: string,
    newStatus: 'open' | 'investigating' | 'resolved',
    notes?: string
  ) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === issueId) {
          return {
            ...c,
            status: newStatus,
            resolutionNotes: notes || c.resolutionNotes,
          };
        }
        return c;
      })
    );
  };

  // Settings update
  const handleUpdateSettings = (newSettings: AdminSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Trigger automated 3-minute online phone call
  const handleTriggerCustomerCall = (order: Order) => {
    setIncomingCallOrder(order);
    setIsIncomingCallOpen(true);
  };

  // Coupon lookup from Hero search
  const handleSearchCoupon = (query: string) => {
    const q = query.trim().toLowerCase();
    const found = orders.find(
      o => o.couponCode.toLowerCase().includes(q) || o.id.toLowerCase().includes(q)
    );
    if (found) {
      setActiveOrderId(found.id);
      setActiveTab('tracking');
    } else {
      // Direct to public live board where they can view the full list
      setActiveTab('tracker');
    }
  };

  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);

  // Active unexpired orders count for badge
  const activeOrdersCount = orders.filter(o => o.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        hasActiveOrder={!!activeOrder && activeOrder.status !== 'completed'}
        activeOrdersCount={activeOrdersCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-10 space-y-10">
        {/* TAB 1: DELICACIES MENU */}
        {activeTab === 'menu' && (
          <>
            <Hero
              onSearchCoupon={handleSearchCoupon}
              onOrderNow={() => {
                const menuEl = document.getElementById('menu-section');
                if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewLiveBoard={() => setActiveTab('tracker')}
            />
            <MenuSection onAddToCart={handleAddToCart} />
          </>
        )}

        {/* TAB 2: PUBLIC REQUEST TRACKER (Order status per time/date, food hidden for privacy, expires 10m post-completion) */}
        {activeTab === 'tracker' && (
          <PublicRequestTracker
            orders={orders}
            onOpenReportModal={order => {
              setReportTargetOrder(order);
              setIsReportModalOpen(true);
            }}
            onViewPrivateTicket={order => {
              setViewingCustomerTicket(order);
            }}
            onNavigateToMenu={() => setActiveTab('menu')}
          />
        )}

        {/* TAB 3: CUSTOMER ORDER DISPATCH & LIVE TRACKER */}
        {activeTab === 'tracking' && (
          <TrackingDashboard
            order={activeOrder}
            onUpdateOrder={handleUpdateOrder}
            onOpenTracker={() => setActiveTab('tracker')}
            onOpenNewOrder={() => {
              setActiveTab('menu');
              setIsCartOpen(true);
            }}
          />
        )}

        {/* TAB 4: ADMIN OPERATIONS SUB-PAGE (Requires login, master database, live kitchen queue, complaints desk) */}
        {activeTab === 'admin' && (
          <AdminPortal
            orders={orders}
            complaints={complaints}
            settings={settings}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateOrder={handleUpdateOrder}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
            onUpdateSettings={handleUpdateSettings}
            onTriggerCustomerCall={handleTriggerCustomerCall}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-950 py-8 px-4 sm:px-6 lg:px-8 text-stone-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <span className="font-bold text-white">Onitawa’s Catering Service & Eatery</span>
            <span className="hidden sm:inline text-stone-600">·</span>
            <span>
              Administrative Record Destination:{' '}
              <strong className="text-amber-400 font-mono">{DISPLAY_ADMIN_WHATSAPP}</strong>
            </span>
          </div>

          <div className="flex items-center gap-5 text-stone-400">
            <button
              type="button"
              onClick={() => setActiveTab('menu')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-stone-500" />
              <span>Menu</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tracker')}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Request Board</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setReportTargetOrder(null);
                setIsReportModalOpen(true);
              }}
              className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>File Complaint</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="text-stone-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
              title="Admin Portal & Database Access"
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Order Tray / Checkout Drawer */}
      <OrderDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* 3-Minute Online Voice Phone Call Modal */}
      <IncomingCallModal
        order={incomingCallOrder}
        isOpen={isIncomingCallOpen}
        onDismiss={() => {
          setIsIncomingCallOpen(false);
          setIncomingCallOrder(null);
        }}
        onNavigateToTracking={() => {
          if (incomingCallOrder) {
            setActiveOrderId(incomingCallOrder.id);
            setActiveTab('tracking');
          }
        }}
      />

      {/* Standalone Dispute & Complaint Modal */}
      <ReportIssueModal
        order={reportTargetOrder}
        orders={orders}
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportTargetOrder(null);
        }}
        onSubmitIssue={handleSubmitComplaint}
      />

      {/* Customer Printable Ticket Modal */}
      <PrintableTicketModal
        order={viewingCustomerTicket}
        isOpen={!!viewingCustomerTicket}
        onClose={() => setViewingCustomerTicket(null)}
        viewMode="customer"
      />

      {/* Mobile Sticky Bottom Navigation (Native App Feel) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        hasActiveOrder={!!activeOrder && activeOrder.status !== 'completed'}
      />
    </div>
  );
}
