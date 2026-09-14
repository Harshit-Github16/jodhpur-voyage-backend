import ApiError from '../utils/ApiError.js';
import { STATUS_CODES } from '../constants/statusCodes.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    if (schema.body) dataToValidate.body = req.body;
    if (schema.query) dataToValidate.query = req.query;
    if (schema.params) dataToValidate.params = req.params;

    if (schema.shape) {
      // Direct schema passed for body
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
      if (schema.body) {
        const parsed = schema.body.safeParse(req.body);
        if (!parsed.success) {
          const errors = parsed.error.issues.map(
            (i) => `${i.path.join('.')}: ${i.message}`
          );
          return next(new ApiError(STATUS_CODES.BAD_REQUEST, errors[0], errors));
        }
        req.body = parsed.data;
      }
      if (schema.query) {
        const parsed = schema.query.safeParse(req.query);
        if (!parsed.success) {
          const errors = parsed.error.issues.map(
            (i) => `${i.path.join('.')}: ${i.message}`
          );
          return next(new ApiError(STATUS_CODES.BAD_REQUEST, errors[0], errors));
        }
        req.query = parsed.data;
      }
      if (schema.params) {
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
