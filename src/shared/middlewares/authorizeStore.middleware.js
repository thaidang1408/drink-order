import prisma from '../../infrastructure/database/prisma.client.js';
import { ForbiddenError, NotFoundError } from '../errors/index.js';

export const authorizeStore = async (req, _res, next) => {
  try {
    const { storeId } = req.params;

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerId: req.user.userId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!store) {
      throw new NotFoundError('Store not found');
    }

    req.store = store;
    next();
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(new ForbiddenError('You do not have access to this store'));
      return;
    }
    next(error);
  }
};
