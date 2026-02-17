
import { createClient } from '@supabase/supabase-js';

// Načtení klíčů
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

// Inicializujeme pouze pokud URL existuje, začíná https a NENÍ to placeholder z příkladu
const isPlaceholder = supabaseUrl.includes('vaskod.supabase.co');

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://') && !isPlaceholder) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn("Supabase inicializace selhala: Nevalidní konfigurace.");
  }
}

export const supabase = supabaseInstance;

if (!supabase) {
  console.info("💡 obytkem.cz: Detekován Demo režim. Veškeré rezervace budou zpracovány pouze lokálně (bez uložení do DB).");
}
