
export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string; // OP or Passport
}

export interface SeasonPrice {
  id: string;
  name: string;
  startDate: string; // ISO format
  endDate: string;
  pricePerDay: number;
}

export interface Message {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
}

export interface Vehicle {
  id: string;
  name: string;
  description: string;
  licensePlate: string;
  vin?: string;
  basePrice: number;
  minDays: number;
  deposit: number;
  kmLimitPerDay: number;
  extraKmPrice: number;
  images: string[];
  isActive: boolean;
  seasonalPricing: SeasonPrice[];
  equipment: string[];
}

export interface HandoverProtocol {
  id: string;
  reservationId: string;
  date: string;
  time: string;
  mileage: number;
  fuelLevel: number; // 0-100
  cleanliness: string;
  damages: string;
  notes: string;
}

export interface ReturnProtocol extends HandoverProtocol {
  returnMileage: number;
  returnFuelLevel: number;
  returnDamages: string;
  extraKmCharge: number;
}

export interface Reservation {
  id: string;
  vehicleId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  deposit: number;
  status: ReservationStatus;
  createdAt: string;
  customerNote?: string;
  selectedAddOns?: { itemId: string; quantity: number }[];
}

export interface SavedContract {
  id: string;
  reservationId: string;
  customerName: string;
  createdAt: string;
  content: string;
}

export interface MaintenanceTask {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  date: string; // ISO format
  type: 'service' | 'oil' | 'gas' | 'tires' | 'other';
  status: 'pending' | 'completed';
  cost?: number;
  mileage?: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  category: 'camping' | 'kitchen' | 'safety' | 'other' | 'sport' | 'service';
  pricePerDay: number;
  isOneTimeFee?: boolean;
  description?: string;
  image?: string;
}

export interface DashboardStats {
  totalReservations: number;
  activeBookings: number;
  monthlyRevenue: number;
  fleetUtilization: number;
}
