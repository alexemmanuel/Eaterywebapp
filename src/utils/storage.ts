import { Order, AdminSettings, OrderIssue } from '../types';
import { DEFAULT_ADMIN_SETTINGS, MENU_ITEMS, OFFICIAL_ADMIN_WHATSAPP, DISPLAY_ADMIN_WHATSAPP } from '../data/menu';

const STORAGE_ORDERS_KEY = 'onitawas_orders_v2';
const STORAGE_SETTINGS_KEY = 'onitawas_settings_v2';
const STORAGE_COMPLAINTS_KEY = 'onitawas_complaints_v2';

export function getInitialComplaints(): OrderIssue[] {
  try {
    const raw = localStorage.getItem(STORAGE_COMPLAINTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.error('Failed to load complaints from storage:', err);
  }

  // Pre-seed initial sample complaints for immediate visibility in Admin Portal
  const seedComplaints: OrderIssue[] = [
    {
      id: 'ISS-4091',
      orderId: 'TK-8492',
      couponCode: 'ONI-8492-X',
      customerName: 'Chief Babatunde Alabi',
      customerPhone: '+234 802 319 4851',
      category: 'extreme_delay',
      title: 'Extreme Delivery Delay',
      description: 'Lekki Phase 1 traffic seems heavy, checking if dispatch rider has departed the eatery.',
      reportedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      status: 'investigating',
      resolutionNotes: 'Kitchen reached out to Gokada rider; delivery is approximately 5 mins away.',
    },
  ];

  try {
    localStorage.setItem(STORAGE_COMPLAINTS_KEY, JSON.stringify(seedComplaints));
  } catch (e) {
    console.error('Failed to seed complaints:', e);
  }
  return seedComplaints;
}

export function saveComplaints(complaints: OrderIssue[]): void {
  try {
    localStorage.setItem(STORAGE_COMPLAINTS_KEY, JSON.stringify(complaints));
  } catch (err) {
    console.error('Failed to save complaints:', err);
  }
}

export function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Automatically migrate from old placeholder Zenith account to Palmpay
      if (
        parsed.bankAccount?.accountNumber === '1018924091' ||
        parsed.bankAccount?.bankName?.includes('Zenith')
      ) {
        parsed.bankAccount = DEFAULT_ADMIN_SETTINGS.bankAccount;
        saveSettings({ ...DEFAULT_ADMIN_SETTINGS, ...parsed });
      }
      return { ...DEFAULT_ADMIN_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error('Failed to parse settings:', err);
  }
  return DEFAULT_ADMIN_SETTINGS;
}

export function saveSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function getInitialOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Order[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load orders from storage:', err);
  }

  // Pre-seed realistic orders for immediate demonstration of recall, accounting, and courier tracking
  const seedOrders: Order[] = [
    {
      id: 'TK-8492',
      couponCode: 'ONI-8492-X',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      customerName: 'Chief Babatunde Alabi',
      customerPhone: '+234 802 319 4851',
      fulfillmentType: 'delivery',
      deliveryAddress: '24 Victoria Arobieke Street, Lekki Phase 1, Lagos',
      landmark: 'Near Prince Ebeano Supermarket',
      deliveryNotes: 'Gate bell rings twice, extra paper napkins required.',
      deliveryBookingMode: 'eatery_books_assisted',
      assistedBookingFee: 500,
      items: [
        {
          menuItem: MENU_ITEMS[0], // Amala platter
          quantity: 2,
          selectedSpicy: 'Traditional Hot',
          selectedSwallow: 'Steaming Hot Amala',
        },
        {
          menuItem: MENU_ITEMS[2], // Sizzling peppered meats
          quantity: 1,
          selectedSpicy: 'Fiery Asun Heat 🔥🔥',
        },
      ],
      subtotal: 20500,
      deliveryFee: 1700, // 1200 + 500 assisted booking fee
      totalAmount: 22200,
      paymentMethod: 'pay_on_delivery',
      paymentStatus: 'manual_collection',
      ticketColor: 'yellow', // Manually paying customer
      status: 'ready',
      readyAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      whatsappAdminNumber: OFFICIAL_ADMIN_WHATSAPP,
    },
    {
      id: 'TK-8470',
      couponCode: 'ONI-8470-P',
      createdAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      customerName: 'Amina Bello',
      customerPhone: '+234 814 982 7361',
      fulfillmentType: 'pickup',
      deliveryNotes: 'Direct counter pickup at Onitawa kitchen.',
      items: [
        {
          menuItem: MENU_ITEMS[1], // Party Jollof & Fried Rice
          quantity: 3,
          selectedSpicy: 'Standard Party Spice',
        },
        {
          menuItem: MENU_ITEMS[7], // Zobo drink
          quantity: 3,
        },
      ],
      subtotal: 22800,
      deliveryFee: 0,
      totalAmount: 22800,
      paymentMethod: 'bank_transfer_online',
      paymentStatus: 'paid_verified',
      bankPaymentReference: 'REF-ONI-8470-921',
      ticketColor: 'green', // All payment complete
      status: 'completed',
      readyAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      receivedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
      whatsappAdminNumber: OFFICIAL_ADMIN_WHATSAPP,
    },
    {
      id: 'TK-8455',
      couponCode: 'ONI-8455-M',
      createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
      customerName: 'Engr. Daniel Okon',
      customerPhone: '+234 703 948 5712',
      fulfillmentType: 'delivery',
      deliveryAddress: '15 Ozumba Mbadiwe Avenue, Victoria Island, Lagos',
      landmark: 'Opposite Civic Centre',
      deliveryBookingMode: 'user_books',
      assistedBookingFee: 0,
      items: [
        {
          menuItem: MENU_ITEMS[3], // Grand catering party platter
          quantity: 1,
          selectedSpicy: 'Extra Spicy',
        },
      ],
      subtotal: 14500,
      deliveryFee: 1200,
      totalAmount: 15700,
      paymentMethod: 'bank_transfer_online',
      paymentStatus: 'paid_verified',
      bankPaymentReference: 'REF-ONI-8455-714',
      ticketColor: 'green', // All payment complete
      status: 'completed',
      readyAt: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
      receivedAt: new Date(Date.now() - 290 * 60 * 1000).toISOString(),
      whatsappAdminNumber: OFFICIAL_ADMIN_WHATSAPP,
    },
  ];

  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(seedOrders));
  } catch (e) {
    console.error('Failed to seed initial orders', e);
  }
  return seedOrders;
}

export function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to save orders to localStorage:', err);
  }
}

/**
 * Generate formatted text duplicate file of order details for WhatsApp & admin records
 */
export function formatOrderDuplicateText(order: Order): string {
  const dateFormatted = new Date(order.createdAt).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const paymentTag =
    order.ticketColor === 'green'
      ? '🟢 *PAID COMPLETE (BANK VERIFIED)*'
      : '🟡 *MANUAL COLLECTION (PAY ON CONFIRMATION)*';

  const fulfillmentDetails =
    order.fulfillmentType === 'pickup'
      ? `• Mode: DIRECT PICKUP AT ONITAWA COUNTER\n• Pickup Location: Plot 12 Commercial Avenue, Onitawa Hub`
      : `• Mode: COURIER DELIVERY TO DOORSTEP\n• Delivery Address: ${order.deliveryAddress || 'Address Provided'}\n${
          order.landmark ? `• Landmark: ${order.landmark}\n` : ''
        }• Dispatch Booking: ${
          order.deliveryBookingMode === 'eatery_books_assisted'
            ? 'Eatery Booked on behalf of Customer (+₦500 booking fee)'
            : 'Customer Self-Booking'
        }\n• Google Maps: https://maps.google.com/?q=${encodeURIComponent(
          order.deliveryAddress || ''
        )}`;

  const itemsList = order.isCustomPrompt
    ? `  • SPECIAL CUSTOM CHEF PROMPT REQUEST:\n    "${order.customPromptText}"`
    : order.items
        .map(
          (item, idx) =>
            `  ${idx + 1}. ${item.quantity}x ${item.menuItem.name} (₦${(
              item.menuItem.price * item.quantity
            ).toLocaleString()})\n     • Spice: ${item.selectedSpicy || 'Standard'}${
              item.selectedSwallow ? ` | Swallow: ${item.selectedSwallow}` : ''
            }`
        )
        .join('\n');

  return `🍲 *ONITAWA'S CATERING SERVICE - ADMINISTRATIVE RECORD*
━━━━━━━━━━━━━━━━━━━━
📌 *Ticket Number:* #${order.id}
🎫 *Coupon Code:* ${order.couponCode}
🏷️ *Payment Verification:* ${order.ticketColor === 'green' ? 'PAID IN FULL (BANK TRANSFER)' : 'PAYMENT DUE (MANUAL COLLECTION)'}
💳 *Payment Status:* ${paymentTag}
${order.bankPaymentReference ? `🔢 *Bank Payment Ref:* ${order.bankPaymentReference}\n` : ''}📅 *Date & Time:* ${dateFormatted}
🚦 *Order Status:* ${order.status.toUpperCase()}

👤 *SENDER & CUSTOMER CONTACT:*
• Name: ${order.customerName}
• Registered Phone: ${order.customerPhone}
${order.deliveryNotes ? `• Special Instructions: ${order.deliveryNotes}\n` : ''}
📍 *FULFILLMENT & LOCATION TRAIL:*
${fulfillmentDetails}

🥘 *ORDER SPECIFICATIONS / MENU ITEMS:*
${itemsList}

💰 *FINANCIAL ACCOUNTING SUMMARY:*
• Food Subtotal: ₦${order.subtotal.toLocaleString()}
• Delivery / Dispatch Fee: ₦${order.deliveryFee.toLocaleString()}
• *Total Payable:* ₦${order.totalAmount.toLocaleString()}
• Payment Method: ${order.paymentMethod.replace(/_/g, ' ').toUpperCase()}

🛵 *RIDER & DISPATCH TRAIL:*
${
  order.rider
    ? `• Assigned Rider: ${order.rider.name} (${order.rider.phone})\n• Courier: ${order.rider.courierName} [${order.rider.plateNumber}]`
    : order.fulfillmentType === 'pickup'
    ? '• Not Applicable (Customer Counter Pickup with Coupon)'
    : '• Awaiting Courier Dispatch Assignment'
}

━━━━━━━━━━━━━━━━━━━━
🔒 *Record Sent To:* Admin WhatsApp ${DISPLAY_ADMIN_WHATSAPP}
(Automated duplicate dispatch file generated for accounting and administrative tracking)`;
}

/**
 * Format special prompt request text for WhatsApp
 */
export function formatCustomPromptWhatsAppText(promptData: {
  customerName: string;
  customerPhone: string;
  promptText: string;
  couponCode: string;
  ticketId: string;
}): string {
  return `✨ *ONITAWA'S CATERING - SPECIAL CHEF PROMPT REQUEST*
━━━━━━━━━━━━━━━━━━━━
📌 *Ticket:* #${promptData.ticketId}
🎫 *Coupon Code:* ${promptData.couponCode}
👤 *Customer:* ${promptData.customerName}
📞 *Phone:* ${promptData.customerPhone}

📝 *CUSTOMER PROMPT / SPECIAL REQUEST:*
"${promptData.promptText}"

━━━━━━━━━━━━━━━━━━━━
Admin record routed to ${DISPLAY_ADMIN_WHATSAPP}. Please call or acknowledge request!`;
}

export function getCustomPromptWhatsAppUrl(promptData: {
  customerName: string;
  customerPhone: string;
  promptText: string;
  couponCode: string;
  ticketId: string;
}): string {
  const cleanPhone = OFFICIAL_ADMIN_WHATSAPP.replace(/[^0-9]/g, '');
  const text = encodeURIComponent(formatCustomPromptWhatsAppText(promptData));
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

/**
 * Generates direct WhatsApp URL to send the duplicate file to +1 484 996 1808
 */
export function getWhatsAppShareUrl(order: Order, customPhone?: string): string {
  const targetNumber = (customPhone || order.whatsappAdminNumber || OFFICIAL_ADMIN_WHATSAPP).replace(
    /[^0-9]/g,
    ''
  );
  const text = encodeURIComponent(formatOrderDuplicateText(order));
  return `https://wa.me/${targetNumber}?text=${text}`;
}

/**
 * Export orders as CSV format for accounting / audit
 */
export function exportOrdersToCSV(orders: Order[]): void {
  const headers = [
    'Ticket ID',
    'Coupon Code',
    'Ticket Color',
    'Payment Status',
    'Bank Payment Ref',
    'Fulfillment Mode',
    'Created At',
    'Customer Name',
    'Customer Phone',
    'Delivery Address',
    'Status',
    'Items Summary',
    'Subtotal (NGN)',
    'Delivery Fee (NGN)',
    'Total Amount (NGN)',
    'Payment Method',
    'Courier Partner',
    'Rider Name',
    'Admin WhatsApp',
  ];

  const rows = orders.map(order => [
    order.id,
    order.couponCode,
    order.ticketColor === 'green' ? 'PAID IN FULL' : 'PAYMENT DUE (MANUAL COLLECTION)',
    order.paymentStatus,
    order.bankPaymentReference || 'N/A',
    order.fulfillmentType === 'pickup' ? 'Counter Pickup' : 'Courier Delivery',
    new Date(order.createdAt).toISOString(),
    `"${(order.customerName || '').replace(/"/g, '""')}"`,
    `"${order.customerPhone}"`,
    `"${(order.deliveryAddress || (order.fulfillmentType === 'pickup' ? 'Counter Pickup' : '')).replace(/"/g, '""')}"`,
    order.status,
    order.isCustomPrompt
      ? `"${(order.customPromptText || '').replace(/"/g, '""')}"`
      : `"${order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join('; ')}"`,
    order.subtotal,
    order.deliveryFee,
    order.totalAmount,
    order.paymentMethod,
    order.selectedCourier?.name || 'N/A',
    order.rider?.name || 'N/A',
    order.whatsappAdminNumber,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `onitawas_accounting_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
