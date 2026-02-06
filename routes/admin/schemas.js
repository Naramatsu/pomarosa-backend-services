const joi = require("joi");
const { objectId, joiShapes } = require("../../utils");
const { required } = joiShapes;

const logoutValidator = joi.object({
  user: required.user,
});

const loginValidator = joi.object({
  user: required.user,
  password: required.string,
});

const signUpValidator = joi.object({
  user: required.user,
  password: required.string,
  userInfo: joi.object({
    name: required.string,
    lastname: required.string,
    email: required.email,
  }),
});

const verifyEmailValidator = joi.object({
  user: required.user,
  verificationString: required.string,
  email: required.email,
});

const deleteAdminValidator = joi.object({
  user: required.user,
  email: required.email,
});

const findAdminByIdValidator = joi.object({
  id: objectId,
});

module.exports = {
  logoutValidator,
  loginValidator,
  signUpValidator,
  verifyEmailValidator,
  findAdminByIdValidator,
  deleteAdminValidator,
};
