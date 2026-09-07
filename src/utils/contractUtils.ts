import { ContractData, CampervanSettings, ExtraAddon, SelectedAddon } from '../types';

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
 * Calculates rental days count taking into account calendar days and return time.
 * In campervan rentals:
 * - Base days are inclusive calendar days (e.g., 9.9. to 11.9. = 3 days).
 * - If the return time on the final day is significantly later than the pickup time
 *   (e.g., pickup at 10:00 but return at 20:00), an additional rental day (+1 day) is charged.
 */
export function calculateRentalDays(
  startDateStr: string,
  endDateStr: string,
  startTimeStr: string = '10:00',
  endTimeStr: string = '10:00'
): { days: number; baseDays: number; hasExtraDay: boolean } {
  if (!startDateStr || !endDateStr) {
    return { days: 0, baseDays: 0, hasExtraDay: false };
  }

  try {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return { days: 0, baseDays: 0, hasExtraDay: false };
    }

    // Inclusive calendar days (e.g. 9.9. to 11.9. = 3 days)
    const diffTime = end.getTime() - start.getTime();
    const baseDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Parse start and end time (format HH:MM)
    const [startH, startM] = (startTimeStr || '10:00').split(':').map(v => parseInt(v, 10) || 0);
    const [endH, endM] = (endTimeStr || '10:00').split(':').map(v => parseInt(v, 10) || 0);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    // If return time is later than pickup time by more than 60 minutes, an extra day is charged
    let hasExtraDay = false;
    if (baseDays > 1 && (endMinutes - startMinutes) > 60) {
      hasExtraDay = true;
    }

    const totalDays = Math.max(1, baseDays + (hasExtraDay ? 1 : 0));

    return {
      days: totalDays,
      baseDays,
      hasExtraDay
    };
  } catch {
    return { days: 0, baseDays: 0, hasExtraDay: false };
  }
}

export const DEFAULT_ADDONS: ExtraAddon[] = [
  {
    id: 'bike-rack',
    name: 'Nosič kol (pro 4 jízdní kola)',
    description: 'Uzamykatelný nosič na zadní stěnu vozu pro bezpečnou přepravu až 4 kol',
    price: 500,
    priceType: 'flat',
    icon: 'bike'
  },
  {
    id: 'camping-bbq',
    name: 'Kempingový plynový gril Cadac',
    description: 'Kompaktní gril včetně plynové kartuše pro venkovní grilování',
    price: 400,
    priceType: 'flat',
    icon: 'flame'
  },
  {
    id: 'paddleboard',
    name: 'Nafukovací Paddleboard (SUP) + pádlo',
    description: 'Kompletní set včetně pumpy a vaku pro vodní radovánky',
    price: 250,
    priceType: 'per_day',
    icon: 'waves'
  },
  {
    id: 'bedding-set',
    name: 'Set lůžkovin a ručníků pro celou posádku',
    description: 'Vypraná a voňavá prostěradla, povlečení, polštáře a osušky',
    price: 600,
    priceType: 'flat',
    icon: 'bed'
  },
  {
    id: 'camping-set-extra',
    name: 'Rozšířený kempingový set (stůl + 4 křesla)',
    description: 'Polohovatelná křesla a stabilní velký stůl pod markýzu',
    price: 300,
    priceType: 'flat',
    icon: 'armchair'
  }
];

/**
 * Determines seasonal daily price based on start date
 * Peak season: June 15 - September 15
 * Off season: October - April
 * Standard season: May - June 14, September 16 - September 30
 */
export function getSeasonalDailyPrice(dateStr: string, settings: CampervanSettings): number {
  if (!dateStr) return settings.dailyPrice;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return settings.dailyPrice;
    const month = d.getMonth() + 1; // 1-12
    const day = d.getDate();

    // Peak season: 15.6. - 15.9.
    if ((month === 6 && day >= 15) || month === 7 || month === 8 || (month === 9 && day <= 15)) {
      return settings.peakSeasonPrice || (settings.dailyPrice + 600);
    }
    // Off season: 1.10. - 30.4.
    if (month >= 10 || month <= 4) {
      return settings.offSeasonPrice || Math.max(2200, settings.dailyPrice - 500);
    }
    // Standard / Mid season
    return settings.dailyPrice;
  } catch {
    return settings.dailyPrice;
  }
}

/**
 * Calculates total rental price taking into account dates, times, seasonal pricing and addons
 */
export function calculateContractPrice(
  startDateStr: string,
  endDateStr: string,
  dailyPrice: number = 3200,
  cleaningFee: number = 1500,
  startTimeStr: string = '10:00',
  endTimeStr: string = '10:00',
  offSeasonPrice?: number,
  peakSeasonPrice?: number,
  selectedAddons: (ExtraAddon | SelectedAddon)[] = []
): { 
  days: number; 
  baseDays: number; 
  hasExtraDay: boolean; 
  effectiveDailyPrice: number;
  rentalTotal: number; 
  addonsTotal: number;
  grandTotal: number;
} {
  let effectiveDailyPrice = typeof dailyPrice === 'number' && !isNaN(dailyPrice) ? dailyPrice : (DEFAULT_SETTINGS?.dailyPrice || 3200);

  // Apply seasonal pricing if date provided and seasonal rates configured
  if (startDateStr) {
    try {
      const d = new Date(startDateStr);
      if (!isNaN(d.getTime())) {
        const month = d.getMonth() + 1; // 1-12
        const day = d.getDate();
        // Peak: 15.6. - 15.9.
        if ((month === 6 && day >= 15) || month === 7 || month === 8 || (month === 9 && day <= 15)) {
          if (peakSeasonPrice && !isNaN(peakSeasonPrice) && peakSeasonPrice > 0) {
            effectiveDailyPrice = peakSeasonPrice;
          }
        } 
        // Off-season: 1.10. - 30.4.
        else if (month >= 10 || month <= 4) {
          if (offSeasonPrice && !isNaN(offSeasonPrice) && offSeasonPrice > 0) {
            effectiveDailyPrice = offSeasonPrice;
          }
        }
      }
    } catch {
      // Keep standard daily price
    }
  }

  const safeCleaningFee = typeof cleaningFee === 'number' && !isNaN(cleaningFee) ? cleaningFee : (DEFAULT_SETTINGS?.cleaningFee || 1500);

  const { days, baseDays, hasExtraDay } = calculateRentalDays(startDateStr, endDateStr, startTimeStr, endTimeStr);

  if (days <= 0) {
    return { days: 0, baseDays: 0, hasExtraDay: false, effectiveDailyPrice, rentalTotal: 0, addonsTotal: 0, grandTotal: 0 };
  }

  const rentalTotal = days * effectiveDailyPrice;
  
  let addonsTotal = 0;
  if (Array.isArray(selectedAddons)) {
    selectedAddons.forEach(addon => {
      if (addon.priceType === 'per_day') {
        addonsTotal += (addon.price || 0) * days;
      } else {
        addonsTotal += (addon.price || 0);
      }
    });
  }

  const grandTotal = rentalTotal + safeCleaningFee + addonsTotal;

  return {
    days,
    baseDays,
    hasExtraDay,
    effectiveDailyPrice,
    rentalTotal,
    addonsTotal,
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
