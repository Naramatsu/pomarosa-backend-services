const joi = require("joi");

const isObjectEmpty = (obj) => !obj || Object.keys(obj).length === 0;

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const buildUpdateObject = (body) =>
  Object.fromEntries(
    Object.entries(body).filter(
      ([key, value]) => allowedFields.includes(key) && value !== undefined,
    ),
  );

const joiShapes = {
  required: {
    id: joi.string().hex().length(24).required(),
    string: joi.string().trim(true).required(),
    number: joi.number().required(),
    date: joi.date().required(),
    boolean: joi.boolean().required(),
    user: joi.string().alphanum().min(4).max(25).trim(true).required(),
    email: joi.string().email().trim(true).required(),
  },
  optional: {
    id: joi.string().hex().length(24).optional(),
    string: joi.string().trim(true).optional(),
    number: joi.number().optional(),
    date: joi.date().optional(),
    boolean: joi.boolean().optional(),
    user: joi.string().alphanum().min(4).max(25).trim(true).optional(),
    email: joi.string().email().trim(true).optional(),
  },
};

const objectId = joi.string().hex().length(24).required();

module.exports = {
  isObjectEmpty,
  asyncHandler,
  buildUpdateObject,
  joiShapes,
  objectId,
};
