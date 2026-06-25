import { Router } from 'express';
import { validate } from '../../shared/middlewares/index.js';
import storeController from './store.controller.js';
import { slugParamSchema, tableQuerySchema } from './store.validator.js';

const router = Router();

router.get('/health', storeController.healthCheck);

export default router;

export const publicStoreRoutes = Router();

publicStoreRoutes.get(
  '/:slug/menu',
  validate(slugParamSchema, 'params'),
  storeController.getMenu,
);

publicStoreRoutes.get(
  '/:slug/qr',
  validate(slugParamSchema, 'params'),
  validate(tableQuerySchema, 'query'),
  storeController.getQR,
);

publicStoreRoutes.get(
  '/:slug/qr/download',
  validate(slugParamSchema, 'params'),
  validate(tableQuerySchema, 'query'),
  storeController.downloadQR,
);
