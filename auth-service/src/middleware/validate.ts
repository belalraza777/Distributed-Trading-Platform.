import { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema } from "joi";

type Property = "body" | "params" | "query";

export const validate =
  (schema: ObjectSchema, property: Property = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req[property] = value;
    next();
  };
