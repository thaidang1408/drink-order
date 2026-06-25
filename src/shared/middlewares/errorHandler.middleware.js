import env from '../../config/env.js';
import { AppError } from '../errors/index.js';

const handlePrismaError = (err) => {
  switch (err.code) {
    case 'P2002':
      return new AppError('Duplicate field value', 409, 'DUPLICATE_ENTRY');
    case 'P2025':
      return new AppError('Record not found', 404, 'NOT_FOUND');
    case 'P2003':
      return new AppError('Related record not found', 400, 'FOREIGN_KEY_VIOLATION');
    default:
      return new AppError('Database error', 500, 'DATABASE_ERROR');
  }
};

export const errorHandler = (err, _req, res, _next) => {
  let error = err;

  if (err.code?.startsWith('P')) {
    error = handlePrismaError(err);
  }

  if (!(error instanceof AppError)) {
    error = new AppError(
      env.isProduction ? 'Internal server error' : err.message,
      500,
      'INTERNAL_ERROR',
    );
  }

  const response = {
    success: false,
    error: {
      code: error.code,
      message: error.message,
    },
  };

  if (error.details) {
    response.error.details = error.details;
  }

  if (env.isDevelopment && err.stack) {
    response.error.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};
