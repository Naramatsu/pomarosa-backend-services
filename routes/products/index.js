const productRoutes = require("./products");
const pathPrefix = "/products";

const routes = Object.values(productRoutes).map((route) => {
  route.path = `${pathPrefix}${route.path}`;
  return route;
});

module.exports = {
  routes,
};
