const adminRoutes = require("./admin");
const pathPrefix = "/admin";

const routes = Object.values(adminRoutes).map((route) => {
  route.path = `${pathPrefix}${route.path}`;
  return route;
});

module.exports = {
  routes,
};
