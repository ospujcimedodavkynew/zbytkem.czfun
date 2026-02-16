
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Inicializace klienta - pokud chybí klíče, vrací null a App.tsx přejde do demo režimu
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn("Upozornění: Supabase klíče nejsou nastaveny. Aplikace běží v DEMO režimu.");
}
