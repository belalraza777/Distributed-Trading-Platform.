import Joi from 'joi';

export const orderExecutedSchema = Joi.object({
  userId: Joi.number().required(),
  symbol: Joi.string().required(),
  type: Joi.string().valid('BUY', 'SELL').required(),
  quantity: Joi.number().positive().required(),
  price: Joi.number().positive().required(),
});

export const paymentNotificationSchema = Joi.object({
  userId: Joi.number().required(),
  type: Joi.string().required(),
  status: Joi.string().required(),
  amount: Joi.number().positive().required(),
  provider: Joi.string().required(),
});

export const retryNotificationSchema = Joi.object({
  notificationId: Joi.number().required(),
  email: Joi.string().email().allow("", null),
  phone: Joi.string().allow("", null),
  title: Joi.string().required(),
  message: Joi.string().required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid("asc", "desc").optional(),
});

export const userSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  email:  Joi.string().email().required(),
  name:   Joi.string().required(),
  phone:  Joi.string().required(),  
});