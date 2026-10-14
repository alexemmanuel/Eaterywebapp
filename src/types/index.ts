export type OrderStatus =
  | 'pending'
  | 'preparing'
  | 'ready'
  | 'rider_assigned'
  | 'rider_at_eatery'
  | 'picked_up'
  | 'in_transit'
  | 'arrived'
  | 'completed'
  | 'issue_reported';

export interface MenuItem {
  id: string;
  name: string;
  category: 'combos' | 'swallows' | 'rice' | 'grills' | 'sides_drinks';
  description: string;
  price: number; // in NGN (₦)
  image: string;
  isPopular?: boolean;
  spicyLevels?: string[];
  swallowOptions?: string[];
  prepTimeMinutes: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedSpicy?: string;
  selectedSwallow?: string;
  specialInstructions?: string;
}

export interface CourierProvider {
  id: string;
  name: string;
  logo: string;
  estimatedPickupMins: number;
  baseDeliveryFee: number;
  rating: number;
  vehicleType: string;
  description: string;
}

export interface RiderDetails {
  id: string;
  name: string;
  courierName: string;
  phone: string;
  bikeModel: string;
  plateNumber: string;
  rating: number;
  photoUrl?: string;
}

export interface OrderIssue {
  id: string;
  orderId?: string;
  couponCode?: string;
  customerName?: string;
  customerPhone?: string;
  category: 'missing_item' | 'food_damaged' | 'extreme_delay' | 'wrong_order' | 'rider_issue' | 'other';
  title: string;
  description: string;
  reportedAt: string;
  status: 'open' | 'investigating' | 'resolved';
  resolutionNotes?: string;
}

export interface Order {
  id: string; // e.g. "TK-7842"
  couponCode: string; // e.g. "ONI-7842-K"
  createdAt: string;
  customerName: string;
  customerPhone: string;
  
  // Fulfillment: Pickup vs Delivery
  fulfillmentType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  landmark?: string;
  deliveryNotes?: string;
  deliveryBookingMode?: 'user_books' | 'eatery_books_assisted';
  assistedBookingFee?: number;

  // Custom prompt request (if created via custom special prompt)
  isCustomPrompt?: boolean;
  customPromptText?: string;
  
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  
  // Seamless Bank Payment & Ticket Color
  paymentMethod: 'bank_transfer_online' | 'pay_on_delivery' | 'pay_on_pickup';
  paymentStatus: 'paid_verified' | 'manual_collection'; // paid (green) vs manual collecting (yellow)
  bankPaymentReference?: string; // unique code e.g. "REF-ONI-8492-918"
  ticketColor: 'green' | 'yellow'; // Green = Paid Complete, Yellow = Manually Paying Customer
  
  status: OrderStatus;
  
  // Kitchen readiness
  readyAt?: string;
  
  // Customer-initiated Courier booking
  selectedCourier?: CourierProvider;
  rider?: RiderDetails;
  riderProgressPercent?: number; // 0 to 100
  estimatedDeliveryMins?: number;
  
  // Customer received confirmation & review
  receivedAt?: string;
  customerRating?: number;
  customerReview?: string;
  
  // Issue report
  issues?: OrderIssue[];
  
  // Administrative record tracking
  whatsappAdminNumber: string;
  whatsappSentAt?: string;
}

export interface BankAccountDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch?: string;
  sortCode?: string;
}

export interface AdminSettings {
  adminWhatsAppNumber: string;
  kitchenName: string;
  kitchenAddress: string;
  enableSoundAlerts: boolean;
  bankAccount: BankAccountDetails;
}
