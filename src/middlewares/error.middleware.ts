import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";

export interface ApiError extends Error {
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Mongoose Validation Error
  if (err instanceof MongooseError.ValidationError) {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
    return;
  }

  // Mongoose Cast Error (Invalid ID)
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({
      success: false,
      message: "Invalid ID format",
    });
    return;
  }

  // Default Error Response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// 404 Error Handler
export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as ApiError;
  error.statusCode = 404;
  next(error);
};
