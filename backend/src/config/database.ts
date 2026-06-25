import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../utils/logger";

export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(env.mongodbUri);

        logger.info("MongoDB connected successfully");
    } catch (error) {
        logger.error("MongoDB connection failed");
        throw error;
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    try {
        await mongoose.disconnect();

        logger.info("MongoDB disconnected successfully");
    } catch (error) {
        logger.error("MongoDB disconnection failed");
        throw error;
    }
};