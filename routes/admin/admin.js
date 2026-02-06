const { authMiddleware } = require("../../middlewares/authMiddleware");
const { validate } = require("../../middlewares/validate");
const { BODY, PARAMS } = require("../../utils/constants");
const { userVerified } = require("../../utils/users");
const {
  signUpController,
  loginController,
  logoutController,
  verifyEmailController,
  findAllAdminsController,
  findAdminByIdController,
  deleteAdminController,
} = require("./controller");
const {
  signUpValidator,
  loginValidator,
  logoutValidator,
  findAdminByIdValidator,
  verifyEmailValidator,
  deleteAdminValidator,
} = require("./schemas");

const signUp = {
  path: "/signup",
  method: "post",
  handler: signUpController,
  middleware: [validate(signUpValidator, BODY)],
};

const login = {
  path: "/login",
  method: "post",
  handler: loginController,
  middleware: [validate(loginValidator, BODY)],
};

const logout = {
  path: "/logout",
  method: "post",
  handler: logoutController,
  middleware: [validate(logoutValidator, BODY)],
};

const findAllAdmins = {
  path: "/",
  method: "get",
  handler: findAllAdminsController,
  middleware: [authMiddleware, userVerified],
};

const findAdminById = {
  path: "/:id",
  method: "get",
  handler: findAdminByIdController,
  middleware: [
    validate(findAdminByIdValidator, PARAMS),
    authMiddleware,
    userVerified,
  ],
};

const verifyEmail = {
  path: "/verify-email",
  method: "put",
  handler: verifyEmailController,
  middleware: [validate(verifyEmailValidator, BODY)],
};

const deleteAdmin = {
  path: "/",
  method: "delete",
  handler: deleteAdminController,
  middleware: [
    validate(deleteAdminValidator, BODY),
    authMiddleware,
    userVerified,
  ],
};

module.exports = {
  signUp,
  login,
  logout,
  verifyEmail,
  findAllAdmins,
  findAdminById,
  deleteAdmin,
};
