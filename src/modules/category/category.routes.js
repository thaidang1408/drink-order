import { Router } from 'express';
import categoryController from './category.controller.js';

const router = Router();

router.get('/health', categoryController.healthCheck);

// TODO: register category routes

export default router;
