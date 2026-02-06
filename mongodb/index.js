const { MongoClient } = require("mongodb");
const DB_URL = process.env.DB_URL;
let client;

const initializeDbConnection = async () => {
  client = await MongoClient.connect(DB_URL);
};

const getDbConnection = (dbName) => {
  const db = client.db(dbName);
  return db;
};

const closeDB = async () => {
  if (client) await client.close();
  console.log("closing db");
};

module.exports = {
  initializeDbConnection,
  getDbConnection,
  closeDB,
};
