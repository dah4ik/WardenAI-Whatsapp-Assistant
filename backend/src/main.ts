import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./utils/logger";

const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();

        app.listen(env.port, () => {
            logger.info(`WardenAI backend is running on port ${env.port}`);
            logger.info(`Environment: ${env.nodeEnv}`);
        });
    } catch (error) {
        logger.error("Failed to start WardenAI backend");
        logger.error(error);
        process.exit(1);
    }
};

void startServer();