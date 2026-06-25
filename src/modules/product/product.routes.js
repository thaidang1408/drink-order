import { Router } from 'express';
import productController from './product.controller.js';

const router = Router();

router.get('/health', productController.healthCheck);

// TODO: register product routes

export default router;
