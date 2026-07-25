import Joi from "joi";

export const symbolParamSchema = Joi.object({
  symbol: Joi.string().trim().required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("asc", "desc").optional(),
});
