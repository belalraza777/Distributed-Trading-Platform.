import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),

  email: Joi.string().trim().email().required(),

  password: Joi.string().min(8).max(50).required(),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),

  password: Joi.string().required(),
});

export const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
}).min(1) // at least one field required
 
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(50).required(),
})
 