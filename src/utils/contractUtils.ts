import { ContractData, CampervanSettings } from '../types';

/**
 * Encodes a contract object into a URL-safe base64 string
 */
export function encodeContract(contract: Partial<ContractData>): string {
  try {
    const jsonStr = JSON.stringify(contract);
    // Safe encoding of UTF-8 strings for base64
    const utf8Bytes = encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    });
    return btoa(utf8Bytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (err) {
    console.error('Error encoding contract data', err);
    return '';
  }
}

/**
 * Decodes a URL-safe base64 string back into a contract object
 */
export function decodeContract(encoded: string): Partial<ContractData> | null {
  try {
    // Restore base64 padding and chars
    let base64 = encoded
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const binary = atob(base64);
    const utf8Str = decodeURIComponent(
      Array.prototype.map.call(binary, (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    
    return JSON.parse(utf8Str);
  } catch (err) {
    console.error('Error decoding contract data', err);
    return null;
  }
}

/**
 * Helper to calculate total rental price
 */
export function calculateContractPrice(
  startDateStr: string,
  endDateStr: string,
  dailyPrice: number,
  cleaningFee: number
): { days: number; rentalTotal: number; grandTotal: number } {
  if (!startDateStr || !endDateStr) {
    return { days: 0, rentalTotal: 0, grandTotal: 0 };
  }
  
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  // Calculate difference in days (inclusive, i.e., at least 1 day)
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  
  const rentalTotal = diffDays * dailyPrice;
  const grandTotal = rentalTotal + cleaningFee;
  
  return {
    days: diffDays,
    rentalTotal,
    grandTotal
  };
}

/**
 * Default settings for the owner's single campervan
 */
export const DEFAULT_SETTINGS: CampervanSettings = {
  brand: "Ahorn",
  model: "Canada TU Plus",
  plateNumber: "7AM 8243",
  year: 2023,
  dailyPrice: 3200,
  deposit: 30000,
  cleaningFee: 1500,
  kmLimitPerDay: 300,
  kmOverLimitPrice: 6,
  ownerName: "Petr Svoboda",
  ownerId: "12345678",
  ownerAddress: "Slunečná 45, 100 00 Praha 10",
  ownerPhone: "+420 777 888 999",
  ownerEmail: "info@obytkem.cz",
  ownerBank: "123456789/0100 (Komerční banka)"
};

/**
 * Helper to get settings from localStorage
 */
export function getStoredSettings(): CampervanSettings {
  try {
    const stored = localStorage.getItem('obytkem_settings');
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error('Error reading settings', err);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Helper to save settings to localStorage
 */
export function saveStoredSettings(settings: CampervanSettings): void {
  try {
    localStorage.setItem('obytkem_settings', JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings', err);
  }
}
