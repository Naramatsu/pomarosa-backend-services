const testRoute = {
  path: "/test",
  method: "get",
  handler: (req, res) => {
    res.status(200).send("It works!");
  },
};

module.exports = {
  testRoute,
};
