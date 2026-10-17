import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Direct APK download route - sends actual APK binary with attachment headers
  app.get('/api/download/apk', (req, res) => {
    const target = (req.query.target as string)?.toLowerCase() === 'admin' ? 'admin' : 'user';
    const fileName = `audivox-${target}-v1.0.0.apk`;
    const filePath = path.resolve(process.cwd(), 'public/downloads', fileName);

    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(filePath);
    } else {
      return res.status(404).json({ error: 'APK file not found on server' });
    }
  });

  // Health probe
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mount Vite middlewares in development
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AudiVox Admin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
