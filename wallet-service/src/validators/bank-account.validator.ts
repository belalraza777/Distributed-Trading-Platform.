import Joi from "joi";

export const bankAccountSchema = Joi.object({
  account_holder: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  account_number: Joi.string()
    .trim()
    .pattern(/^\d{9,18}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid account number",
    }),

  ifsc_code: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid IFSC code",
    }),

  bank_name: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow(""),
});