import Joi from "joi";

export const placeOrderSchema = Joi.object({
  symbol: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  price: Joi.number().positive().required(),
  type: Joi.string().valid("BUY", "SELL").required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("asc", "desc").optional(),
});
