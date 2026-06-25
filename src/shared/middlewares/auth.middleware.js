import jwt from 'jsonwebtoken';
import env from '../../config/env.js';
import { UnauthorizedError } from '../errors/index.js';

export const signToken = (payload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

export const authenticate = (req, _res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication required');
    }

    const token = header.slice(7);
    req.user = verifyToken(token);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Invalid or expired token'));
      return;
    }
    next(error);
  }
};
