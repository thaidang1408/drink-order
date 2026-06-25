import { Router } from 'express';
import {
  authenticate,
  authorizeStore,
  handleUpload,
  uploadSingleImage,
  validate,
} from '../shared/middlewares/index.js';
import orderController from '../modules/order/order.controller.js';
import categoryController from '../modules/category/category.controller.js';
import productController from '../modules/product/product.controller.js';
import optionGroupController from '../modules/option-group/option-group.controller.js';
import storeController from '../modules/store/store.controller.js';
import uploadController from '../modules/upload/upload.controller.js';
import {
  orderIdParamSchema,
  storeIdParamSchema,
  updateOrderStatusSchema,
} from '../modules/order/order.validator.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../modules/category/category.validator.js';
import {
  createProductSchema,
  productIdParamSchema,
  updateProductSchema,
} from '../modules/product/product.validator.js';
import {
  createOptionGroupSchema,
  createOptionSchema,
  optionGroupIdParamSchema,
  optionIdParamSchema,
  updateOptionGroupSchema,
  updateOptionSchema,
} from '../modules/option-group/option-group.validator.js';
import { updatePaymentSettingsSchema, updateStoreSettingsSchema, tableQuerySchema } from '../modules/store/store.validator.js';

const router = Router();

router.use(authenticate);

const storeRouter = Router({ mergeParams: true });
storeRouter.use(validate(storeIdParamSchema, 'params'), authorizeStore);

storeRouter.get('/settings', storeController.getStoreSettings);
storeRouter.put(
  '/settings',
  validate(updateStoreSettingsSchema),
  storeController.updateStoreSettings,
);
storeRouter.get('/stats', orderController.getStats);
storeRouter.get('/qr/batch', storeController.getAdminQRBatch);
storeRouter.get(
  '/qr/download',
  validate(tableQuerySchema, 'query'),
  storeController.downloadAdminQR,
);
storeRouter.get('/qr', validate(tableQuerySchema, 'query'), storeController.getAdminQR);
storeRouter.get('/payment-settings', storeController.getPaymentSettings);
storeRouter.put(
  '/payment-settings',
  validate(updatePaymentSettingsSchema),
  storeController.updatePaymentSettings,
);
storeRouter.post('/upload', handleUpload(uploadSingleImage), uploadController.upload);
storeRouter.get('/orders', orderController.listByStore);
storeRouter.patch(
  '/orders/:orderId/status',
  validate(orderIdParamSchema, 'params'),
  validate(updateOrderStatusSchema),
  orderController.updateStatus,
);

storeRouter.get('/categories', categoryController.list);
storeRouter.post('/categories', validate(createCategorySchema), categoryController.create);
storeRouter.put(
  '/categories/:categoryId',
  validate(categoryIdParamSchema, 'params'),
  validate(updateCategorySchema),
  categoryController.update,
);
storeRouter.delete(
  '/categories/:categoryId',
  validate(categoryIdParamSchema, 'params'),
  categoryController.remove,
);

storeRouter.get('/products', productController.list);
storeRouter.post('/products', validate(createProductSchema), productController.create);
storeRouter.put(
  '/products/:productId',
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema),
  productController.update,
);
storeRouter.delete(
  '/products/:productId',
  validate(productIdParamSchema, 'params'),
  productController.remove,
);

storeRouter.get('/option-groups', optionGroupController.list);
storeRouter.post(
  '/option-groups',
  validate(createOptionGroupSchema),
  optionGroupController.create,
);
storeRouter.put(
  '/option-groups/:groupId',
  validate(optionGroupIdParamSchema, 'params'),
  validate(updateOptionGroupSchema),
  optionGroupController.update,
);
storeRouter.delete(
  '/option-groups/:groupId',
  validate(optionGroupIdParamSchema, 'params'),
  optionGroupController.remove,
);
storeRouter.post(
  '/option-groups/:groupId/options',
  validate(optionGroupIdParamSchema, 'params'),
  validate(createOptionSchema),
  optionGroupController.createOption,
);
storeRouter.put(
  '/option-groups/:groupId/options/:optionId',
  validate(optionIdParamSchema, 'params'),
  validate(updateOptionSchema),
  optionGroupController.updateOption,
);
storeRouter.delete(
  '/option-groups/:groupId/options/:optionId',
  validate(optionIdParamSchema, 'params'),
  optionGroupController.removeOption,
);

router.use('/stores/:storeId', storeRouter);

export default router;
