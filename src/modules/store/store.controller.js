import { asyncHandler } from '../../shared/middlewares/index.js';
import { sendSuccess } from '../../shared/utils/index.js';
import storeService from './store.service.js';

class StoreController {
  constructor(service) {
    this.service = service;
  }

  healthCheck = asyncHandler(async (_req, res) => {
    sendSuccess(res, { module: 'store', status: 'ok' });
  });

  getMenu = asyncHandler(async (req, res) => {
    const menu = await this.service.getMenuBySlug(req.params.slug);
    sendSuccess(res, menu);
  });

  getQR = asyncHandler(async (req, res) => {
    const qr = await this.service.getQRBySlug(req.params.slug, req.query.table);
    sendSuccess(res, qr);
  });

  downloadQR = asyncHandler(async (req, res) => {
    const table = req.query.table?.trim();
    const { buffer } = await this.service.getQRDownloadBySlug(req.params.slug, table);
    const suffix = table ? `-ban-${table}` : '';
    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="qr-${req.params.slug}${suffix}.png"`,
    );
    res.send(buffer);
  });

  getStoreSettings = asyncHandler(async (req, res) => {
    const settings = await this.service.getStoreSettings(req.params.storeId);
    sendSuccess(res, settings);
  });

  updateStoreSettings = asyncHandler(async (req, res) => {
    const settings = await this.service.updateStoreSettings(req.params.storeId, req.body);
    sendSuccess(res, settings);
  });

  getAdminQR = asyncHandler(async (req, res) => {
    const qr = await this.service.getQRByStoreId(req.params.storeId, req.query.table);
    sendSuccess(res, qr);
  });

  getAdminQRBatch = asyncHandler(async (req, res) => {
    const batch = await this.service.getAllTableQRs(req.params.storeId);
    sendSuccess(res, batch);
  });

  downloadAdminQR = asyncHandler(async (req, res) => {
    const store = req.store;
    const table = req.query.table?.trim();
    const { buffer } = await this.service.getQRDownloadByStoreId(req.params.storeId, table);
    const suffix = table ? `-ban-${table}` : '';
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="qr-${store.slug}${suffix}.png"`);
    res.send(buffer);
  });

  getPaymentSettings = asyncHandler(async (req, res) => {
    const settings = await this.service.getPaymentSettings(req.params.storeId);
    sendSuccess(res, settings);
  });

  updatePaymentSettings = asyncHandler(async (req, res) => {
    const settings = await this.service.updatePaymentSettings(req.params.storeId, req.body);
    sendSuccess(res, settings);
  });
}

export default new StoreController(storeService);
