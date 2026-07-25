import Joi from "joi";

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().optional(),
  sort: Joi.string().valid("asc", "desc").optional(),
});

export const createStockSchema = Joi.object({
  symbol: Joi.string().trim().required(),
  company_name: Joi.string().trim().required(),
  exchange: Joi.string().trim().required(),
});

export const recordStockPriceSchemaBody = Joi.object({
    price: Joi.number().positive().required(),
});

export const symbolParamSchema = Joi.object({
  symbol: Joi.string().trim().required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const priceHistorySchemaQuery = Joi.object({
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
});

export const updateStockSchemaBody = Joi.object({
    symbol: Joi.string().trim().optional(),
    company_name: Joi.string().trim().optional(),
    exchange: Joi.string().trim().optional(),
});
