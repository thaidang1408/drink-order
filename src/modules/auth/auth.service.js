import bcrypt from 'bcryptjs';
import { UnauthorizedError } from '../../shared/errors/index.js';
import { signToken } from '../../shared/middlewares/auth.middleware.js';
import authRepository from './auth.repository.js';

class AuthService {
  constructor(repository) {
    this.repository = repository;
  }

  async login({ email, password }) {
    const user = await this.repository.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const profile = await this.repository.findById(user.id);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
      },
      stores: profile.stores,
    };
  }

  async getProfile(userId) {
    const user = await this.repository.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      stores: user.stores,
    };
  }
}

export default new AuthService(authRepository);
