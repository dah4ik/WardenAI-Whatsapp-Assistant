import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";
import { logger } from "../utils/logger";

export const errorMiddleware = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const isProduction = env.nodeEnv === "production";

    if (error instanceof HttpError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message
        });

        return;
    }

    logger.error(error);

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: isProduction ? undefined : error.message,
        stack: isProduction ? undefined : error.stack
    });
};