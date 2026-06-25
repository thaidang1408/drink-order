import { ZodError } from 'zod';
import { BadRequestError } from '../errors/index.js';

const formatZodError = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));

export const validate = (schema, source = 'body') => (req, _res, next) => {
  try {
    const parsed = schema.parse(req[source]);

    if (source === 'query') {
      // Express 5: req.query is read-only — store parsed values separately
      req.validatedQuery = parsed;
    } else {
      req[source] = parsed;
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(new BadRequestError('Validation failed', 'VALIDATION_ERROR', formatZodError(error)));
      return;
    }
    next(error);
  }
};
