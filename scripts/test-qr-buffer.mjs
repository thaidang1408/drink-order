import dotenv from 'dotenv';
import storeService from '../src/modules/store/store.service.js';
import prisma from '../src/infrastructure/database/prisma.client.js';

dotenv.config();

const store = await prisma.store.findFirst({ where: { slug: 'demo-cafe' } });

try {
  const result = await storeService.getQRDownloadByStoreId(store.id, null);
  console.log('ok', result.buffer?.length, result.menuUrl);
} catch (e) {
  console.error('error', e);
}

await prisma.$disconnect();
