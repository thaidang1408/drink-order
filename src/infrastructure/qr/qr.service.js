import QRCode from 'qrcode';
import env from '../../config/env.js';

const normalizeBaseUrl = (url) => String(url || '').trim().replace(/\/+$/, '');

export const buildStoreMenuUrl = (slug, table) => {
  const base = `${normalizeBaseUrl(env.frontendUrl)}/store/${slug}`;
  const tableValue = table != null ? String(table).trim() : '';

  if (tableValue) {
    return `${base}?table=${encodeURIComponent(tableValue)}`;
  }

  return base;
};

export const generateStoreQRDataUrl = async (slug, table) => {
  const menuUrl = buildStoreMenuUrl(slug, table);

  const dataUrl = await QRCode.toDataURL(menuUrl, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#1c1917', light: '#ffffff' },
  });

  return { menuUrl, dataUrl };
};

export const generateStoreQRBuffer = async (slug, table) => {
  const menuUrl = buildStoreMenuUrl(slug, table);

  const buffer = await QRCode.toBuffer(menuUrl, {
    type: 'png',
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: { dark: '#1c1917', light: '#ffffff' },
  });

  return { menuUrl, buffer };
};
