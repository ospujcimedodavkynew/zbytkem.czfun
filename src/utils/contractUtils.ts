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
  dailyPrice: number = 3200,
  cleaningFee: number = 1500
): { days: number; rentalTotal: number; grandTotal: number } {
  const safeDailyPrice = typeof dailyPrice === 'number' && !isNaN(dailyPrice) ? dailyPrice : (DEFAULT_SETTINGS?.dailyPrice || 3200);
  const safeCleaningFee = typeof cleaningFee === 'number' && !isNaN(cleaningFee) ? cleaningFee : (DEFAULT_SETTINGS?.cleaningFee || 1500);

  if (!startDateStr || !endDateStr) {
    return { days: 0, rentalTotal: 0, grandTotal: 0 };
  }
  
  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { days: 0, rentalTotal: 0, grandTotal: 0 };
    }

    // Calculate difference in days (inclusive, i.e., at least 1 day)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const rentalTotal = diffDays * safeDailyPrice;
    const grandTotal = rentalTotal + safeCleaningFee;
    
    return {
      days: diffDays,
      rentalTotal,
      grandTotal
    };
  } catch {
    return { days: 0, rentalTotal: 0, grandTotal: 0 };
  }
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
  bufferHours: 1.5,
  ownerName: "Petr Svoboda",
  ownerId: "12345678",
  ownerAddress: "Slunečná 45, 100 00 Praha 10",
  ownerPhone: "+420 777 888 999",
  ownerEmail: "info@obytkem.cz",
  ownerBank: "123456789/0100 (Komerční banka)",
  adminPassword: "obytkem2026"
};

/**
 * Converts date string "YYYY-MM-DD" and time string "HH:MM" into a Date timestamp (ms)
 */
export function parseDateTime(dateStr: string, timeStr?: string): number {
  if (!dateStr) return 0;
  const time = timeStr && timeStr.trim() !== '' ? timeStr.trim() : '10:00';
  const isoStr = `${dateStr}T${time.length === 5 ? time : '10:00'}:00`;
  const parsed = new Date(isoStr);
  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

export interface RentalPeriod {
  id?: string;
  startDate: string;
  startTime?: string;
  endDate: string;
  endTime?: string;
}

/**
 * Checks if a proposed rental period collides with existing rental periods,
 * taking into account a service buffer gap (in hours) for cleaning and preparation.
 */
export function checkRentalCollision(
  proposed: RentalPeriod,
  existingList: RentalPeriod[],
  bufferHours: number = 1.5,
  excludeId?: string
): { hasCollision: boolean; conflictingRental?: RentalPeriod; message?: string } {
  if (!proposed.startDate || !proposed.endDate) {
    return { hasCollision: false };
  }

  const propStart = parseDateTime(proposed.startDate, proposed.startTime || '10:00');
  const propEnd = parseDateTime(proposed.endDate, proposed.endTime || '10:00');

  if (propStart <= 0 || propEnd <= 0 || propEnd <= propStart) {
    return { hasCollision: false };
  }

  const bufferMs = (bufferHours || 0) * 3600 * 1000;

  for (const existing of existingList) {
    if (excludeId && existing.id === excludeId) continue;
    if (!existing.startDate || !existing.endDate) continue;

    const existStart = parseDateTime(existing.startDate, existing.startTime || '10:00');
    const existEnd = parseDateTime(existing.endDate, existing.endTime || '10:00');

    if (existStart <= 0 || existEnd <= 0) continue;

    // Overlap condition considering buffer pause
    if (propStart < (existEnd + bufferMs) && (propEnd + bufferMs) > existStart) {
      const bufferText = bufferHours > 0 ? ` (včetně servisní pauzy ${bufferHours} h pro úklid a přípravu)` : '';
      return {
        hasCollision: true,
        conflictingRental: existing,
        message: `Vybraný termín koliduje s jinou rezervací od ${existing.startDate} (${existing.startTime || '10:00'}) do ${existing.endDate} (${existing.endTime || '10:00'})${bufferText}.`
      };
    }
  }

  return { hasCollision: false };
}

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
