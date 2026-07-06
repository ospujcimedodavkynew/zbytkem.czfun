import { createClient } from '@supabase/supabase-js';
import { CampervanSettings, ContractData, ReservationInquiry } from '../types';
import { DEFAULT_SETTINGS } from '../utils/contractUtils';

// Read public environment variables from Vite
const supabaseUrl = 
  (import.meta as any).env?.VITE_SUPABASE_URL || 
  (typeof process !== 'undefined' && (process as any).env?.VITE_SUPABASE_URL) || 
  (typeof process !== 'undefined' && (process as any).env?.SUPABASE_URL) || 
  '';

const supabaseAnonKey = 
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 
  (typeof process !== 'undefined' && (process as any).env?.VITE_SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && (process as any).env?.SUPABASE_ANON_KEY) || 
  '';

// Detect if Supabase is properly configured
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '';

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isSupabaseConfigured) {
  console.log('🔌 Supabase client successfully configured for Obytkem.cz');
} else {
  console.warn('⚠️ Supabase credentials missing. App running in Offline / LocalStorage mode.');
}

// Generate RFC4122 v4 compliant UUID
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ====================================================================
// MAPPING FUNCTIONS: TypeScript (camelCase) <-> Database (snake_case)
// ====================================================================

function mapSettingsToDb(settings: CampervanSettings) {
  return {
    brand: settings.brand,
    model: settings.model,
    plate_number: settings.plateNumber,
    year: settings.year,
    daily_price: settings.dailyPrice,
    deposit: settings.deposit,
    cleaning_fee: settings.cleaningFee,
    km_limit_per_day: settings.kmLimitPerDay,
    km_over_limit_price: settings.kmOverLimitPrice,
    owner_name: settings.ownerName,
    owner_id: settings.ownerId,
    owner_address: settings.ownerAddress,
    owner_phone: settings.ownerPhone,
    owner_email: settings.ownerEmail,
    owner_bank: settings.ownerBank
  };
}

function mapSettingsFromDb(db: any): CampervanSettings {
  return {
    brand: db.brand || DEFAULT_SETTINGS.brand,
    model: db.model || DEFAULT_SETTINGS.model,
    plateNumber: db.plate_number || DEFAULT_SETTINGS.plateNumber,
    year: Number(db.year) || DEFAULT_SETTINGS.year,
    dailyPrice: Number(db.daily_price) || DEFAULT_SETTINGS.dailyPrice,
    deposit: Number(db.deposit) || DEFAULT_SETTINGS.deposit,
    cleaningFee: Number(db.cleaning_fee) || DEFAULT_SETTINGS.cleaningFee,
    kmLimitPerDay: Number(db.km_limit_per_day) ?? DEFAULT_SETTINGS.kmLimitPerDay,
    kmOverLimitPrice: Number(db.km_over_limit_price) || DEFAULT_SETTINGS.kmOverLimitPrice,
    ownerName: db.owner_name || DEFAULT_SETTINGS.ownerName,
    ownerId: db.owner_id || DEFAULT_SETTINGS.ownerId,
    ownerAddress: db.owner_address || DEFAULT_SETTINGS.ownerAddress,
    ownerPhone: db.owner_phone || DEFAULT_SETTINGS.ownerPhone,
    ownerEmail: db.owner_email || DEFAULT_SETTINGS.ownerEmail,
    ownerBank: db.owner_bank || DEFAULT_SETTINGS.ownerBank
  };
}

function mapInquiryToDb(inquiry: Partial<ReservationInquiry>) {
  const result: any = {
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    start_date: inquiry.startDate,
    end_date: inquiry.endDate,
    message: inquiry.message,
    status: inquiry.status
  };

  // Only include ID if it is a valid UUID
  if (inquiry.id && inquiry.id.includes('-')) {
    result.id = inquiry.id;
  }
  return result;
}

function mapInquiryFromDb(db: any): ReservationInquiry {
  return {
    id: db.id,
    createdAt: db.created_at || new Date().toISOString(),
    name: db.name,
    email: db.email,
    phone: db.phone,
    startDate: db.start_date,
    endDate: db.end_date,
    message: db.message || '',
    status: (db.status as 'pending' | 'converted' | 'cancelled') || 'pending'
  };
}

function mapContractToDb(contract: Partial<ContractData>) {
  const result: any = {
    tenant_name: contract.tenantName,
    tenant_birth_date: contract.tenantBirthDate || null,
    tenant_id_number: contract.tenantIdNumber || '',
    tenant_dl_number: contract.tenantDlNumber || '',
    tenant_address: contract.tenantAddress || '',
    tenant_phone: contract.tenantPhone || '',
    tenant_email: contract.tenantEmail || '',
    start_date: contract.startDate,
    end_date: contract.endDate,
    daily_price: contract.dailyPrice,
    deposit: contract.deposit,
    cleaning_fee: contract.cleaningFee,
    km_limit_per_day: contract.kmLimitPerDay,
    km_over_limit_price: contract.kmOverLimitPrice,
    additional_terms: contract.additionalTerms || '',
    owner_signature: contract.ownerSignature || null,
    tenant_signature: contract.tenantSignature || null,
    signed_at: contract.signedAt || null,
    signed_ip: contract.signedIp || null,
    is_signed: !!contract.isSigned
  };

  // Only include ID if it is a valid UUID
  if (contract.id && contract.id.includes('-')) {
    result.id = contract.id;
  }
  return result;
}

function mapContractFromDb(db: any): ContractData {
  return {
    id: db.id,
    createdAt: db.created_at || new Date().toISOString(),
    tenantName: db.tenant_name,
    tenantBirthDate: db.tenant_birth_date || '',
    tenantIdNumber: db.tenant_id_number || '',
    tenantDlNumber: db.tenant_dl_number || '',
    tenantAddress: db.tenant_address || '',
    tenantPhone: db.tenant_phone || '',
    tenantEmail: db.tenant_email || '',
    startDate: db.start_date,
    endDate: db.end_date,
    dailyPrice: Number(db.daily_price),
    deposit: Number(db.deposit),
    cleaningFee: Number(db.cleaning_fee),
    kmLimitPerDay: Number(db.km_limit_per_day),
    kmOverLimitPrice: Number(db.km_over_limit_price),
    additionalTerms: db.additional_terms || '',
    ownerSignature: db.owner_signature || '',
    tenantSignature: db.tenant_signature || '',
    signedAt: db.signed_at || '',
    signedIp: db.signed_ip || '',
    isSigned: !!db.is_signed
  };
}

// ====================================================================
// CORE DATABASE API SERVICE (Transparently handles Supabase or LocalStorage)
// ====================================================================

export const dbService = {
  // 1. CAMPERVAN SETTINGS
  async getSettings(): Promise<CampervanSettings> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('campervan_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) {
          return mapSettingsFromDb(data);
        }
        if (error && error.code !== 'PGRST116') { // PGRST116 is empty table code
          console.error('Error loading settings from Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to get Supabase settings:', err);
      }
    }
    
    // Local storage fallback
    try {
      const stored = localStorage.getItem('obytkem_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (err) {
      console.error('Error reading localStorage settings', err);
    }
    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings: CampervanSettings): Promise<CampervanSettings> {
    // Local storage save first
    try {
      localStorage.setItem('obytkem_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Error writing localStorage settings', err);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapSettingsToDb(settings);
        // Find if there is an existing settings row to update, or insert new
        const { data: existing } = await supabase
          .from('campervan_settings')
          .select('id')
          .limit(1);

        if (existing && existing.length > 0) {
          const { data, error } = await supabase
            .from('campervan_settings')
            .update(dbPayload)
            .eq('id', existing[0].id)
            .select()
            .single();
          if (error) throw error;
          if (data) return mapSettingsFromDb(data);
        } else {
          const { data, error } = await supabase
            .from('campervan_settings')
            .insert(dbPayload)
            .select()
            .single();
          if (error) throw error;
          if (data) return mapSettingsFromDb(data);
        }
      } catch (err) {
        console.error('Failed to save settings to Supabase, fell back to local storage', err);
      }
    }
    return settings;
  },

  // 2. RESERVATION INQUIRIES
  async getInquiries(): Promise<ReservationInquiry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reservation_inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) {
          return data.map(mapInquiryFromDb);
        }
        if (error) throw error;
      } catch (err) {
        console.error('Error fetching inquiries from Supabase:', err);
      }
    }

    // LocalStorage fallback
    try {
      const stored = localStorage.getItem('obytkem_inquiries');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error loading inquiries from localStorage', err);
    }
    return [];
  },

  async saveInquiry(inquiry: Partial<ReservationInquiry>): Promise<ReservationInquiry> {
    const isNew = !inquiry.id || !inquiry.id.includes('-');
    const safeInquiry: ReservationInquiry = {
      id: inquiry.id && inquiry.id.includes('-') ? inquiry.id : generateUUID(),
      createdAt: inquiry.createdAt || new Date().toISOString(),
      name: inquiry.name || '',
      email: inquiry.email || '',
      phone: inquiry.phone || '',
      startDate: inquiry.startDate || '',
      endDate: inquiry.endDate || '',
      message: inquiry.message || '',
      status: inquiry.status || 'pending'
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem('obytkem_inquiries');
      const list: ReservationInquiry[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(item => item.id === safeInquiry.id);
      if (idx !== -1) {
        list[idx] = safeInquiry;
      } else {
        list.unshift(safeInquiry);
      }
      localStorage.setItem('obytkem_inquiries', JSON.stringify(list));
    } catch (err) {
      console.error('LocalStorage write failed:', err);
    }

    // Save to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapInquiryToDb(safeInquiry);
        
        if (isNew) {
          // New inquiry: Use INSERT (compatible with unauthenticated INSERT policy)
          const { data, error } = await supabase
            .from('reservation_inquiries')
            .insert(dbPayload)
            .select()
            .single();
          
          if (error) {
            console.warn('Supabase INSERT finished, check if select succeeded:', error.message);
            // If the insert worked but select failed due to read-level RLS, we still have the record.
            // Since we generated the UUID on the client, we can return the safeInquiry safely.
          }
          if (data) {
            return mapInquiryFromDb(data);
          }
        } else {
          // Existing inquiry (status update, etc.): Use UPSERT
          const { data, error } = await supabase
            .from('reservation_inquiries')
            .upsert(dbPayload)
            .select()
            .single();
          
          if (error) throw error;
          if (data) return mapInquiryFromDb(data);
        }
      } catch (err) {
        console.error('Supabase write failed for inquiry, kept in local storage:', err);
      }
    }

    return safeInquiry;
  },

  async deleteInquiry(id: string): Promise<boolean> {
    // Delete local
    try {
      const stored = localStorage.getItem('obytkem_inquiries');
      if (stored) {
        const list: ReservationInquiry[] = JSON.parse(stored);
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem('obytkem_inquiries', JSON.stringify(filtered));
      }
    } catch (e) {
      console.error(e);
    }

    // Delete Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('reservation_inquiries')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deletion failed:', err);
      }
    }
    return true;
  },

  // 3. CONTRACTS
  async getContracts(): Promise<ContractData[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) {
          return data.map(mapContractFromDb);
        }
        if (error) throw error;
      } catch (err) {
        console.error('Error loading contracts from Supabase:', err);
      }
    }

    // Local fallback
    try {
      const stored = localStorage.getItem('obytkem_contracts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error loading contracts from localStorage', err);
    }
    return [];
  },

  async getContract(id: string): Promise<ContractData | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('contracts')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (data) {
          return mapContractFromDb(data);
        }
        if (error) throw error;
      } catch (err) {
        console.error('Error loading contract from Supabase:', err);
      }
    }

    // Local fallback
    try {
      const stored = localStorage.getItem('obytkem_contracts');
      if (stored) {
        const list: ContractData[] = JSON.parse(stored);
        const found = list.find(item => item.id === id);
        if (found) return found;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  async saveContract(contract: Partial<ContractData>): Promise<ContractData> {
    const isNew = !contract.id || !contract.id.includes('-');
    const safeContract: ContractData = {
      id: contract.id && contract.id.includes('-') ? contract.id : generateUUID(),
      createdAt: contract.createdAt || new Date().toISOString(),
      tenantName: contract.tenantName || '',
      tenantBirthDate: contract.tenantBirthDate || '',
      tenantIdNumber: contract.tenantIdNumber || '',
      tenantDlNumber: contract.tenantDlNumber || '',
      tenantAddress: contract.tenantAddress || '',
      tenantPhone: contract.tenantPhone || '',
      tenantEmail: contract.tenantEmail || '',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      dailyPrice: Number(contract.dailyPrice) || 3200,
      deposit: Number(contract.deposit) || 30000,
      cleaningFee: Number(contract.cleaningFee) || 1500,
      kmLimitPerDay: Number(contract.kmLimitPerDay) || 300,
      kmOverLimitPrice: Number(contract.kmOverLimitPrice) || 6,
      additionalTerms: contract.additionalTerms || '',
      ownerSignature: contract.ownerSignature || '',
      tenantSignature: contract.tenantSignature || '',
      signedAt: contract.signedAt || '',
      signedIp: contract.signedIp || '',
      isSigned: !!contract.isSigned
    };

    // Save local
    try {
      const stored = localStorage.getItem('obytkem_contracts');
      const list: ContractData[] = stored ? JSON.parse(stored) : [];
      const idx = list.findIndex(item => item.id === safeContract.id);
      if (idx !== -1) {
        list[idx] = safeContract;
      } else {
        list.unshift(safeContract);
      }
      localStorage.setItem('obytkem_contracts', JSON.stringify(list));
    } catch (err) {
      console.error('LocalStorage write failed:', err);
    }

    // Save Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const dbPayload = mapContractToDb(safeContract);
        
        if (isNew) {
          const { data, error } = await supabase
            .from('contracts')
            .insert(dbPayload)
            .select()
            .single();
          if (error) throw error;
          if (data) return mapContractFromDb(data);
        } else {
          const { data, error } = await supabase
            .from('contracts')
            .update(dbPayload)
            .eq('id', safeContract.id)
            .select()
            .single();
          if (error) throw error;
          if (data) return mapContractFromDb(data);
        }
      } catch (err) {
        console.error('Supabase write failed for contract, kept in local storage:', err);
      }
    }

    return safeContract;
  },

  async deleteContract(id: string): Promise<boolean> {
    // Delete local
    try {
      const stored = localStorage.getItem('obytkem_contracts');
      if (stored) {
        const list: ContractData[] = JSON.parse(stored);
        const filtered = list.filter(item => item.id !== id);
        localStorage.setItem('obytkem_contracts', JSON.stringify(filtered));
      }
    } catch (e) {
      console.error(e);
    }

    // Delete Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('contracts')
          .delete()
          .eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.error('Supabase deletion failed:', err);
      }
    }
    return true;
  }
};
