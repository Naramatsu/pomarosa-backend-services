const { testRoute } = require("./testRoute");
const { routes: admin } = require("./admin");
const { routes: products } = require("./products");

const routes = [...admin, ...products, testRoute];

module.exports = {
  routes,
};
