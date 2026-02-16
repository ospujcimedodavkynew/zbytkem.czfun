
import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  try {
    return typeof process !== 'undefined' ? process.env?.[key] : '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL') || '';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || '';

// Inicializace klienta - pokud chybí klíče, vrací null a App.tsx přejde do demo režimu
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn("Upozornění: Supabase klíče nejsou nastaveny. Aplikace běží v DEMO režimu.");
}
