const { ObjectId } = require("mongodb");
const { getDbConnection } = require("../../mongodb");
const { encryptData, decryptData } = require("../../utils/encrypt");
const { JWTSign, JWTCreateElementSign } = require("../../utils/jwt");
const { v4: uudi } = require("uuid");
const { authenticateUser } = require("../../services/auth.service");
const { removeSensitiveDataToResponse } = require("../../utils/users");
const { asyncHandler } = require("../../utils");

const dbName = process.env.DB_NAME;
const dbCollectionAdmin = process.env.DB_ADMIN_COLLECTION;

const signUpController = asyncHandler(async (req, res) => {
  const { user, password, userInfo } = req.body;
  const db = getDbConnection(dbName);
  const adminCollection = await db.collection(dbCollectionAdmin);
  const userAdminExist = await adminCollection.findOne({
    $or: [
      { user },
      {
        "userInfo.email": userInfo.email,
      },
    ],
  });
  if (userAdminExist) return res.status(401).send("This admin already exits.");

  const passwordHash = encryptData(password);
  const verificationString = uudi();
  const result = await adminCollection.insertOne({
    user,
    passwordHash,
    userInfo,
    isVerified: false,
    verificationString,
    isActive: false,
    isAdmin: true,
    createdAt: new Date(),
    loginAttempts: 0,
  });

  const { insertedId } = result;

  const userAdminCreated = await adminCollection.findOne({
    _id: new ObjectId(insertedId),
  });

  JWTCreateElementSign(
    removeSensitiveDataToResponse(userAdminCreated),
    "Admin",
    res,
  );
});

const loginController = asyncHandler(async (req, res) => {
  const { user, password } = req.body;
  const db = getDbConnection(dbName);
  const adminCollection = await db.collection(dbCollectionAdmin);
  const userAdminExist = await authenticateUser({
    db: adminCollection,
    params: { user, isAdmin: true },
    password,
  });

  await adminCollection.findOneAndUpdate(
    { _id: new ObjectId(userAdminExist._id), isAdmin: true },
    {
      $set: { isActive: true, lastConnection: new Date(), loginAttempts: 0 },
    },
  );

  JWTSign(removeSensitiveDataToResponse(userAdminExist), res);
});

const logoutController = asyncHandler(async (req, res) => {
  const { user } = req.body;
  const db = getDbConnection(dbName);
  const adminCollection = await db.collection(dbCollectionAdmin);
  const userAdminExist = await adminCollection.findOne({ user });
  if (!userAdminExist) return res.status(404).send("This user does not exits.");

  const { _id: id } = userAdminExist;
  const result = adminCollection.findOneAndUpdate(
    { _id: new ObjectId(id), isAdmin: true },
    {
      $set: { isActive: false },
    },
  );
  if (!result) return res.status(401).send("This user does not exits.");
  return res.status(202).send("Logout successfuly.");
});

const verifyEmailController = asyncHandler(async (req, res) => {
  const { verificationString, user, email } = req.body;
  const db = getDbConnection(dbName);
  const adminCollection = await db.collection(dbCollectionAdmin);
  const userExist = await adminCollection.findOne({
    user,
    verificationString,
    "userInfo.email": email,
  });
  if (!userExist)
    return res
      .status(401)
      .send("Error in credentials please verify again the email sent.");

  if (userExist.isVerified && !userExist.isBlocked)
    return res.status(202).send("Your account is already verified!!!");

  const result = await adminCollection.findOneAndUpdate(
    { _id: userExist._id },
    {
      $set: {
        loginAttempts: 0,
        isVerified: true,
        isBlocked: false,
        isDeletedAccount: false,
        deletedAt: null,
        updatedAt: new Date(),
      },
    },
  );
  if (!result) return res.status(401).send("Account verifaction failed.");
  return res.status(202).send("Congratulations your account now is active.");
});

const findAllAdminsController = asyncHandler(async (_, res) => {
  const db = getDbConnection(dbName);
  const admins = await db.collection(dbCollectionAdmin).find().toArray();
  const adminsMapped = admins.map((admin) =>
    removeSensitiveDataToResponse(admin),
  );
  return res.status(200).send({
    data: adminsMapped,
    total: adminsMapped.length,
  });
});

const findAdminByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const db = getDbConnection(dbName);
  const userAdmin = await db
    .collection(dbCollectionAdmin)
    .findOne({ _id: new ObjectId(id) });

  if (!userAdmin) return res.status(404).send("User Admin not found");
  return res.status(200).send(removeSensitiveDataToResponse(userAdmin));
});

const deleteAdminController = asyncHandler(async (req, res) => {
  const { user, email } = req.body;
  const db = getDbConnection(dbName);
  const adminCollection = await db.collection(dbCollectionAdmin);
  const userExist = await adminCollection.findOne({
    user,
    isAdmin: true,
    "userInfo.email": email,
  });
  if (!userExist)
    return res
      .status(401)
      .send("Error in credentials please verify again the email sent.");

  if (userExist.isDeletedAccount)
    return res.status(400).send("User already deleted!!!");

  const result = await adminCollection.findOneAndUpdate(
    { _id: userExist._id, isAdmin: true },
    {
      $set: {
        loginAttempts: 0,
        isActive: false,
        isVerified: false,
        isDeletedAccount: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );
  if (!result) return res.status(401).send("Account deleteion failed.");
  return res.status(202).send("This account now is deleted.");
});

module.exports = {
  signUpController,
  loginController,
  logoutController,
  verifyEmailController,
  findAllAdminsController,
  findAdminByIdController,
  deleteAdminController,
};
