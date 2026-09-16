import ApiError from '../utils/ApiError.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const validate = (schema) => (req, res, next) => {
  try {
    if (!schema) return next();

    // Check if schema is a direct Zod Schema (has .safeParse method)
    if (typeof schema.safeParse === 'function') {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessages = parsed.error.issues.map(
          (issue) => `${issue.path.join('.')}: ${issue.message}`
        );
        return next(
          new ApiError(STATUS_CODES.BAD_REQUEST, errorMessages[0], errorMessages)
        );
      }
      req.body = parsed.data;
    } else {
      // Object containing body/query/params schemas
      if (schema.body && typeof schema.body.safeParse === 'function') {
        const parsed = schema.body.safeParse(req.body);
        if (!parsed.success) {
          const errors = parsed.error.issues.map(
            (i) => `${i.path.join('.')}: ${i.message}`
          );
          return next(new ApiError(STATUS_CODES.BAD_REQUEST, errors[0], errors));
        }
        req.body = parsed.data;
      }
      if (schema.query && typeof schema.query.safeParse === 'function') {
        const parsed = schema.query.safeParse(req.query);
        if (!parsed.success) {
          const errors = parsed.error.issues.map(
            (i) => `${i.path.join('.')}: ${i.message}`
          );
          return next(new ApiError(STATUS_CODES.BAD_REQUEST, errors[0], errors));
        }
        req.query = parsed.data;
      }
      if (schema.params && typeof schema.params.safeParse === 'function') {
        const parsed = schema.params.safeParse(req.params);
        if (!parsed.success) {
          const errors = parsed.error.issues.map(
            (i) => `${i.path.join('.')}: ${i.message}`
          );
          return next(new ApiError(STATUS_CODES.BAD_REQUEST, errors[0], errors));
        }
        req.params = parsed.data;
      }
    }

    next();
  } catch (error) {
    next(new ApiError(STATUS_CODES.BAD_REQUEST, error.message));
  }
};

export default validate;

