import jsPDF from 'jspdf';
import { Order } from '../types';
import { DISPLAY_ADMIN_WHATSAPP } from '../data/menu';

export const exportOrderTicketAsPdf = (order: Order, copyType: 'customer' | 'eatery' = 'customer'): void => {
  const isCustomerCopy = copyType === 'customer';
  const isGreen = order.ticketColor === 'green';

  // 80mm thermal receipt width by 250mm height, standard POS receipt format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 260],
  });

  const pageWidth = 80;
  let y = 12;

  // Background banner
  if (isGreen) {
    doc.setFillColor(5, 150, 105); // emerald
  } else {
    doc.setFillColor(217, 119, 6); // amber
  }
  doc.rect(4, y - 6, pageWidth - 8, 12, 'F');
  
  // Header Badge Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  const badgeTitle = isGreen ? 'PAID IN FULL' : 'PAYMENT DUE';
  doc.text(badgeTitle, pageWidth / 2, y + 1, { align: 'center' });

  y += 14;

  // COPY WATERMARK / TITLE: "CUSTOMER COPY" vs "ONITAWA'S COPY"
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  if (isCustomerCopy) {
    doc.setTextColor(15, 23, 42); // dark slate
    doc.text('*** CUSTOMER COPY ***', pageWidth / 2, y, { align: 'center' });
  } else {
    doc.setTextColor(180, 83, 9); // amber dark
    doc.text("*** ONITAWA'S COPY ***", pageWidth / 2, y, { align: 'center' });
  }

  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text("ONITAWA'S CATERING & EATERY", pageWidth / 2, y, { align: 'center' });

  y += 4.5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Plot 12 Commercial Ave, Lagos | ' + DISPLAY_ADMIN_WHATSAPP, pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, y, pageWidth - 6, y);
  doc.setLineDashPattern([], 0); // reset

  y += 7;
  // Ticket # & Date
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text(`TICKET #${order.id}`, 6, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(new Date(order.createdAt).toLocaleString(), pageWidth - 6, y, { align: 'right' });

  y += 6;
  // COUPON CODE BOX
  doc.setDrawColor(isGreen ? 5 : 217, isGreen ? 150 : 119, isGreen ? 105 : 6);
  doc.setFillColor(isGreen ? 236 : 254, isGreen ? 253 : 243, isGreen ? 245 : 199);
  doc.roundedRect(6, y, pageWidth - 12, 18, 3, 3, 'FD');

  y += 5;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isGreen ? 6 : 146, isGreen ? 95 : 64, isGreen ? 70 : 14);
  doc.text('OFFICIAL PAIRING COUPON CODE', pageWidth / 2, y, { align: 'center' });

  y += 7;
  doc.setFontSize(15);
  doc.setFont('courier', 'bold');
  doc.setTextColor(10, 10, 10);
  doc.text(order.couponCode, pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const copySubtitle = isCustomerCopy
    ? 'Customer: Show this coupon at counter or rider upon delivery'
    : 'Admin/Kitchen: Match coupon with rider or pickup customer';
  doc.text(copySubtitle, pageWidth / 2, y, { align: 'center' });

  y += 7;
  // SENDER & RECIPIENT INFO
  doc.setFillColor(245, 245, 245);
  doc.rect(6, y, pageWidth - 12, 32, 'F');
  
  y += 4.5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50);
  doc.text('CUSTOMER / SENDER DETAILS:', 8, y);
  
  y += 4.5;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 20);
  doc.text(order.customerName, 8, y);
  doc.setFont('helvetica', 'normal');
  doc.text(order.customerPhone, pageWidth - 8, y, { align: 'right' });

  y += 4.5;
  doc.setFontSize(6.5);
  doc.setTextColor(60, 60, 60);
  doc.text('Fulfillment:', 8, y);
  doc.setFont('helvetica', 'bold');
  const fulfillText = order.fulfillmentType === 'pickup' ? 'Direct Counter Pickup' : 'Courier Doorstep Delivery';
  doc.text(fulfillText, 25, y);

  if (order.fulfillmentType === 'delivery') {
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text('Address:', 8, y);
    const addr = doc.splitTextToSize(order.deliveryAddress || 'Not specified', pageWidth - 28);
    doc.text(addr, 25, y);
    y += (addr.length - 1) * 3;

    if (order.landmark) {
      y += 3.5;
      doc.text('Landmark: ' + order.landmark, 8, y);
    }
  }

  y += 4;
  doc.setFont('helvetica', 'normal');
  const bookingMode = order.deliveryBookingMode === 'eatery_books_assisted'
    ? 'Booking: Eatery assisted (+₦500 fee)'
    : 'Booking: Direct customer rider';
  doc.text(bookingMode, 8, y);

  if (order.deliveryNotes) {
    y += 4.5;
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(140, 50, 10);
    const notes = doc.splitTextToSize(`Note: "${order.deliveryNotes}"`, pageWidth - 16);
    doc.text(notes, 8, y);
    y += (notes.length - 1) * 3;
  }

  y += 6;
  // ORDER ITEMS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 50);
  doc.text('ORDER SPECIFICATIONS & REQUEST:', 6, y);
  doc.line(6, y + 1.5, pageWidth - 6, y + 1.5);

  y += 5;
  if (order.isCustomPrompt) {
    doc.setFillColor(254, 243, 199);
    doc.rect(6, y, pageWidth - 12, 14, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(146, 64, 14);
    const pText = doc.splitTextToSize(`Special Request: "${order.customPromptText}"`, pageWidth - 16);
    doc.text(pText, 8, y + 4);
    y += Math.max(14, pText.length * 4);
  } else {
    order.items.forEach((item) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(20, 20, 20);
      doc.text(`${item.quantity}x ${item.menuItem.name}`, 6, y);
      const itemTotal = `₦${(item.menuItem.price * item.quantity).toLocaleString()}`;
      doc.text(itemTotal, pageWidth - 6, y, { align: 'right' });

      y += 3.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      const specs = [item.selectedSpicy, item.selectedSwallow ? `Swallow: ${item.selectedSwallow}` : '']
        .filter(Boolean)
        .join(' | ');
      if (specs) {
        doc.text(`   (${specs})`, 6, y);
        y += 3;
      }
    });
  }

  y += 4;
  doc.line(6, y, pageWidth - 6, y);
  
  // FINANCIAL SUMMARY
  y += 4.5;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text('Food Subtotal:', 6, y);
  doc.text(`₦${order.subtotal.toLocaleString()}`, pageWidth - 6, y, { align: 'right' });

  if (order.deliveryFee > 0) {
    y += 4;
    doc.text('Delivery & Concierge Fee:', 6, y);
    doc.text(`₦${order.deliveryFee.toLocaleString()}`, pageWidth - 6, y, { align: 'right' });
  }

  y += 5;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 10, 10);
  doc.text('TOTAL AMOUNT:', 6, y);
  doc.text(`₦${order.totalAmount.toLocaleString()}`, pageWidth - 6, y, { align: 'right' });

  if (order.bankPaymentReference) {
    y += 4.5;
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text('Bank Reference Code:', 6, y);
    doc.text(order.bankPaymentReference, pageWidth - 6, y, { align: 'right' });
  }

  y += 7;
  doc.setDrawColor(180, 180, 180);
  doc.line(6, y, pageWidth - 6, y);

  y += 5;
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const footerNote = isCustomerCopy
    ? 'CUSTOMER RECEIPT • KEEP SAFE FOR MEAL VERIFICATION'
    : "ONITAWA'S KITCHEN & CASHIER LEDGER RECORD";
  doc.text(footerNote, pageWidth / 2, y, { align: 'center' });

  y += 3.5;
  doc.text(`Duplicate Record Synced with WhatsApp ${DISPLAY_ADMIN_WHATSAPP}`, pageWidth / 2, y, { align: 'center' });

  // Save the PDF
  const filename = isCustomerCopy
    ? `Onitawa_Ticket_${order.id}_CUSTOMER_COPY.pdf`
    : `Onitawa_Ticket_${order.id}_ONITAWA_COPY.pdf`;
  doc.save(filename);
};
