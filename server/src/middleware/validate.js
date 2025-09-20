const { failure } = require('../utils/response');

const validate = (schema, property = 'body') => (req, res, next) => {
  try {
    const parsed = schema.parse(req[property]);
    req[property] = parsed;
    next();
  } catch (error) {
    const issues = error.errors?.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message
    }));
    return failure(res, 422, 'Validation error', issues);
  }
};

module.exports = validate;
