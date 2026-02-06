const express = require("express");
const { routes } = require("../routes");
const { initializeDbConnection } = require("../mongodb");
const cors = require("cors");
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(function (_, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(express.json());

routes.forEach((route) => {
  if (route.middleware) {
    app[route.method](route.path, ...route.middleware, route.handler);
  } else {
    app[route.method](route.path, route.handler);
  }
});

app.use((err, _, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

initializeDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server of services is running on port ${PORT}`);
  });
});
