const { AuthError } = require("../services/auth.service");

const removeSensitiveDataToResponse = (module) => {
  delete module.password;
  delete module.passwordHash;
  delete module.verificationString;
  return module;
};

const isUserVerified = (user) => {
  if (!user || !user.isVerified) throw new AuthError("User not verified.", 401);
  if (user.isDeletedAccount || user.isBlocked)
    throw new AuthError("User not allowed.", 401);
};

const userVerified = (req, _, next) => {
  const user = req.user;
  isUserVerified(user);
  next();
};

const validateAdminToken = (req, _, next) => {
  const userAdmin = req.user;
  isUserVerified(userAdmin);

  if (!userAdmin || !userAdmin.isAdmin)
    throw new AuthError("Admin token not provided.", 401);

  next();
};

const isAdminOwnerOrUserAdminByToken = (req, _, next) => {
  const user = req.user;
  isUserVerified(user);

  if (user?.isAdmin || ["owner", "admin"].includes(user?.rol)) return next();

  throw new AuthError("User not valid to do this.", 401);
};

module.exports = {
  removeSensitiveDataToResponse,
  validateAdminToken,
  isAdminOwnerOrUserAdminByToken,
  userVerified,
};
