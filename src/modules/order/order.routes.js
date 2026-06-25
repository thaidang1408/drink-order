import { Router } from 'express';
import { validate } from '../../shared/middlewares/index.js';
import orderController from './order.controller.js';
import { createOrderSchema, trackOrderParamSchema } from './order.validator.js';

const router = Router();

router.get('/health', orderController.healthCheck);
router.get('/track/:orderNumber', validate(trackOrderParamSchema, 'params'), orderController.track);
router.post('/', validate(createOrderSchema), orderController.create);
export default router;
