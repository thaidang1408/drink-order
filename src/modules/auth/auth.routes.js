import { Router } from 'express';
import { validate } from '../../shared/middlewares/index.js';
import authController, { authenticate } from './auth.controller.js';
import { loginSchema } from './auth.validator.js';

const router = Router();

router.get('/health', authController.healthCheck);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

export default router;
