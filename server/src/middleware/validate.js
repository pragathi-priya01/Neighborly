import { ApiError } from '../utils/apiError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return next(ApiError.unprocessable(errorMessages[0] || 'Validation failed', errorMessages));
      }
      return next(ApiError.badRequest(err.message));
    }
  };
};
