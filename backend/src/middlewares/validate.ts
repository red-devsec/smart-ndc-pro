import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "./errorHandler";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const messages = e.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("; ");
        next(new AppError(messages, 400));
      } else {
        next(e);
      }
    }
  };
}
