export interface ExtraAddon {
  id: string;
  name: string;
  description: string;
  price: number; // Flat fee or per day
  priceType: 'flat' | 'per_day';
  icon?: string;
}

export interface SeasonRate {
  id: string;
  name: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number; // 1-12
  endDay: number;
  dailyPrice: number;
  minDays?: number;
}

export interface CampervanSettings {
  brand: string;
  model: string;
  plateNumber: string;
  year: number;
  dailyPrice: number;
  offSeasonPrice?: number;
  peakSeasonPrice?: number;
  deposit: number;
  cleaningFee: number;
  kmLimitPerDay: number; // 0 for unlimited
  kmOverLimitPrice: number;
  bufferHours?: number; // Service gap between rentals in hours (e.g. 1.5)
  ownerName: string;
  ownerId: string; // IČO
  ownerAddress: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerBank: string;
  adminPassword?: string;
  availableAddons?: ExtraAddon[];
}

export interface HandoverProtocol {
  id: string;
  contractId: string;
  type: 'check_in' | 'check_out';
  date: string;
  time: string;
  odometer: number;
  fuelLevel: 'empty' | '1/4' | '1/2' | '3/4' | 'full';
  gasBottlesCount: number;
  cleanliness: 'clean' | 'acceptable' | 'dirty';
  existingDamages: string;
  notes: string;
  depositHandled: boolean;
  depositAmount: number;
  depositNote?: string;
  photos?: string[]; // base64 images
  tenantSignature?: string;
  ownerSignature?: string;
}

export interface SelectedAddon {
  id: string;
  name: string;
  price: number;
  priceType: 'flat' | 'per_day';
}

export interface ContractData {
  id: string;
  createdAt: string;
  
  // Tenant details
  tenantName: string;
  tenantBirthDate: string;
  tenantIdNumber: string; // OP / Pas
  tenantDlNumber: string; // Řidičský průkaz
  tenantAddress: string;
  tenantPhone: string;
  tenantEmail: string;
  
  // Rental dates & times
  startDate: string;
  startTime?: string; // HH:MM, e.g. "10:00"
  endDate: string;
  endTime?: string; // HH:MM, e.g. "10:00"
  
  // Pricing override or snapshots
  dailyPrice: number;
  deposit: number;
  cleaningFee: number;
  kmLimitPerDay: number;
  kmOverLimitPrice: number;
  selectedAddons?: SelectedAddon[];
  addonsTotal?: number;
  
  // Additional terms
  additionalTerms: string;
  
  // Handover protocols
  checkInProtocol?: HandoverProtocol;
  checkOutProtocol?: HandoverProtocol;
  
  // Signatures
  ownerSignature?: string; // base64 PNG image or svg path
  tenantSignature?: string; // base64 PNG image
  signedAt?: string;
  signedIp?: string;
  isSigned: boolean;
}

export interface ReservationInquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
  startTime?: string; // HH:MM, e.g. "10:00"
  endDate: string;
  endTime?: string; // HH:MM, e.g. "10:00"
  selectedAddonIds?: string[];
  message?: string;
  status: 'pending' | 'converted' | 'cancelled';
}
