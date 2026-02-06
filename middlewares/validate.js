export const validate = (schema, property) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      return res.status(400).json({
        message: "Error de validación",
        errors: error.details.map((err) => err.message),
      });
    }

    req[property] = value;
    next();
  };
};
