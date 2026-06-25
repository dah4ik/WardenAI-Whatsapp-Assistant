import { Request, Response } from "express";
import mongoose from "mongoose";

export const getHealthStatus = (_req: Request, res: Response): void => {
    const mongoState = mongoose.connection.readyState;

    const mongoStatusMap: Record<number, string> = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };

    res.status(200).json({
        success: true,
        service: "wardenai-backend",
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: {
            mongo: mongoStatusMap[mongoState] || "unknown"
        }
    });
};