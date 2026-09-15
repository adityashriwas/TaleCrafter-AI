import ApiError from '../utils/ApiError.js';

export const validate = schema => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return next(
      new ApiError(
        400,
        'Validation failed',
        result.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        }))
      )
    );
  }

  req.validated = result.data;
  return next();
};
