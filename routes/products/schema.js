const joi = require("joi");
const { objectId, joiShapes } = require("../../utils");
const {
  SPANISH,
  ENGLISH,
  BAKERY,
  KITCHEN,
  ONLY_DAY,
  ONLY_NIGHT,
  ALL_DAY,
} = require("../../utils/constants");
const { required, optional } = joiShapes;

const createProductValidator = joi.object({
  name: joi
    .object({
      [SPANISH]: required.string,
      [ENGLISH]: required.string,
    })
    .required(),
  description: joi
    .object({
      [SPANISH]: optional.string,
      [ENGLISH]: optional.string,
    })
    .optional(),
  code: optional.string,
  hotPrice: optional.number,
  coldPrice: optional.number,
  personal: optional.number,
  familiar: optional.number,
  img: optional.string,
  area: required.string.valid(BAKERY, KITCHEN),
  section: required.string,
  schedule: required.string.valid(ONLY_DAY, ONLY_NIGHT, ALL_DAY),
});

const createProductInBatchValidator = joi
  .array()
  .items(createProductValidator)
  .min(1)
  .max(500)
  .required();

const findByProductId = joi.object({
  productId: objectId,
});

const filterProductsValidator = {
  query: joi.object({
    code: optional.string,
    name: optional.string,
    description: optional.string,
    area: optional.string,
    section: optional.string,
    schedule: optional.boolean,

    isAvailable: optional.boolean,

    fromHotPrice: optional.number,
    toHotPrice: optional.number,

    fromColdPrice: optional.number,
    toColdPrice: optional.number,

    fromPersonal: optional.number,
    toPersonal: optional.number,

    fromFamiliar: optional.number,
    toFamiliar: optional.number,
  }),
};

const quickFilterProductsValidator = {
  query: joi.object({
    search: joi.string().trim(true).min(3).required(),
  }),
};

const updateProductValidator = {
  params: joi.object({
    productId: objectId,
  }),
  body: joi.object({
    nameSpanish: optional.string,
    nameEnglish: optional.string,
    descriptionSpanish: optional.string,
    descriptionEnglish: optional.string,
    code: optional.string,
    hotPrice: optional.number,
    coldPrice: optional.number,
    personal: optional.number,
    familiar: optional.number,
    img: optional.string,
    area: optional.string.valid(BAKERY, KITCHEN),
    section: optional.string,
    schedule: optional.string.valid(ONLY_DAY, ONLY_NIGHT, ALL_DAY),
    isAvailable: optional.boolean,
  }),
};

const deleteProductValidator = {
  params: joi.object({
    productId: objectId,
  }),
};

module.exports = {
  createProductValidator,
  findByProductId,
  filterProductsValidator,
  updateProductValidator,
  quickFilterProductsValidator,
  deleteProductValidator,
  createProductInBatchValidator,
};
