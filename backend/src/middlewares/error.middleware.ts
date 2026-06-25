import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export const errorMiddleware = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const isProduction = env.nodeEnv === "production";

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: isProduction ? undefined : error.message,
        stack: isProduction ? undefined : error.stack
    });
};