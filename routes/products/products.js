const { authMiddleware } = require("../../middlewares/authMiddleware");
const { validate } = require("../../middlewares/validate");
const { BODY, PARAMS, QUERY } = require("../../utils/constants");
const { userVerified, validateAdminToken } = require("../../utils/users");
const {
  createProductController,
  findAllProductsController,
  productsAdvanceFilterController,
  findProductByIdController,
  updateProductByProductIdController,
  productsQuickFilterController,
  deleteProductByProductIdController,
  findProductHistoryByProductIdController,
  createProductInBatchController,
} = require("./controller");
const {
  createProductValidator,
  findByProductId,
  filterProductsValidator,
  updateProductValidator,
  quickFilterProductsValidator,
  deleteProductValidator,
  createProductInBatchValidator,
} = require("./schema");

const createProduct = {
  path: "/",
  method: "post",
  handler: createProductController,
  middleware: [
    validate(createProductValidator, BODY),
    authMiddleware,
    userVerified,
  ],
};

const createProductInBatch = {
  path: "/batch",
  method: "post",
  handler: createProductInBatchController,
  middleware: [
    validate(createProductInBatchValidator, BODY),
    authMiddleware,
    userVerified,
  ],
};

const productsAdvanceFilter = {
  path: "/filter",
  method: "get",
  handler: productsAdvanceFilterController,
  middleware: [validate(filterProductsValidator.query, QUERY)],
};

const productsQuickFilter = {
  path: "/v1/quick-filter",
  method: "get",
  handler: productsQuickFilterController,
  middleware: [
    validate(quickFilterProductsValidator.query, QUERY),
    authMiddleware,
    userVerified,
  ],
};

const findProductById = {
  path: "/:productId",
  method: "get",
  handler: findProductByIdController,
  middleware: [validate(findByProductId, PARAMS), authMiddleware, userVerified],
};

const updateProductByProductId = {
  path: "/:productId",
  method: "put",
  handler: updateProductByProductIdController,
  middleware: [
    validate(updateProductValidator.params, PARAMS),
    validate(updateProductValidator.body, BODY),
    authMiddleware,
    userVerified,
  ],
};

const deleteProductByProductId = {
  path: "/:productId",
  method: "delete",
  handler: deleteProductByProductIdController,
  middleware: [
    validate(deleteProductValidator.params, PARAMS),
    authMiddleware,
    userVerified,
  ],
};

const findProductHistoryByProductId = {
  path: "/product-history/:productId",
  method: "get",
  handler: findProductHistoryByProductIdController,
  middleware: [validate(findByProductId, PARAMS), authMiddleware, userVerified],
};

const findAllProducts = {
  path: "/",
  method: "get",
  handler: findAllProductsController,
};

module.exports = {
  createProduct,
  findAllProducts,
  productsAdvanceFilter,
  findProductById,
  updateProductByProductId,
  productsQuickFilter,
  deleteProductByProductId,
  findProductHistoryByProductId,
  createProductInBatch,
};
