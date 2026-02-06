const { MAX_LOGIN_ATTEMPS } = require("../utils/constants");
const { decryptData } = require("../utils/encrypt");

const isUserVerified = (user) => {
  if (!user || !user.isVerified) throw new AuthError("User not verified.", 401);
  if (user.isDeletedAccount || user.isBlocked)
    throw new AuthError("User not allowed.", 401);
};

class AuthError extends Error {
  constructor(message = "Error in credentials.", status = 401) {
    super(message);
    this.status = status;
  }
}

const authenticateUser = async ({ db, params, password }) => {
  const userExist = await db.findOne({ ...params });
  if (!userExist) throw new AuthError();

  isUserVerified(userExist);

  const isValid = password === decryptData(userExist.passwordHash);
  if (userExist.isDeletedAccount) throw new AuthError("This account is bloked");

  if (userExist.loginAttempts >= MAX_LOGIN_ATTEMPS) {
    db.findOneAndUpdate(
      { ...params },
      { $set: { isBlocked: true, updatedAt: new Date() } },
    );
    throw new AuthError("This account is bloked due to many wrong attemps");
  }

  if (!isValid) {
    db.findOneAndUpdate(
      { ...params },
      {
        $set: {
          loginAttempts: (userExist.loginAttempts ?? 0) + 1,
          updatedAt: new Date(),
        },
      },
    );
    throw new AuthError();
  }
  if (userExist.isActive) throw new AuthError("User already in session.");

  return userExist;
};

module.exports = {
  authenticateUser,
  AuthError,
};
