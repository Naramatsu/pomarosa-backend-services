const cryptoJS = require("crypto-js");

const encryptData = (text) =>
  cryptoJS.AES.encrypt(
    JSON.stringify(text),
    process.env.PASSWORD_SECRET_KEY
  ).toString();

const decryptData = (text) => {
  const bytes = cryptoJS.AES.decrypt(text, process.env.PASSWORD_SECRET_KEY);
  return JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
};

module.exports = {
  encryptData,
  decryptData,
};
