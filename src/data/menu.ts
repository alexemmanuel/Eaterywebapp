import { MenuItem, CourierProvider, AdminSettings } from '../types';

export const OFFICIAL_ADMIN_WHATSAPP = '+14849961808';
export const DISPLAY_ADMIN_WHATSAPP = '+1 484 996 1808';

export const COMPANY_BANK_ACCOUNT = {
  bankName: 'Palmpay',
  accountName: 'Muideen Akolade',
  accountNumber: '8162128815',
  branch: 'Palmpay Digital HQ, Nigeria',
  sortCode: '999991',
};

export const EATERY_ASSISTED_BOOKING_FEE = 500; // Additional fee if eatery books courier on behalf of user
export const STANDARD_DELIVERY_BASE_FEE = 1200;

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  adminWhatsAppNumber: OFFICIAL_ADMIN_WHATSAPP,
  kitchenName: "Onitawa's Catering & Eatery",
  kitchenAddress: 'Plot 12 Commercial Avenue / Onitawa Kitchen HQ',
  enableSoundAlerts: true,
  bankAccount: COMPANY_BANK_ACCOUNT,
};


export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'amala-special-platter',
    name: "Onitawa's Signature Amala Platter",
    category: 'combos',
    description: 'Hot velvety Amala paired with silky Ewedu & rich golden Gbegiri soup, served with assorted meats (Shaki tripe, Ponmo, Tender Beef, and Cow Leg). Authentic Yoruba delicacy from our flyer.',
    price: 6500,
    image: '/src/assets/images/onitawas_amala_special_1791846460142.jpg',
    isPopular: true,
    spicyLevels: ['Mild Native', 'Traditional Hot', 'Onitawa Fiery 🔥'],
    swallowOptions: ['Steaming Hot Amala', 'Soft Pounded Yam', 'Smooth Semovita'],
    prepTimeMinutes: 15,
  },
  {
    id: 'party-jollof-combo',
    name: 'Smoky Party Jollof & Fried Rice Feast',
    category: 'rice',
    description: 'Firewood-style smoky Nigerian party jollof rice and savory fried rice, served with sweet fried dodo (plantain), grilled peppered chicken drumstick, boiled egg & coleslaw salad.',
    price: 5800,
    image: '/src/assets/images/onitawas_party_jollof_1791846461044.jpg',
    isPopular: true,
    spicyLevels: ['Standard Party Spice', 'Extra Peppered'],
    prepTimeMinutes: 12,
  },
  {
    id: 'peppered-meats-skillet',
    name: 'Sizzling Peppered Assorted Meats & Asun',
    category: 'grills',
    description: 'Spicy pan-fried goat meat (Asun), tender shaki, and slow-cooked cow foot tossed in our signature Scotch bonnet pepper glaze with caramelized habanero onions and herbs.',
    price: 7500,
    image: '/src/assets/images/onitawas_peppered_meats_1791846459619.jpg',
    isPopular: true,
    spicyLevels: ['Hot & Savory', 'Fiery Asun Heat 🔥🔥'],
    prepTimeMinutes: 18,
  },
  {
    id: 'catering-hero-grand-feast',
    name: "Onitawa's Grand Catering Party Platter",
    category: 'combos',
    description: 'Full catering feast box suitable for 2-3 guests: Party Jollof Rice, fried plantains, peppered goat meat, 2 wraps of Amala with Ewedu/Gbegiri, and 2 chilled drinks.',
    price: 14500,
    image: '/src/assets/images/onitawas_hero_feast_1791846460688.jpg',
    isPopular: true,
    spicyLevels: ['Balanced Blend', 'Extra Spicy'],
    prepTimeMinutes: 25,
  },
  {
    id: 'ofada-designer-rice',
    name: 'Special Ofada Rice & Ayamase Designer Stew',
    category: 'rice',
    description: 'Locally grown unpolished Ofada rice served with authentic Ayamase green pepper stew (bleached palm oil, locust beans iru, boiled egg, diced assorted meats) and fried plantain.',
    price: 6200,
    image: '/src/assets/images/onitawas_party_jollof_1791846461044.jpg',
    spicyLevels: ['Authentic Ayamase Hot', 'Mild Heat'],
    prepTimeMinutes: 15,
  },
  {
    id: 'pounded-yam-efo-riro',
    name: 'Pounded Yam with Fisherman Efo Riro',
    category: 'swallows',
    description: 'Freshly prepared pounded yam with rich spinach vegetable soup loaded with smoked catfish, dried prawns, cow skin (ponmo), and tender beef cubes.',
    price: 6800,
    image: '/src/assets/images/onitawas_amala_special_1791846460142.jpg',
    swallowOptions: ['Pounded Yam', 'Eba (Garri)', 'Amala'],
    spicyLevels: ['Traditional Pepper', 'Mild Spice'],
    prepTimeMinutes: 20,
  },
  {
    id: 'extra-sweet-dodo',
    name: 'Portion of Sweet Fried Plantains (Dodo)',
    category: 'sides_drinks',
    description: 'Ripe sweet plantains fried to golden caramelized perfection with a sprinkle of sea salt.',
    price: 1500,
    image: '/src/assets/images/onitawas_party_jollof_1791846461044.jpg',
    prepTimeMinutes: 8,
  },
  {
    id: 'chilled-zobo-drink',
    name: 'Chilled Hibiscus Zobo & Ginger Punch',
    category: 'sides_drinks',
    description: 'Freshly brewed hibiscus calyx infused with natural ginger, cloves, and sweet pineapple puree. 500ml chilled bottle.',
    price: 1800,
    image: '/src/assets/images/onitawas_hero_feast_1791846460688.jpg',
    prepTimeMinutes: 3,
  },
];

export const COURIER_PROVIDERS: CourierProvider[] = [
  {
    id: 'chowdeck',
    name: 'Chowdeck Logistics',
    logo: '🛵',
    estimatedPickupMins: 4,
    baseDeliveryFee: 1200,
    rating: 4.9,
    vehicleType: 'Insulated Thermal Box Motorbike',
    description: 'Fastest dispatch in 4 mins. Verified thermal food compartment.',
  },
  {
    id: 'gokada',
    name: 'Gokada Express',
    logo: '🏍️',
    estimatedPickupMins: 6,
    baseDeliveryFee: 1100,
    rating: 4.8,
    vehicleType: 'Express 150cc Courier Bike',
    description: 'Reliable city-wide courier network with real-time GPS tracking.',
  },
  {
    id: 'kwik',
    name: 'Kwik Delivery',
    logo: '⚡',
    estimatedPickupMins: 7,
    baseDeliveryFee: 1350,
    rating: 4.7,
    vehicleType: 'Kwik On-Demand Dispatch',
    description: 'Direct door-to-door delivery with instant driver pairing.',
  },
  {
    id: 'bolt',
    name: 'Bolt Food Delivery',
    logo: '🟢',
    estimatedPickupMins: 8,
    baseDeliveryFee: 1400,
    rating: 4.8,
    vehicleType: 'Bolt Partner Motorcycle',
    description: 'Experienced multi-route couriers with live route telemetrics.',
  },
  {
    id: 'uber-direct',
    name: 'Uber Direct Courier',
    logo: '⬛',
    estimatedPickupMins: 5,
    baseDeliveryFee: 1500,
    rating: 4.9,
    vehicleType: 'Uber Courier Network',
    description: 'Premium express handling for delicate hot food packages.',
  },
];

export const DEMO_RIDERS = [
  {
    name: 'Babatunde Adeleke',
    phone: '+234 803 718 2938',
    bikeModel: 'Bajaj Boxer 150 (Red)',
    plateNumber: 'AGL-839-XJ',
    rating: 4.9,
  },
  {
    name: 'Emeka Okafor',
    phone: '+234 812 492 8104',
    bikeModel: 'TVS Neo 125 (Blue)',
    plateNumber: 'KJA-512-AB',
    rating: 4.8,
  },
  {
    name: 'Tunde Balogun',
    phone: '+234 701 983 2341',
    bikeModel: 'Haojue Express 125 (Black)',
    plateNumber: 'LND-291-LK',
    rating: 5.0,
  },
];
