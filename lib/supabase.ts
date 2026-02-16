
import { createClient } from '@supabase/supabase-js';

// Explicitně čteme z process.env
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Inicializace klienta
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.error("KRITICKÁ CHYBA: Supabase klíče (SUPABASE_URL nebo SUPABASE_ANON_KEY) chybí v prostředí!");
}
