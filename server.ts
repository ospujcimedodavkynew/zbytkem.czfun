import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({
    origin: '*', // V produkci zde můžete dát konkrétní doménu vašeho webu
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json());

  // Testovací endpoint pro ověření funkčnosti API
  app.get("/api/ping", (req, res) => {
    res.json({ status: "ok", message: "API is alive", timestamp: new Date().toISOString() });
  });

  // API endpoint pro data o obsazenosti
  app.get("/api/availability", (req, res) => {
    // ... existující kód ...
    const reservations = [
      { startDate: '2026-05-10', endDate: '2026-05-15', status: 'confirmed' },
      { startDate: '2026-06-01', endDate: '2026-06-14', status: 'confirmed' },
      { startDate: '2026-07-15', endDate: '2026-07-25', status: 'confirmed' },
      { startDate: '2026-08-05', endDate: '2026-08-12', status: 'confirmed' }
    ];

    res.json({
      status: "ok",
      reservations: reservations
    });
  });

  // API endpoint pro kontakt
  app.post("/api/contact", async (req, res) => {
    console.log('Přijat požadavek na /api/contact:', req.body);
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Chybí povinná pole (jméno, email nebo zpráva)' });
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('CHYBA: Chybí konfigurace Supabase v proměnných prostředí!');
        return res.status(500).json({ 
          error: 'Server není správně nakonfigurován (chybí API klíče k databázi)',
          details: 'Ujistěte se, že jste v AI Studiu nastavili SUPABASE_URL a SUPABASE_ANON_KEY.'
        });
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { error } = await supabase
        .from('messages')
        .insert([
          { 
            name, 
            email, 
            phone: phone || null, 
            subject: subject || 'Dotaz z webu', 
            message,
            status: 'new'
          }
        ]);

      if (error) {
        console.error('Supabase Error:', error);
        return res.status(500).json({ error: 'Chyba při ukládání do databáze', details: error.message });
      }

      res.status(200).json({ status: 'ok', message: 'Zpráva byla úspěšně odeslána' });
    } catch (error: any) {
      console.error('Neočekávaná chyba:', error);
      res.status(500).json({ error: 'Neočekávaná chyba serveru', details: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
