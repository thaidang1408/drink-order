import { Router } from 'express';
import { API_PREFIX } from '../shared/constants/index.js';
import { authRoutes } from '../modules/auth/index.js';
import { storeRoutes, publicStoreRoutes } from '../modules/store/index.js';
import { categoryRoutes } from '../modules/category/index.js';
import { productRoutes } from '../modules/product/index.js';
import { orderRoutes } from '../modules/order/index.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/store', publicStoreRoutes);
router.use('/stores', storeRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export const registerRoutes = (app) => {
  app.use(API_PREFIX, router);
};

export default router;
