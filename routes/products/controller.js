const { ObjectId } = require("mongodb");
const { getDbConnection } = require("../../mongodb");
const { asyncHandler } = require("../../utils");
const { removeSensitiveDataToResponse } = require("../../utils/users");
const { SPANISH, ENGLISH } = require("../../utils/constants");

const dbName = process.env.DB_NAME;
const dbCollectionProducts = process.env.DB_PRODUCTS_COLLECTION;
const dbCollectionProductHistory = process.env.DB_PRODUCT_HISTORY_COLLECTION;

const createProduct = async (product, userId) => {
  const { code, name } = product;
  const db = getDbConnection(dbName);

  const productsCollection = await db.collection(dbCollectionProducts);
  const productExists = await productsCollection.findOne({
    $or: [
      { code },
      {
        "name.SPANISH": name[SPANISH],
      },
      {
        "name.ENGLISH": name[ENGLISH],
      },
    ],
  });
  if (productExists) return null;

  const result = await productsCollection.insertOne({
    ...product,
    isAvailable: true,
    productHistoryIds: [],
    userId,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
  });
  const { insertedId } = result;

  const productCreated = await productsCollection.findOne({
    _id: new ObjectId(insertedId),
  });

  return productCreated;
};

const createProductController = asyncHandler(async (req, res) => {
  const product = req.body;
  const { _id: userId } = req.user;

  const productCreated = await createProduct(product, userId);
  if (!productCreated)
    return res
      .status(403)
      .send(
        "Este producto ya existe, verifica el código, nombre en español o en ingles",
      );

  return res.status(201).send({
    product: productCreated,
    message: "Producto creado exitosamente",
  });
});

const findAllProductsController = asyncHandler(async (_, res) => {
  const db = getDbConnection(dbName);
  const products = await db.collection(dbCollectionProducts).find().toArray();
  if (!products.length) return res.status(404).send("No products found");

  return res.status(200).send({
    data: products,
    total: products.length,
  });
});

const productsAdvanceFilterController = asyncHandler(async (req, res) => {
  const params = req.query;
  const db = getDbConnection(dbName);

  const hotPriceFilter = {};
  if (params.fromHotPrice) hotPriceFilter.$gte = Number(params.fromHotPrice);
  if (params.toHotPrice) hotPriceFilter.$lte = Number(params.toHotPrice);

  const coldPriceFilter = {};
  if (params.fromColdPrice) coldPriceFilter.$gte = Number(params.fromColdPrice);
  if (params.toColdPrice) coldPriceFilter.$lte = Number(params.toColdPrice);

  const personalFilter = {};
  if (params.fromPersonal) personalFilter.$gte = Number(params.fromPersonal);
  if (params.toPersonal) personalFilter.$lte = Number(params.toPersonal);

  const familiarFilter = {};
  if (params.fromFamiliar) familiarFilter.$gte = Number(params.fromFamiliar);
  if (params.toFamiliar) familiarFilter.$lte = Number(params.toFamiliar);

  const orFilters = Object.keys(params).map((key) => {
    if (
      [
        "fromHotPrice",
        "toHotPrice",
        "fromColdPrice",
        "toColdPrice",
        "fromPersonal",
        "toPersonal",
        "fromFamiliar",
        "toFamiliar",
      ].includes(key)
    )
      return {};

    if (["name", "description"].includes(key))
      return {
        $or: [
          { [`${key}.${SPANISH}`]: { $regex: params[key], $options: "i" } },
          { [`${key}.${ENGLISH}`]: { $regex: params[key], $options: "i" } },
        ],
      };

    if (key === "isAvailable") return { isAvailable: Boolean(params[key]) };
    return {
      [key]: { $regex: params[key], $options: "i" },
    };
  });

  const query = {
    ...(Object.keys(hotPriceFilter).length > 0 && {
      hotPrice: hotPriceFilter,
    }),
    ...(Object.keys(coldPriceFilter).length > 0 && {
      coldPrice: coldPriceFilter,
    }),
    ...(Object.keys(personalFilter).length > 0 && {
      personal: personalFilter,
    }),
    ...(Object.keys(familiarFilter).length > 0 && {
      familiar: familiarFilter,
    }),

    ...(orFilters.length > 0 && { $and: orFilters }),
  };

  const products = await db
    .collection(dbCollectionProducts)
    .find(query)
    .toArray();
  if (!products.length) return res.status(404).send("No products found");

  return res.status(200).send({
    data: products,
    total: products.length,
  });
});

const productsQuickFilterController = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const db = getDbConnection(dbName);
  const regex = new RegExp(search, "i");
  const products = await db
    .collection(dbCollectionProducts)
    .find({
      $or: [
        { code: regex },
        { area: regex },
        { section: regex },
        { schedule: regex },
        { [`name.${SPANISH}`]: regex },
        { [`name.${ENGLISH}`]: regex },
        { [`description.${SPANISH}`]: regex },
        { [`description.${ENGLISH}`]: regex },
      ],
    })
    .toArray();

  if (!products.length) return res.status(404).send("No products found");

  return res.status(200).send({
    data: products,
    total: products.length,
  });
});

const findProductByIdController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const db = getDbConnection(dbName);
  const product = await db
    .collection(dbCollectionProducts)
    .findOne({ _id: new ObjectId(productId) });

  if (!product) return res.status(404).send("Pproduc not found");

  return res.status(200).send(product);
});

const updateProductByProductIdController = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { _id: userId } = req.user;
  const params = req.body;
  const db = getDbConnection(dbName);

  if (Object.keys(params).length === 0)
    return res.status(400).send({ message: "No fields sent to update" });

  const productsCollection = db.collection(dbCollectionProducts);
  const product = await productsCollection.findOne({
    _id: new ObjectId(productId),
  });

  if (!product) return res.status(400).send({ message: "Product not found" });

  if (params.nameSpanish || params.nameEnglish) {
    const name = {
      ...product.name,
      ...(params.nameSpanish && { [SPANISH]: params.nameSpanish }),
      ...(params.nameEnglish && { [ENGLISH]: params.nameEnglish }),
    };
    params.name = name;
    delete params.nameSpanish;
    delete params.nameEnglish;
  }

  if (params.descriptionSpanish || params.descriptionEnglish) {
    const description = {
      ...product.description,
      ...(params.descriptionSpanish && {
        [SPANISH]: params.descriptionSpanish,
      }),
      ...(params.descriptionEnglish && {
        [ENGLISH]: params.descriptionEnglish,
      }),
    };
    params.description = description;
    delete params.descriptionSpanish;
    delete params.descriptionEnglish;
  }

  product.productId = product._id;
  delete product._id;
  const productHistoryIds = product.productHistoryIds;
  delete product.productHistoryIds;
  const productHistoryResult = await db
    .collection(dbCollectionProductHistory)
    .insertOne({ ...product, updatedBy: userId, updatedAt: new Date() });
  const { insertedId } = productHistoryResult;

  await productsCollection.updateOne(
    { _id: new ObjectId(productId) },
    {
      $set: {
        ...params,
        updatedAt: new Date(),
        productHistoryIds: [...productHistoryIds, insertedId],
      },
    },
    { new: true, runValidators: true },
  );

  const productUpdated = await productsCollection.findOne({
    _id: new ObjectId(productId),
  });

  return res.status(201).send({
    product: removeSensitiveDataToResponse(productUpdated),
    message: "Product updated successfully",
  });
});

const deleteProductByProductIdController = asyncHandler(async (req, res) => {
  req.body = {
    isAvailable: false,
  };
  updateProductByProductIdController(req, res);
});

const findProductHistoryByProductIdController = asyncHandler(
  async (req, res) => {
    const { productId } = req.params;
    const db = getDbConnection(dbName);
    const product = await db
      .collection(dbCollectionProducts)
      .findOne({ _id: new ObjectId(productId) });

    if (!product) return res.status(404).send("Pproduc not found");
    if (!product.productHistoryIds.length)
      return res
        .status(404)
        .send("Este producto no tiene historial de cambios");

    const productHistory = await db
      .collection(dbCollectionProductHistory)
      .find({ productId: new ObjectId(productId) })
      .toArray();

    return res
      .status(200)
      .send({ data: productHistory, total: productHistory.length });
  },
);

const createProductInBatchController = asyncHandler(async (req, res, next) => {
  const products = req.body;
  const { _id: userId } = req.user;

  const productsNotCreated = [];

  const productsBatch = await Promise.allSettled(
    products.map(async (product) => {
      const result = await createProduct(product, userId);
      if (!result) productsNotCreated.push(product);
      return result;
    }),
  );

  const productsCreated = [];
  const errors = [];

  productsBatch.forEach((result, index) => {
    if (result.status === "fulfilled") {
      if (result.value) productsCreated.push(result.value);
    } else {
      errors.push({
        index,
        error: result.reason.message,
      });
    }
  });

  return res.status(201).send({
    productsCreated,
    productsNotCreated,
    errors,
  });
});

module.exports = {
  createProductController,
  findAllProductsController,
  productsAdvanceFilterController,
  productsQuickFilterController,
  findProductByIdController,
  updateProductByProductIdController,
  deleteProductByProductIdController,
  findProductHistoryByProductIdController,
  createProductInBatchController,
};
