import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import appConfig from './config/index.js';
import env from './config/env.js';
import { registerRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler } from './shared/middlewares/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createApp = () => {
  const app = express();

  // Fix //store/... URLs (from trailing slash in FRONTEND_URL) so SPA routes match
  app.use((req, res, next) => {
    const [pathname, ...rest] = req.originalUrl.split('?');
    const query = rest.length ? `?${rest.join('?')}` : '';
    const normalizedPath = pathname.replace(/\/{2,}/g, '/');

    if (normalizedPath !== pathname) {
      res.redirect(301, `${normalizedPath}${query}`);
      return;
    }

    next();
  });

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
        connectSrc: ["'self'", 'wss:', 'ws:'],
      },
    },
  }));
  app.use(cors(appConfig.cors));
  app.use(morgan(appConfig.nodeEnv === 'development' ? 'dev' : 'combined'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  registerRoutes(app);

  if (env.isProduction) {
    const frontendDist = path.resolve(__dirname, '../frontend/dist');
    app.use(express.static(frontendDist));

    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
