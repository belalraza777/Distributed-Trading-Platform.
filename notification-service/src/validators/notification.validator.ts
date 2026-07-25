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