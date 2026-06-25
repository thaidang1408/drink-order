import prisma from '../../infrastructure/database/prisma.client.js';

class AuthRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        stores: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }
}

export default new AuthRepository();
