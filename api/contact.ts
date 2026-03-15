import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Chybí povinná pole' });
  }

  try {
    // 1. Uložení do Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { 
          name, 
          email, 
          phone, 
          subject: subject || 'Dotaz z webu', 
          message,
          status: 'new'
        }
      ])
      .select();

    if (error) throw error;

    // 2. Tady by následovalo odeslání e-mailu (např. přes Resend nebo SendGrid)
    // Prozatím logujeme, v ostré verzi nastavíme SMTP nebo API klíč
    console.log(`Nový dotaz od ${name} (${email}): ${message}`);

    res.status(200).json({ status: 'ok', message: 'Zpráva byla úspěšně odeslána' });
  } catch (error) {
    console.error('Chyba při ukládání zprávy:', error);
    res.status(500).json({ error: 'Chyba při odesílání zprávy' });
  }
}
