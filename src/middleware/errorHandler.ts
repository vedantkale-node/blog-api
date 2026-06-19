import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

const isDuplicateKeyError = (
  err: unknown,
): err is { code: number; keyValue?: Record<string, unknown> } =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  (err as { code: number }).code === 11000;

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.issues.map((issue) => issue.message).join(", "),
      errors: err.issues,
    });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors)
        .map((error) => error.message)
        .join(", "),
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    err.code === 11000
  ) {
    const field =
      "keyValue" in err && err.keyValue
        ? Object.keys(err.keyValue as object)[0]
        : "field";

    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
    });
  }

  if (env.NODE_ENV === "development") {
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
