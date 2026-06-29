import { Response } from "express";
import { AppError } from "../middlewares/errorHandler";

export function success(res: Response, data: unknown, message?: string) {
  return res.json({ success: true, data, message });
}

export function paginated(res: Response, data: unknown[], total: number, page: number, limit: number) {
  return res.json({ success: true, data, total, page, limit });
}
