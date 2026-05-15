const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return next(new ApiError(422, 'Validation failed', result.array()));
}

module.exports = validate;
