const jwt = require("jsonwebtoken");

const JWTSign = (params, res, expiresIn = "1d", message = null) => {
  jwt.sign(
    { ...params },
    process.env.JWT_SECRET,
    {
      expiresIn,
    },
    (err, token) => {
      if (err) return res.status(500).json(err);
      const response = { token, message };
      if (!message) delete response.message;
      return res.status(200).json(response);
    },
  );
};

const JWTCreateElementSign = (params, module, res, expiresIn = "1d") => {
  jwt.sign(
    { ...params },
    process.env.JWT_SECRET,
    {
      expiresIn,
    },
    (err, token) => {
      if (err) return res.status(500).json(err);
      return res
        .status(201)
        .json({ token, message: `${module} created successfully..!` });
    },
  );
};

module.exports = { JWTSign, JWTCreateElementSign };
