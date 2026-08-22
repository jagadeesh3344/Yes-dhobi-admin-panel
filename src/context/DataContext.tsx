import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Order,
  Customer,
  Vendor,
  Rider,
  ServiceCategory,
  SurchargeRule,
  Promotion,
  VerificationItem,
  SupportTicket,
  PayoutRecord,
  PlatformSettings,
  NotificationItem,
  OrderStatus,
} from '@/types';
import { useToast } from './ToastContext';

// Initial Mock Seed Data
const initialOrders: Order[] = [
  {
    id: '#YD-9584',
    customerName: 'Sneha Kapoor',
    customerPhone: '+91 98765 11223',
    customerAddress: 'Flat 402, Palm Heights, Indiranagar, Bangalore',
    partnerName: 'Star Bright Laundry',
    riderName: 'Rahul Yadav',
    serviceName: 'Wash & Iron',
    itemsCount: 12,
    itemDetails: '6 Shirts, 4 Trousers, 2 Bedsheets',
    amount: 240,
    status: 'In Laundry',
    pickupDate: 'Today, 10:00 AM',
    createdAt: new Date().toISOString(),
    deliveryDate: 'Tomorrow, 06:00 PM',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    notes: 'Gentle detergent for silk shirts please',
  },
  {
    id: '#YD-9583',
    customerName: 'Amit Patel',
    customerPhone: '+91 97123 44556',
    customerAddress: 'Villa 12, Green Glen Layout, Bellandur, Bangalore',
    partnerName: 'Sai Ram Dry Cleaners',
    riderName: 'Sunil Kumar',
    serviceName: 'Dry Clean',
    itemsCount: 5,
    itemDetails: '2 Blazers, 2 Woolen Sweaters, 1 Silk Saree',
    amount: 450,
    status: 'Pending Pickup',
    pickupDate: 'Today, 11:30 AM',
    createdAt: new Date().toISOString(),
    deliveryDate: '16 Mar, 04:00 PM',
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
  },
  {
    id: '#YD-9582',
    customerName: 'Neha Gupta',
    customerPhone: '+91 99887 76655',
    customerAddress: 'B-201, Sobha Dream Acres, Panathur, Bangalore',
    partnerName: 'Krishna Dhobi Shop',
    riderName: 'Unassigned',
    serviceName: 'Wash & Iron',
    itemsCount: 8,
    itemDetails: '8 Cotton Shirts',
    amount: 180,
    status: 'Assigned',
    pickupDate: 'Today, 11:00 AM',
    createdAt: new Date().toISOString(),
    deliveryDate: 'Tomorrow, 02:00 PM',
    paymentMethod: 'COD',
    paymentStatus: 'Pending',
  },
  {
    id: '#YD-9581',
    customerName: 'Rohan Verma',
    customerPhone: '+91 98451 22334',
    customerAddress: 'House 89, 4th Cross, HSR Sector 2, Bangalore',
    partnerName: 'Balaji Wash Experts',
    riderName: 'Vijay Rathore',
    serviceName: 'Only Ironing',
    itemsCount: 15,
    itemDetails: '15 Formal Shirts & Kurtas',
    amount: 120,
    status: 'Out for Delivery',
    pickupDate: 'Yesterday, 04:00 PM',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deliveryDate: 'Today, 01:00 PM',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
  },
  {
    id: '#YD-9580',
    customerName: 'Priya Sharma',
    customerPhone: '+91 91234 56789',
    customerAddress: 'Apt 104, Prestige Ozone, Whitefield, Bangalore',
    partnerName: 'Mumbai Express Wash',
    riderName: 'Deepak Pal',
    serviceName: 'Dry Clean',
    itemsCount: 3,
    itemDetails: '3 Designer Lehengas',
    amount: 600,
    status: 'In Laundry',
    pickupDate: 'Today, 12:00 PM',
    createdAt: new Date().toISOString(),
    deliveryDate: '17 Mar, 05:00 PM',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
  },
  {
    id: '#YD-9579',
    customerName: 'Vikram Singh',
    customerPhone: '+91 93456 78901',
    customerAddress: 'Flat 6B, Golden Square, Koramangala 5th Block',
    partnerName: 'Sai Ram Dry Cleaners',
    riderName: 'Rahul Yadav',
    serviceName: 'Premium Care',
    itemsCount: 7,
    itemDetails: '7 Wool & Cashmere Overcoats',
    amount: 850,
    status: 'Delivered',
    pickupDate: '13 Mar, 10:00 AM',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    deliveryDate: '14 Mar, 01:00 PM',
    paymentMethod: 'Wallet',
    paymentStatus: 'Paid',
  },
  {
    id: '#YD-9578',
    customerName: 'Deepika Sen',
    customerPhone: '+91 98765 00001',
    customerAddress: '78, 12th Main, Indiranagar, Bangalore',
    partnerName: 'Krishna Dhobi Shop',
    riderName: 'Sunil Kumar',
    serviceName: 'Wash & Iron',
    itemsCount: 10,
    itemDetails: '10 Casual T-shirts & Jeans',
    amount: 220,
    status: 'Delivered',
    pickupDate: '13 Mar, 11:00 AM',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    deliveryDate: '14 Mar, 01:00 PM',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
  },
  {
    id: '#YD-9577',
    customerName: 'Rajesh Iyer',
    customerPhone: '+91 96543 21098',
    customerAddress: '304, Brigade Millennium, JP Nagar, Bangalore',
    partnerName: 'Bangalore Premium Dhobi',
    riderName: 'Unassigned',
    serviceName: 'Dry Clean',
    itemsCount: 6,
    itemDetails: '6 Heavy Winter Blankets',
    amount: 380,
    status: 'Pending Pickup',
    pickupDate: 'Today, 03:00 PM',
    createdAt: new Date().toISOString(),
    paymentMethod: 'UPI',
    paymentStatus: 'Pending',
  },
  {
    id: '#YD-9576',
    customerName: 'Aarav Mehta',
    customerPhone: '+91 92345 67890',
    customerAddress: '12, 18th Main, HSR Layout, Bangalore',
    partnerName: 'HSR Washing Hub',
    riderName: 'Manoj Tiwari',
    serviceName: 'Wash & Iron',
    itemsCount: 14,
    itemDetails: '14 Mixed Garments',
    amount: 280,
    status: 'Ready',
    pickupDate: 'Yesterday, 11:00 AM',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    deliveryDate: 'Today, 05:00 PM',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
  },
  {
    id: '#YD-9575',
    customerName: 'Sanjay Dutt',
    customerPhone: '+91 98899 00112',
    customerAddress: '55, Lavelle Road, Bangalore Central',
    partnerName: 'Star Bright Laundry',
    riderName: 'Anand Sen',
    serviceName: 'Only Ironing',
    itemsCount: 20,
    itemDetails: '20 Linen Kurta Pajamas',
    amount: 160,
    status: 'Delivered',
    pickupDate: '13 Mar, 09:00 AM',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    deliveryDate: '13 Mar, 04:00 PM',
    paymentMethod: 'COD',
    paymentStatus: 'Paid',
  },
  {
    id: '#YD-9574',
    customerName: 'Sneha Rao',
    customerPhone: '+91 94567 89012',
    customerAddress: 'Plot 33, BTM 2nd Stage, Bangalore',
    partnerName: 'Sai Ram Dry Cleaners',
    riderName: 'Rahul Yadav',
    serviceName: 'Dry Clean',
    itemsCount: 4,
    itemDetails: '4 Silk Sarees with Zari Work',
    amount: 400,
    status: 'Ready',
    pickupDate: '12 Mar, 02:00 PM',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    deliveryDate: 'Today, 03:00 PM',
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
  },
  {
    id: '#YD-9573',
    customerName: 'Karthik Gowda',
    customerPhone: '+91 91230 45678',
    customerAddress: 'Flat 501, Embassy Residency, Indiranagar',
    partnerName: 'Indiranagar Dryclean',
    riderName: 'Sunil Kumar',
    serviceName: 'Wash & Iron',
    itemsCount: 8,
    itemDetails: '8 Bedcovers & Towels',
    amount: 720,
    status: 'Delivered',
    pickupDate: '12 Mar, 10:00 AM',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    deliveryDate: '13 Mar, 02:00 PM',
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
  },
];

const initialCustomers: Customer[] = [
  {
    id: 'CUST-101',
    name: 'Sneha Kapoor',
    phone: '+91 98765 11223',
    email: 'sneha.k@gmail.com',
    totalOrders: 24,
    walletBalance: 450,
    status: 'VIP',
    address: 'Flat 402, Palm Heights, Indiranagar',
    city: 'Bangalore',
    registeredDate: '12 Jan 2025',
    lastOrderDate: 'Today',
  },
  {
    id: 'CUST-102',
    name: 'Amit Patel',
    phone: '+91 97123 44556',
    email: 'amit.patel@gmail.com',
    totalOrders: 18,
    walletBalance: 120,
    status: 'Active',
    address: 'Villa 12, Green Glen Layout, Bellandur',
    city: 'Bangalore',
    registeredDate: '28 Feb 2025',
    lastOrderDate: 'Today',
  },
  {
    id: 'CUST-103',
    name: 'Neha Gupta',
    phone: '+91 99887 76655',
    email: 'neha.g@outlook.com',
    totalOrders: 7,
    walletBalance: 0,
    status: 'Active',
    address: 'B-201, Sobha Dream Acres, Panathur',
    city: 'Bangalore',
    registeredDate: '15 Nov 2025',
    lastOrderDate: 'Today',
  },
  {
    id: 'CUST-104',
    name: 'Rohan Verma',
    phone: '+91 98451 22334',
    email: 'rohan.verma@yahoo.com',
    totalOrders: 42,
    walletBalance: 820,
    status: 'VIP',
    address: 'House 89, 4th Cross, HSR Sector 2',
    city: 'Bangalore',
    registeredDate: '04 Oct 2024',
    lastOrderDate: 'Yesterday',
  },
  {
    id: 'CUST-105',
    name: 'Priya Sharma',
    phone: '+91 91234 56789',
    email: 'priyasharma@gmail.com',
    totalOrders: 15,
    walletBalance: 310,
    status: 'Active',
    address: 'Apt 104, Prestige Ozone, Whitefield',
    city: 'Bangalore',
    registeredDate: '18 Dec 2025',
    lastOrderDate: 'Today',
  },
  {
    id: 'CUST-106',
    name: 'Vikram Singh',
    phone: '+91 93456 78901',
    email: 'vikram.singh@gmail.com',
    totalOrders: 9,
    walletBalance: 50,
    status: 'Active',
    address: 'Flat 6B, Golden Square, Koramangala',
    city: 'Bangalore',
    registeredDate: '05 Jan 2026',
    lastOrderDate: '14 Mar',
  },
  {
    id: 'CUST-107',
    name: 'Deepika Sen',
    phone: '+91 98765 00001',
    email: 'deepika.sen@rediffmail.com',
    totalOrders: 31,
    walletBalance: 600,
    status: 'VIP',
    address: '78, 12th Main, Indiranagar',
    city: 'Bangalore',
    registeredDate: '20 Jul 2024',
    lastOrderDate: '14 Mar',
  },
  {
    id: 'CUST-108',
    name: 'Rajesh Iyer',
    phone: '+91 96543 21098',
    email: 'rajesh.iyer@gmail.com',
    totalOrders: 4,
    walletBalance: 0,
    status: 'Active',
    address: '304, Brigade Millennium, JP Nagar',
    city: 'Bangalore',
    registeredDate: '01 Mar 2026',
    lastOrderDate: 'Today',
  },
  {
    id: 'CUST-109',
    name: 'Aarav Mehta',
    phone: '+91 92345 67890',
    email: 'aarav.m@gmail.com',
    totalOrders: 12,
    walletBalance: 140,
    status: 'Active',
    address: '12, 18th Main, HSR Layout',
    city: 'Bangalore',
    registeredDate: '10 Feb 2026',
    lastOrderDate: 'Yesterday',
  },
  {
    id: 'CUST-110',
    name: 'Sanjay Dutt',
    phone: '+91 98899 00112',
    email: 'sanjay.dutt@gmail.com',
    totalOrders: 1,
    walletBalance: 0,
    status: 'Inactive',
    address: '55, Lavelle Road, Bangalore Central',
    city: 'Bangalore',
    registeredDate: '13 Mar 2026',
    lastOrderDate: '13 Mar',
  },
];

const initialVendors: Vendor[] = [
  {
    id: 'V-101',
    name: 'Star Bright Laundry',
    owner: 'Mahesh Patil',
    phone: '+91 98111 22334',
    location: 'Indiranagar 100ft Rd',
    zone: 'Indiranagar & HSR',
    capacityPerDay: 150,
    activeOrders: 14,
    commissionRate: 20,
    status: 'Active',
    rating: 4.8,
    totalRevenue: 245000,
    joinedDate: '10 Jan 2025',
  },
  {
    id: 'V-102',
    name: 'Sai Ram Dry Cleaners',
    owner: 'Ramesh Gupta',
    phone: '+91 98222 33445',
    location: 'Koramangala 4th Block',
    zone: 'Indiranagar & HSR',
    capacityPerDay: 200,
    activeOrders: 28,
    commissionRate: 20,
    status: 'Active',
    rating: 4.9,
    totalRevenue: 382000,
    joinedDate: '15 Feb 2025',
  },
  {
    id: 'V-103',
    name: 'Krishna Dhobi Shop',
    owner: 'Krishna Murthy',
    phone: '+91 98333 44556',
    location: 'HSR Sector 1',
    zone: 'Indiranagar & HSR',
    capacityPerDay: 80,
    activeOrders: 9,
    commissionRate: 18,
    status: 'Active',
    rating: 4.6,
    totalRevenue: 119800,
    joinedDate: '01 Mar 2025',
  },
  {
    id: 'V-104',
    name: 'Balaji Wash Experts',
    owner: 'Gopal Balaji',
    phone: '+91 98444 55667',
    location: 'Whitefield Main Rd',
    zone: 'Indiranagar & HSR',
    capacityPerDay: 120,
    activeOrders: 6,
    commissionRate: 20,
    status: 'Active',
    rating: 4.7,
    totalRevenue: 184000,
    joinedDate: '20 Apr 2025',
  },
  {
    id: 'V-105',
    name: 'Mumbai Express Wash',
    owner: 'Vikas Deshmukh',
    phone: '+91 98555 66778',
    location: 'Andheri West Link Rd',
    zone: 'Andheri West & Bandra',
    capacityPerDay: 300,
    activeOrders: 42,
    commissionRate: 22,
    status: 'Active',
    rating: 4.5,
    totalRevenue: 490000,
    joinedDate: '12 Nov 2024',
  },
  {
    id: 'V-106',
    name: 'Bangalore Premium Dhobi',
    owner: 'K. Venkatesh',
    phone: '+91 98666 77889',
    location: 'JP Nagar 6th Phase',
    zone: 'Indiranagar & HSR',
    capacityPerDay: 90,
    activeOrders: 5,
    commissionRate: 20,
    status: 'Active',
    rating: 4.4,
    totalRevenue: 98000,
    joinedDate: '08 Dec 2025',
  },
  {
    id: 'V-107',
    name: 'HSR Washing Hub',
    owner: 'Dinesh Kumar',
    phone: '+91 98777 88990',
    location: 'HSR 27th Main',
    zone: 'Indiranagar & HSR',
    capacityPerDay: 110,
    activeOrders: 11,
    commissionRate: 20,
    status: 'Active',
    rating: 4.6,
    totalRevenue: 142000,
    joinedDate: '14 Jan 2026',
  },
  {
    id: 'V-108',
    name: 'Indiranagar Dryclean',
    owner: 'Anil Kumar',
    phone: '+91 98888 99001',
    location: 'HAL 2nd Stage',
    zone: 'Indiranagar & HSR',
    capacityPerDay: 160,
    activeOrders: 18,
    commissionRate: 20,
    status: 'Active',
    rating: 4.7,
    totalRevenue: 210000,
    joinedDate: '25 Jan 2026',
  },
  {
    id: 'V-109',
    name: 'Shree Ganesh Steam Press',
    owner: 'Ganesh Shinde',
    phone: '+91 98999 00112',
    location: 'Bandra Linking Rd',
    zone: 'Andheri West & Bandra',
    capacityPerDay: 75,
    activeOrders: 0,
    commissionRate: 18,
    status: 'Pending Verification',
    rating: 0,
    totalRevenue: 0,
    joinedDate: '10 Mar 2026',
  },
  {
    id: 'V-110',
    name: 'Dwarka Speedy Wash',
    owner: 'Pawan Chopra',
    phone: '+91 99000 11223',
    location: 'Dwarka Sector 10',
    zone: 'Karol Bagh & Dwarka',
    capacityPerDay: 140,
    activeOrders: 0,
    commissionRate: 20,
    status: 'Suspended',
    rating: 3.2,
    totalRevenue: 45000,
    joinedDate: '02 Oct 2025',
  },
];

const initialRiders: Rider[] = [
  {
    id: 'R-501',
    name: 'Rahul Yadav',
    phone: '+91 92211 44332',
    vehicle: 'Electric Bike',
    vehiclePlate: 'KA 01 EK 4920',
    zone: 'Indiranagar & HSR',
    status: 'Online',
    totalDeliveries: 1240,
    rating: 4.9,
    weeklyEarnings: 8450,
    currentLat: 12.9716,
    currentLng: 77.5946,
    activeOrderId: '#YD-9584',
  },
  {
    id: 'R-502',
    name: 'Sunil Kumar',
    phone: '+91 93322 55443',
    vehicle: 'Scooter',
    vehiclePlate: 'KA 03 HM 1189',
    zone: 'Indiranagar & HSR',
    status: 'Online',
    totalDeliveries: 890,
    rating: 4.7,
    weeklyEarnings: 6100,
    currentLat: 12.9352,
    currentLng: 77.6245,
    activeOrderId: '#YD-9583',
  },
  {
    id: 'R-503',
    name: 'Vijay Rathore',
    phone: '+91 94433 66554',
    vehicle: 'Electric Bike',
    vehiclePlate: 'KA 04 EL 9032',
    zone: 'Indiranagar & HSR',
    status: 'On Delivery',
    totalDeliveries: 2100,
    rating: 4.8,
    weeklyEarnings: 9800,
    currentLat: 12.9141,
    currentLng: 77.6534,
    activeOrderId: '#YD-9581',
  },
  {
    id: 'R-504',
    name: 'Deepak Pal',
    phone: '+91 95544 77665',
    vehicle: 'Bicycle',
    vehiclePlate: 'N/A (Eco-Cycle)',
    zone: 'Indiranagar & HSR',
    status: 'Online',
    totalDeliveries: 410,
    rating: 4.4,
    weeklyEarnings: 3200,
    currentLat: 12.9698,
    currentLng: 77.7499,
    activeOrderId: '#YD-9580',
  },
  {
    id: 'R-505',
    name: 'Rohit Sharma',
    phone: '+91 96655 88776',
    vehicle: 'Scooter',
    vehiclePlate: 'KA 05 JR 5521',
    zone: 'Indiranagar & HSR',
    status: 'Offline',
    totalDeliveries: 110,
    rating: 4.1,
    weeklyEarnings: 1500,
    currentLat: 12.9279,
    currentLng: 77.6271,
  },
  {
    id: 'R-506',
    name: 'Manoj Tiwari',
    phone: '+91 97766 99887',
    vehicle: 'Electric Bike',
    vehiclePlate: 'KA 51 EB 3321',
    zone: 'Indiranagar & HSR',
    status: 'Online',
    totalDeliveries: 940,
    rating: 4.6,
    weeklyEarnings: 7200,
    currentLat: 12.9166,
    currentLng: 77.6101,
  },
  {
    id: 'R-507',
    name: 'Anand Sen',
    phone: '+91 98877 00112',
    vehicle: 'Scooter',
    vehiclePlate: 'KA 02 MN 7712',
    zone: 'Indiranagar & HSR',
    status: 'Online',
    totalDeliveries: 620,
    rating: 4.5,
    weeklyEarnings: 5400,
    currentLat: 12.9784,
    currentLng: 77.6408,
  },
  {
    id: 'R-508',
    name: 'Vinod Kambli',
    phone: '+91 99988 11223',
    vehicle: 'Electric Bike',
    vehiclePlate: 'MH 02 EV 9911',
    zone: 'Andheri West & Bandra',
    status: 'Offline',
    totalDeliveries: 1850,
    rating: 4.9,
    weeklyEarnings: 10500,
    currentLat: 19.1136,
    currentLng: 72.8697,
  },
  {
    id: 'R-509',
    name: 'Vicky Kaushal',
    phone: '+91 91100 22334',
    vehicle: 'Scooter',
    vehiclePlate: 'MH 03 ST 1289',
    zone: 'Andheri West & Bandra',
    status: 'Online',
    totalDeliveries: 320,
    rating: 4.3,
    weeklyEarnings: 4100,
    currentLat: 19.0596,
    currentLng: 72.8295,
  },
  {
    id: 'R-510',
    name: 'Harpreet Singh',
    phone: '+91 92211 33445',
    vehicle: 'Bicycle',
    vehiclePlate: 'N/A (Eco-Cycle)',
    zone: 'Karol Bagh & Dwarka',
    status: 'Online',
    totalDeliveries: 150,
    rating: 4.2,
    weeklyEarnings: 2100,
    currentLat: 28.6517,
    currentLng: 77.1906,
  },
];

const initialServices: ServiceCategory[] = [
  {
    id: 'SVC-1',
    name: 'Wash & Fold',
    ratePerKgOrItem: 60,
    rateUnit: '/kg',
    leadTimeHours: 24,
    status: 'Active',
    iconName: 'WashingMachine',
    description: 'Everyday wear washed with premium detergent, tumble dried and folded crisp.',
  },
  {
    id: 'SVC-2',
    name: 'Dry Cleaning',
    ratePerKgOrItem: 120,
    rateUnit: '/item',
    leadTimeHours: 72,
    status: 'Active',
    iconName: 'Shirt',
    description: 'Specialized chemical solvent cleaning for delicate fabrics, suits and designer apparel.',
  },
  {
    id: 'SVC-3',
    name: 'Ironing & Pressing',
    ratePerKgOrItem: 15,
    rateUnit: '/item',
    leadTimeHours: 24,
    status: 'Active',
    iconName: 'Wind',
    description: 'Industrial heavy steam press for wrinkle-free crisp finish on shirts, trousers & formals.',
  },
  {
    id: 'SVC-4',
    name: 'Premium Silk Wash',
    ratePerKgOrItem: 180,
    rateUnit: '/kg',
    leadTimeHours: 48,
    status: 'Active',
    iconName: 'Sparkles',
    description: 'Hand wash with pH balanced silk wash agent, gentle air dried in shade.',
  },
  {
    id: 'SVC-5',
    name: 'Stain Removal',
    ratePerKgOrItem: 80,
    rateUnit: '/spot',
    leadTimeHours: 48,
    status: 'Inactive',
    iconName: 'Droplets',
    description: 'Enzyme-based localized pre-treatment for tough oil, grease, tea and ink stains.',
  },
  {
    id: 'SVC-6',
    name: 'Curtains & Upholstery',
    ratePerKgOrItem: 250,
    rateUnit: '/item',
    leadTimeHours: 96,
    status: 'Active',
    iconName: 'Home',
    description: 'Heavy duty deep extraction wash for curtains, bed spreads, sofa covers and quilts.',
  },
];

const initialSurcharges: SurchargeRule[] = [
  {
    id: 'SUR-1',
    rule: 'Express 24-Hr Delivery',
    trigger: 'Selected at checkout by user',
    modifier: '1.5x Multiplier',
    status: 'Active',
  },
  {
    id: 'SUR-2',
    rule: 'Sunday Pickup Surcharge',
    trigger: 'Scheduled slots on Sundays',
    modifier: 'Flat ₹50 Surcharge',
    status: 'Active',
  },
  {
    id: 'SUR-3',
    rule: 'Heavy Load discount',
    trigger: 'Order weight exceeds 10kg',
    modifier: '10% Discount',
    status: 'Active',
  },
  {
    id: 'SUR-4',
    rule: 'Festival/Holiday Rate',
    trigger: 'Active on national dry days',
    modifier: '1.2x Multiplier',
    status: 'Inactive',
  },
];

const initialPromotions: Promotion[] = [
  {
    code: 'FIRST50',
    title: '50% Off First Laundry Order',
    type: 'Percentage',
    discountValue: 50,
    minOrder: 150,
    usedCount: 4124,
    maxUses: 5000,
    validity: '01 Jan - 31 Dec',
    status: 'Active',
    description: 'Exclusive welcome discount for all newly registered customers.',
  },
  {
    code: 'DIWALI30',
    title: 'Diwali Special Dry Clean Fest',
    type: 'Percentage',
    discountValue: 30,
    minOrder: 499,
    usedCount: 1980,
    maxUses: 2000,
    validity: '10 Oct - 15 Nov',
    status: 'Expired',
  },
  {
    code: 'NEWUSER',
    title: 'New Sign Up Flat Discount',
    type: 'Flat',
    discountValue: 100,
    minOrder: 250,
    usedCount: 12450,
    maxUses: 'Unlimited',
    validity: 'Ongoing',
    status: 'Active',
  },
  {
    code: 'WEEKEND20',
    title: 'Weekend Ironing Offer',
    type: 'Percentage',
    discountValue: 20,
    minOrder: 199,
    usedCount: 120,
    maxUses: 1500,
    validity: 'Every Sat-Sun',
    status: 'Active',
  },
  {
    code: 'FREESHIP',
    title: 'Free Rider Pickup & Delivery',
    type: 'Free Delivery',
    discountValue: 100,
    minOrder: 300,
    usedCount: 8920,
    maxUses: 10000,
    validity: '01 May - 31 May',
    status: 'Active',
  },
  {
    code: 'RAINYDAY',
    title: 'Monsoon Express Care',
    type: 'Percentage',
    discountValue: 15,
    minOrder: 350,
    usedCount: 0,
    maxUses: 1000,
    validity: 'Scheduled (Jul)',
    status: 'Scheduled',
  },
];

const initialVerifications: VerificationItem[] = [
  {
    id: 'VER-101',
    name: 'Suresh Pillai',
    type: 'Vendor',
    phone: '+91 98765 43210',
    submittedDate: '24 May 2026',
    docs: ['Aadhaar', 'PAN'],
    status: 'Pending Review',
    idNumber: 'AADHAAR-8902-1244-9912',
  },
  {
    id: 'VER-102',
    name: 'Karan Johar',
    type: 'Rider',
    phone: '+91 93322 55443',
    submittedDate: '24 May 2026',
    docs: ['Aadhaar', 'License'],
    status: 'Pending Review',
    idNumber: 'DL-KA-05-2022-00492',
  },
  {
    id: 'VER-103',
    name: 'Devika Drywash Ltd.',
    type: 'Vendor',
    phone: '+91 94433 66554',
    submittedDate: '23 May 2026',
    docs: ['GSTIN', 'PAN'],
    status: 'Pending Review',
    idNumber: 'GSTIN-29AAECD1290K1Z9',
  },
  {
    id: 'VER-104',
    name: 'Harish Prasad',
    type: 'Rider',
    phone: '+91 92211 33445',
    submittedDate: '22 May 2026',
    docs: ['Aadhaar', 'License'],
    status: 'Pending Review',
    idNumber: 'DL-KA-03-2021-00912',
  },
  {
    id: 'VER-105',
    name: 'Priya Sharma Wash Point',
    type: 'Vendor',
    phone: '+91 99123 45678',
    submittedDate: '21 May 2026',
    docs: ['PAN', 'Shop Sign'],
    status: 'Pending Review',
    idNumber: 'PAN-ABCPS8921J',
  },
  {
    id: 'VER-106',
    name: 'Rahul Yadav',
    type: 'Rider',
    phone: '+91 92211 44332',
    submittedDate: '20 May 2026',
    docs: ['Aadhaar', 'License'],
    status: 'Approved',
    idNumber: 'DL-KA-01-2020-00812',
  },
  {
    id: 'VER-107',
    name: 'Sunil Kumar',
    type: 'Rider',
    phone: '+91 93322 55443',
    submittedDate: '19 May 2026',
    docs: ['Aadhaar', 'License'],
    status: 'Approved',
    idNumber: 'DL-KA-02-2021-00331',
  },
  {
    id: 'VER-108',
    name: 'Amit Patel Dryclean Hub',
    type: 'Vendor',
    phone: '+91 98112 23344',
    submittedDate: '18 May 2026',
    docs: ['GSTIN', 'PAN'],
    status: 'Approved',
    idNumber: 'GSTIN-29AAAAA0000A1Z5',
  },
];

const initialTickets: SupportTicket[] = [
  {
    id: 'TKT-301',
    subject: 'Clothes damaged during wash cycle',
    by: 'Sneha Kapoor',
    role: 'Customer',
    priority: 'High',
    category: 'Damage',
    status: 'In Progress',
    createdAt: 'Today, 09:30 AM',
    messages: [
      { sender: 'Sneha Kapoor', text: 'My blue silk shirt has a small tear after returning from yesterday’s delivery.', time: '09:30 AM' },
      { sender: 'Admin Support', text: 'Hello Sneha, we apologize for the issue. We have flagged this with Star Bright Laundry and initiated a damage claim assessment.', time: '09:45 AM', isStaff: true },
    ],
  },
  {
    id: 'TKT-302',
    subject: 'Rider late for pickup scheduled at 10 AM',
    by: 'Amit Patel',
    role: 'Customer',
    priority: 'Medium',
    category: 'Delay',
    status: 'Open',
    createdAt: 'Today, 10:15 AM',
    messages: [
      { sender: 'Amit Patel', text: 'Scheduled my pickup for 10:00 AM. Rider hasn’t arrived yet.', time: '10:15 AM' },
    ],
  },
  {
    id: 'TKT-303',
    subject: 'Dry Cleaning charges mismatch in wallet',
    by: 'Sai Ram Dryclean',
    role: 'Vendor',
    priority: 'High',
    category: 'Payout',
    status: 'Open',
    createdAt: 'Today, 08:00 AM',
    messages: [
      { sender: 'Sai Ram Dryclean', text: 'Commission deduction for Order #YD-9574 was calculated at 22% instead of 20%.', time: '08:00 AM' },
    ],
  },
  {
    id: 'TKT-304',
    subject: 'Unable to upload bike registration doc',
    by: 'Sunil Kumar',
    role: 'Rider',
    priority: 'Low',
    category: 'App Bug',
    status: 'Resolved',
    createdAt: 'Yesterday',
    messages: [
      { sender: 'Sunil Kumar', text: 'Document upload gives timeout error on high resolution camera photos.', time: 'Yesterday' },
      { sender: 'Tech Team', text: 'Fixed. Image compressor added on client app.', time: 'Yesterday', isStaff: true },
    ],
  },
  {
    id: 'TKT-305',
    subject: 'Refund request for wrong ironing counts',
    by: 'Aarav Mehta',
    role: 'Customer',
    priority: 'High',
    category: 'Refund',
    status: 'In Progress',
    createdAt: 'Yesterday',
    messages: [
      { sender: 'Aarav Mehta', text: 'Billed for 14 garments, only 12 were picked up and ironed.', time: 'Yesterday' },
    ],
  },
  {
    id: 'TKT-306',
    subject: 'Customer not reachable at delivery address',
    by: 'Rahul Yadav',
    role: 'Rider',
    priority: 'Medium',
    category: 'Delivery',
    status: 'Open',
    createdAt: 'Today, 11:20 AM',
    messages: [
      { sender: 'Rahul Yadav', text: 'Waiting outside Palm Heights gate, customer phone is not picking up.', time: '11:20 AM' },
    ],
  },
  {
    id: 'TKT-307',
    subject: 'Water stain issue after delivery',
    by: 'Priya Sharma',
    role: 'Customer',
    priority: 'Low',
    category: 'Quality',
    status: 'Open',
    createdAt: 'Yesterday',
    messages: [
      { sender: 'Priya Sharma', text: 'Minor stain observed on white bedsheet.', time: 'Yesterday' },
    ],
  },
  {
    id: 'TKT-308',
    subject: 'Store payout delayed for last cycle',
    by: 'Star Bright Laundry',
    role: 'Vendor',
    priority: 'High',
    category: 'Payout',
    status: 'Resolved',
    createdAt: '12 Mar 2026',
    messages: [
      { sender: 'Star Bright Laundry', text: 'Weekly settlement amount was not credited to HDFC bank account.', time: '12 Mar' },
      { sender: 'Finance Ops', text: 'Processed via IMPS. UTR #HDFC009214.', time: '13 Mar', isStaff: true },
    ],
  },
];

const initialPayouts: PayoutRecord[] = [
  { id: 'PAY-10023', recipient: 'Star Bright Laundry', type: 'Vendor', amount: 42500, status: 'Processed', date: '24 May 2026', method: 'IMPS Direct', accountNumber: 'HDFC •••• 4910' },
  { id: 'PAY-10024', recipient: 'Rahul Yadav', type: 'Rider', amount: 8450, status: 'Processed', date: '24 May 2026', method: 'UPI Instant', accountNumber: 'rahul@okaxis' },
  { id: 'PAY-10025', recipient: 'Sai Ram Dry Cleaners', type: 'Vendor', amount: 38200, status: 'Pending', date: '23 May 2026', method: 'NEFT Transfer', accountNumber: 'ICICI •••• 8821' },
  { id: 'PAY-10026', recipient: 'Sunil Kumar', type: 'Rider', amount: 6100, status: 'Pending', date: '23 May 2026', method: 'UPI Instant', accountNumber: 'sunil@okhdfc' },
  { id: 'PAY-10027', recipient: 'Krishna Dhobi Shop', type: 'Vendor', amount: 19800, status: 'Failed', date: '22 May 2026', method: 'IMPS Direct', accountNumber: 'SBI •••• 1022' },
];

const initialSettings: PlatformSettings = {
  brandName: 'Yes Dhobi Technologies Pvt Ltd',
  supportEmail: 'backoffice-ops@yesdhobi.com',
  operatingHours: '06:00 AM - 11:00 PM',
  vendorCommissionRate: 20.0,
  riderBaseFee: 40.0,
  riderPerKmRate: 5.0,
  minOrderForFreePickup: 120.0,
  maintenanceMode: false,
  riderOutOfServiceAlert: true,
  smsNotificationsOnDelivery: true,
  activeServiceZones: [
    'Indiranagar & HSR, Bangalore',
    'Andheri West & Bandra, Mumbai',
    'Karol Bagh & Dwarka, Delhi',
    'Kothrud & Viman Nagar, Pune',
  ],
};

const initialNotifications: NotificationItem[] = [
  { id: 'N-1', title: 'New High Value Order', message: 'Order #YD-9580 placed for ₹600 (Dry Clean) by Priya Sharma', time: '5m ago', type: 'order', read: false },
  { id: 'N-2', title: 'Rider Online', message: 'Rahul Yadav started active duty in Indiranagar zone', time: '18m ago', type: 'rider', read: false },
  { id: 'N-3', title: 'Vendor Capacity Warning', message: 'Sai Ram Dry Cleaners reached 85% daily laundry capacity', time: '45m ago', type: 'vendor', read: true },
  { id: 'N-4', title: 'New KYC Submitted', message: 'Vendor Suresh Pillai submitted Aadhaar and PAN for review', time: '1h ago', type: 'system', read: false },
];

interface DataContextType {
  orders: Order[];
  customers: Customer[];
  vendors: Vendor[];
  riders: Rider[];
  services: ServiceCategory[];
  surcharges: SurchargeRule[];
  promotions: Promotion[];
  verifications: VerificationItem[];
  tickets: SupportTicket[];
  payouts: PayoutRecord[];
  settings: PlatformSettings;
  notifications: NotificationItem[];
  isLiveSimulationActive: boolean;
  setIsLiveSimulationActive: (active: boolean | ((prev: boolean) => boolean)) => void;

  // Order Operations
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  assignRiderToOrder: (orderId: string, riderName: string) => void;
  assignPartnerToOrder: (orderId: string, partnerName: string) => void;
  deleteOrder: (id: string) => void;

  // Customer Operations
  addCustomer: (customer: Omit<Customer, 'id' | 'registeredDate'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Vendor Operations
  addVendor: (vendor: Omit<Vendor, 'id' | 'joinedDate'>) => Vendor;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  toggleVendorStatus: (id: string) => void;
  deleteVendor: (id: string) => void;

  // Rider Operations
  addRider: (rider: Omit<Rider, 'id'>) => Rider;
  updateRider: (id: string, updates: Partial<Rider>) => void;
  toggleRiderStatus: (id: string) => void;
  deleteRider: (id: string) => void;

  // Services & Pricing Operations
  addService: (service: Omit<ServiceCategory, 'id'>) => ServiceCategory;
  updateService: (id: string, updates: Partial<ServiceCategory>) => void;
  toggleServiceStatus: (id: string) => void;
  deleteService: (id: string) => void;

  // Surcharge Operations
  addSurcharge: (rule: Omit<SurchargeRule, 'id'>) => SurchargeRule;
  updateSurcharge: (id: string, updates: Partial<SurchargeRule>) => void;
  toggleSurchargeStatus: (id: string) => void;
  deleteSurcharge: (id: string) => void;

  // Promotions Operations
  addPromotion: (promo: Promotion) => void;
  updatePromotion: (code: string, updates: Partial<Promotion>) => void;
  togglePromotionStatus: (code: string) => void;
  deletePromotion: (code: string) => void;

  // Verifications Operations
  approveVerification: (id: string) => void;
  rejectVerification: (id: string, reason?: string) => void;

  // Support Operations
  addTicket: (ticket: Omit<SupportTicket, 'id' | 'createdAt'>) => SupportTicket;
  replyTicket: (id: string, text: string) => void;
  updateTicketStatus: (id: string, status: 'Open' | 'In Progress' | 'Resolved') => void;
  updateTicketPriority: (id: string, priority: 'High' | 'Medium' | 'Low') => void;

  // Payout Operations
  processPayout: (id: string) => void;
  createPayout: (payout: Omit<PayoutRecord, 'id' | 'date'>) => PayoutRecord;

  // Settings & System Operations
  updateSettings: (updates: Partial<PlatformSettings>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  resetToFactoryDemo: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'yesdhobi_admin_data_v2';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  // Load from localStorage or fallback to defaults
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : initialOrders;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_vendors`);
    return saved ? JSON.parse(saved) : initialVendors;
  });

  const [riders, setRiders] = useState<Rider[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_riders`);
    return saved ? JSON.parse(saved) : initialRiders;
  });

  const [services, setServices] = useState<ServiceCategory[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_services`);
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [surcharges, setSurcharges] = useState<SurchargeRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_surcharges`);
    return saved ? JSON.parse(saved) : initialSurcharges;
  });

  const [promotions, setPromotions] = useState<Promotion[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_promotions`);
    return saved ? JSON.parse(saved) : initialPromotions;
  });

  const [verifications, setVerifications] = useState<VerificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_verifications`);
    return saved ? JSON.parse(saved) : initialVerifications;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tickets`);
    return saved ? JSON.parse(saved) : initialTickets;
  });

  const [payouts, setPayouts] = useState<PayoutRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payouts`);
    return saved ? JSON.parse(saved) : initialPayouts;
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [isLiveSimulationActive, setIsLiveSimulationActive] = useState<boolean>(true);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_vendors`, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_riders`, JSON.stringify(riders));
  }, [riders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_services`, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_surcharges`, JSON.stringify(surcharges));
  }, [surcharges]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_promotions`, JSON.stringify(promotions));
  }, [promotions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_verifications`, JSON.stringify(verifications));
  }, [verifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tickets`, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payouts`, JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
  }, [notifications]);

  // Real-time live simulation ticker
  useEffect(() => {
    if (!isLiveSimulationActive) return;

    const interval = setInterval(() => {
      // Pick an action randomly
      const rand = Math.random();

      if (rand < 0.35) {
        // Progress an in-progress order
        setOrders((prevOrders) => {
          const activeIndices = prevOrders
            .map((o, idx) => ({ o, idx }))
            .filter(({ o }) => o.status !== 'Delivered' && o.status !== 'Cancelled');
          if (activeIndices.length === 0) return prevOrders;

          const chosen = activeIndices[Math.floor(Math.random() * activeIndices.length)];
          const flow: Record<OrderStatus, OrderStatus> = {
            'Pending Pickup': 'Assigned',
            'Assigned': 'In Laundry',
            'In Laundry': 'Washing',
            'Washing': 'Ironing',
            'Ironing': 'Ready',
            'Ready': 'Out for Delivery',
            'Out for Delivery': 'Delivered',
            'Delivered': 'Delivered',
            'Cancelled': 'Cancelled',
          };

          const nextStatus = flow[chosen.o.status] || 'Ready';
          if (nextStatus === chosen.o.status) return prevOrders;

          const updated = [...prevOrders];
          updated[chosen.idx] = {
            ...chosen.o,
            status: nextStatus,
          };
          return updated;
        });
      } else if (rand < 0.6) {
        // Minor rider location shift & earnings tick
        setRiders((prevRiders) => {
          return prevRiders.map((r) => {
            if (r.status === 'Online' || r.status === 'On Delivery') {
              const deltaLat = (Math.random() - 0.5) * 0.002;
              const deltaLng = (Math.random() - 0.5) * 0.002;
              return {
                ...r,
                currentLat: (r.currentLat || 12.97) + deltaLat,
                currentLng: (r.currentLng || 77.59) + deltaLng,
              };
            }
            return r;
          });
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isLiveSimulationActive]);

  // --- Orders Actions ---
  const addOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
      const nextNum = 9585 + Math.floor(Math.random() * 900);
      const newOrder: Order = {
        ...orderData,
        id: `#YD-${nextNum}`,
        createdAt: new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Update customer order count
      setCustomers((prev) =>
        prev.map((c) => (c.name === orderData.customerName ? { ...c, totalOrders: c.totalOrders + 1, lastOrderDate: 'Just now' } : c))
      );

      // Add notification
      const newNotif: NotificationItem = {
        id: `N-${Date.now()}`,
        title: 'New Laundry Order Created',
        message: `Order ${newOrder.id} (${newOrder.serviceName}) created for ${newOrder.customerName} - ₹${newOrder.amount}`,
        time: 'Just now',
        type: 'order',
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      showToast('Order Created', `Order ${newOrder.id} has been registered successfully.`);
      return newOrder;
    },
    [showToast]
  );

  const updateOrder = useCallback(
    (id: string, updates: Partial<Order>) => {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
      showToast('Order Updated', `Order ${id} details modified.`);
    },
    [showToast]
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              status,
              ...(status === 'Delivered' ? { paymentStatus: 'Paid' } : {}),
            };
          }
          return o;
        })
      );
      showToast('Status Updated', `Order ${id} moved to "${status}".`);
    },
    [showToast]
  );

  const assignRiderToOrder = useCallback(
    (orderId: string, riderName: string) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, riderName, status: o.status === 'Pending Pickup' ? 'Assigned' : o.status } : o))
      );
      showToast('Rider Assigned', `Rider ${riderName} dispatched to order ${orderId}.`);
    },
    [showToast]
  );

  const assignPartnerToOrder = useCallback(
    (orderId: string, partnerName: string) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, partnerName } : o)));
      showToast('Vendor Assigned', `Laundry partner changed to ${partnerName}.`);
    },
    [showToast]
  );

  const deleteOrder = useCallback(
    (id: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      showToast('Order Deleted', `Order ${id} removed from system.`, 'info');
    },
    [showToast]
  );

  // --- Customer Actions ---
  const addCustomer = useCallback(
    (customerData: Omit<Customer, 'id' | 'registeredDate'>): Customer => {
      const id = `CUST-${100 + customers.length + 1}`;
      const newCustomer: Customer = {
        ...customerData,
        id,
        registeredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      showToast('Customer Added', `${newCustomer.name} has been enrolled in the registry.`);
      return newCustomer;
    },
    [customers.length, showToast]
  );

  const updateCustomer = useCallback(
    (id: string, updates: Partial<Customer>) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      showToast('Customer Updated', `Customer profile #${id} updated.`);
    },
    [showToast]
  );

  const deleteCustomer = useCallback(
    (id: string) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast('Customer Removed', `Customer #${id} removed from active accounts.`, 'info');
    },
    [showToast]
  );

  // --- Vendor Actions ---
  const addVendor = useCallback(
    (vendorData: Omit<Vendor, 'id' | 'joinedDate'>): Vendor => {
      const id = `V-${100 + vendors.length + 1}`;
      const newVendor: Vendor = {
        ...vendorData,
        id,
        joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      setVendors((prev) => [newVendor, ...prev]);
      showToast('Partner Onboarded', `${newVendor.name} registered as a vendor partner.`);
      return newVendor;
    },
    [vendors.length, showToast]
  );

  const updateVendor = useCallback(
    (id: string, updates: Partial<Vendor>) => {
      setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
      showToast('Partner Updated', `Vendor partner #${id} updated.`);
    },
    [showToast]
  );

  const toggleVendorStatus = useCallback(
    (id: string) => {
      let targetName = '';
      let nextStatus: 'Active' | 'Suspended' = 'Active';
      setVendors((prev) =>
        prev.map((v) => {
          if (v.id === id) {
            nextStatus = v.status === 'Active' ? 'Suspended' : 'Active';
            targetName = v.name;
            return { ...v, status: nextStatus };
          }
          return v;
        })
      );
      if (targetName) {
        showToast('Partner Status Changed', `${targetName} status is now ${nextStatus}.`);
      }
    },
    [showToast]
  );

  const deleteVendor = useCallback(
    (id: string) => {
      setVendors((prev) => prev.filter((v) => v.id !== id));
      showToast('Partner Removed', `Vendor #${id} deleted.`, 'info');
    },
    [showToast]
  );

  // --- Rider Actions ---
  const addRider = useCallback(
    (riderData: Omit<Rider, 'id'>): Rider => {
      const id = `R-${500 + riders.length + 1}`;
      const newRider: Rider = {
        ...riderData,
        id,
      };
      setRiders((prev) => [newRider, ...prev]);
      showToast('Rider Enrolled', `${newRider.name} added to delivery fleet.`);
      return newRider;
    },
    [riders.length, showToast]
  );

  const updateRider = useCallback(
    (id: string, updates: Partial<Rider>) => {
      setRiders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
      showToast('Rider Updated', `Rider #${id} records updated.`);
    },
    [showToast]
  );

  const toggleRiderStatus = useCallback(
    (id: string) => {
      let targetName = '';
      let nextStatus: 'Online' | 'Offline' = 'Offline';
      setRiders((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            nextStatus = r.status === 'Online' ? 'Offline' : 'Online';
            targetName = r.name;
            return { ...r, status: nextStatus };
          }
          return r;
        })
      );
      if (targetName) {
        showToast('Rider Status Changed', `${targetName} is now ${nextStatus}.`);
      }
    },
    [showToast]
  );

  const deleteRider = useCallback(
    (id: string) => {
      setRiders((prev) => prev.filter((r) => r.id !== id));
      showToast('Rider Removed', `Rider #${id} deleted from fleet.`, 'info');
    },
    [showToast]
  );

  // --- Services Actions ---
  const addService = useCallback(
    (svc: Omit<ServiceCategory, 'id'>): ServiceCategory => {
      const id = `SVC-${services.length + 1}`;
      const newService: ServiceCategory = { ...svc, id };
      setServices((prev) => [...prev, newService]);
      showToast('Service Category Created', `${newService.name} added to platform catalog.`);
      return newService;
    },
    [services.length, showToast]
  );

  const updateService = useCallback(
    (id: string, updates: Partial<ServiceCategory>) => {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      showToast('Catalog Updated', `Service category modified.`);
    },
    [showToast]
  );

  const toggleServiceStatus = useCallback(
    (id: string) => {
      let targetName = '';
      let nextStatus: 'Active' | 'Inactive' = 'Inactive';
      setServices((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
            targetName = s.name;
            return { ...s, status: nextStatus };
          }
          return s;
        })
      );
      if (targetName) {
        showToast('Category Status Updated', `${targetName} is now ${nextStatus}.`);
      }
    },
    [showToast]
  );

  const deleteService = useCallback(
    (id: string) => {
      setServices((prev) => prev.filter((s) => s.id !== id));
      showToast('Service Deleted', 'Service category removed from catalog.', 'info');
    },
    [showToast]
  );

  // --- Surcharge Actions ---
  const addSurcharge = useCallback(
    (ruleData: Omit<SurchargeRule, 'id'>): SurchargeRule => {
      const id = `SUR-${surcharges.length + 1}`;
      const newRule: SurchargeRule = { ...ruleData, id };
      setSurcharges((prev) => [...prev, newRule]);
      showToast('Pricing Rule Added', `${newRule.rule} configured.`);
      return newRule;
    },
    [surcharges.length, showToast]
  );

  const updateSurcharge = useCallback(
    (id: string, updates: Partial<SurchargeRule>) => {
      setSurcharges((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      showToast('Pricing Rule Updated', 'Rule configuration updated.');
    },
    [showToast]
  );

  const toggleSurchargeStatus = useCallback(
    (id: string) => {
      let ruleName = '';
      let nextStatus: 'Active' | 'Inactive' = 'Inactive';
      setSurcharges((prev) =>
        prev.map((s) => {
          if (s.id === id) {
            nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
            ruleName = s.rule;
            return { ...s, status: nextStatus };
          }
          return s;
        })
      );
      if (ruleName) {
        showToast('Rule Status Updated', `${ruleName} is now ${nextStatus}.`);
      }
    },
    [showToast]
  );

  const deleteSurcharge = useCallback(
    (id: string) => {
      setSurcharges((prev) => prev.filter((s) => s.id !== id));
      showToast('Pricing Rule Removed', 'Rule deleted.', 'info');
    },
    [showToast]
  );

  // --- Promotions Actions ---
  const addPromotion = useCallback(
    (promo: Promotion) => {
      setPromotions((prev) => [promo, ...prev]);
      showToast('Promo Created', `Coupon code "${promo.code}" is now live!`);
    },
    [showToast]
  );

  const updatePromotion = useCallback(
    (code: string, updates: Partial<Promotion>) => {
      setPromotions((prev) => prev.map((p) => (p.code === code ? { ...p, ...updates } : p)));
      showToast('Promo Updated', `Promotion "${code}" updated.`);
    },
    [showToast]
  );

  const togglePromotionStatus = useCallback(
    (code: string) => {
      let found = false;
      let nextStatus: 'Active' | 'Expired' = 'Active';
      setPromotions((prev) =>
        prev.map((p) => {
          if (p.code === code) {
            found = true;
            nextStatus = p.status === 'Active' ? 'Expired' : 'Active';
            return { ...p, status: nextStatus };
          }
          return p;
        })
      );
      if (found) {
        showToast('Promo Status Toggled', `Code ${code} marked as ${nextStatus}.`);
      }
    },
    [showToast]
  );

  const deletePromotion = useCallback(
    (code: string) => {
      setPromotions((prev) => prev.filter((p) => p.code !== code));
      showToast('Promo Terminated', `Code "${code}" ended and archived.`, 'info');
    },
    [showToast]
  );

  // --- Verifications Actions ---
  const approveVerification = useCallback(
    (id: string) => {
      setVerifications((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'Approved' } : v))
      );
      showToast('Applicant Approved', `Verification #${id} verified & granted platform access.`);
    },
    [showToast]
  );

  const rejectVerification = useCallback(
    (id: string, reason?: string) => {
      setVerifications((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'Rejected', rejectionReason: reason || 'Document mismatch' } : v))
      );
      showToast('Applicant Rejected', `Verification #${id} marked as rejected.`, 'warning');
    },
    [showToast]
  );

  // --- Support Actions ---
  const addTicket = useCallback(
    (tkt: Omit<SupportTicket, 'id' | 'createdAt'>): SupportTicket => {
      const id = `TKT-${300 + tickets.length + 1}`;
      const newTkt: SupportTicket = {
        ...tkt,
        id,
        createdAt: 'Just now',
      };
      setTickets((prev) => [newTkt, ...prev]);
      showToast('Ticket Logged', `Support request #${id} opened.`);
      return newTkt;
    },
    [tickets.length, showToast]
  );

  const replyTicket = useCallback(
    (id: string, text: string) => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const newMsg = {
              sender: 'Admin Operations',
              text,
              time: 'Just now',
              isStaff: true,
            };
            return {
              ...t,
              status: 'In Progress',
              messages: [...t.messages, newMsg],
            };
          }
          return t;
        })
      );
      showToast('Response Sent', `Reply added to ticket #${id}.`);
    },
    [showToast]
  );

  const updateTicketStatus = useCallback(
    (id: string, status: 'Open' | 'In Progress' | 'Resolved') => {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      showToast('Ticket Status Changed', `Ticket #${id} is now ${status}.`);
    },
    [showToast]
  );

  const updateTicketPriority = useCallback(
    (id: string, priority: 'High' | 'Medium' | 'Low') => {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, priority } : t)));
      showToast('Priority Updated', `Ticket #${id} set to ${priority} priority.`);
    },
    [showToast]
  );

  // --- Payout Actions ---
  const processPayout = useCallback(
    (id: string) => {
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'Processed', date: 'Today' } : p))
      );
      showToast('Payout Settled', `Bank settlement #${id} disbursed.`);
    },
    [showToast]
  );

  const createPayout = useCallback(
    (payoutData: Omit<PayoutRecord, 'id' | 'date'>): PayoutRecord => {
      const id = `PAY-${10020 + payouts.length + 1}`;
      const newPayout: PayoutRecord = {
        ...payoutData,
        id,
        date: 'Today',
      };
      setPayouts((prev) => [newPayout, ...prev]);
      showToast('Payout Generated', `Payout #${id} of ₹${newPayout.amount} initiated.`);
      return newPayout;
    },
    [payouts.length, showToast]
  );

  // --- Settings Actions ---
  const updateSettings = useCallback(
    (updates: Partial<PlatformSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
      showToast('Configuration Saved', 'Global back-office platform settings updated.');
    },
    [showToast]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    showToast('Notifications Cleared', 'All alerts dismissed.', 'info');
  }, [showToast]);

  const resetToFactoryDemo = useCallback(() => {
    setOrders(initialOrders);
    setCustomers(initialCustomers);
    setVendors(initialVendors);
    setRiders(initialRiders);
    setServices(initialServices);
    setSurcharges(initialSurcharges);
    setPromotions(initialPromotions);
    setVerifications(initialVerifications);
    setTickets(initialTickets);
    setPayouts(initialPayouts);
    setSettings(initialSettings);
    setNotifications(initialNotifications);
    localStorage.clear();
    showToast('Demo Data Reset', 'Platform restored to initial sample state.');
  }, [showToast]);

  return (
    <DataContext.Provider
      value={{
        orders,
        customers,
        vendors,
        riders,
        services,
        surcharges,
        promotions,
        verifications,
        tickets,
        payouts,
        settings,
        notifications,
        isLiveSimulationActive,
        setIsLiveSimulationActive,
        addOrder,
        updateOrder,
        updateOrderStatus,
        assignRiderToOrder,
        assignPartnerToOrder,
        deleteOrder,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addVendor,
        updateVendor,
        toggleVendorStatus,
        deleteVendor,
        addRider,
        updateRider,
        toggleRiderStatus,
        deleteRider,
        addService,
        updateService,
        toggleServiceStatus,
        deleteService,
        addSurcharge,
        updateSurcharge,
        toggleSurchargeStatus,
        deleteSurcharge,
        addPromotion,
        updatePromotion,
        togglePromotionStatus,
        deletePromotion,
        approveVerification,
        rejectVerification,
        addTicket,
        replyTicket,
        updateTicketStatus,
        updateTicketPriority,
        processPayout,
        createPayout,
        updateSettings,
        markNotificationRead,
        clearAllNotifications,
        resetToFactoryDemo,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
