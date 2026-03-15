import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API endpoint pro data o obsazenosti
  app.get("/api/availability", (req, res) => {
    // V demo režimu vracíme data z mockData
    // V reálné verzi by zde bylo napojení na Supabase
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
