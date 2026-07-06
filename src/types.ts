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
  ownerName: string;
  ownerId: string; // IČO
  ownerAddress: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerBank: string;
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
  
  // Rental dates
  startDate: string;
  endDate: string;
  
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
