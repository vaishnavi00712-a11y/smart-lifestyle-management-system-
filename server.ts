import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS middleware for safety
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Mount primary API routers
  app.use('/api', apiRouter);

  // Central error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error occurred.',
    });
  });

  // Vite middleware in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Lifestyle Management Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
