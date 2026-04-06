const ApiError = require("../utils/ApiError");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const errors = error.details.map((d) => d.message.replace(/"/g, ""));
    return next(new ApiError(422, "Validation failed", errors));
  }

  next();
};

module.exports = validate;