
import { createClient } from '@supabase/supabase-js';

// Bezpečné načtení klíčů s fallbackem na prázdný řetězec
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Inicializace klienta pouze pokud jsou klíče přítomny
// Používáme try-catch pro zachycení nevalidních URL formátů
let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://')) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn("Supabase inicializace selhala: Nevalidní konfigurace.");
  }
}

export const supabase = supabaseInstance;

// Informování do konzole v neagresivním formátu
if (!supabase) {
  console.info("💡 obytkem.cz běží v Demo režimu (bez Supabase). Pro ostrý provoz nastavte SUPABASE_URL a SUPABASE_ANON_KEY.");
}
