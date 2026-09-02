export interface CampervanSettings {
  brand: string;
  model: string;
  plateNumber: string;
  year: number;
  dailyPrice: number;
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
  
  // Additional terms
  additionalTerms: string;
  
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
  message?: string;
  status: 'pending' | 'converted' | 'cancelled';
}
