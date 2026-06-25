import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { healthRoutes } from "./routes/health.routes";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

export const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "WardenAI WhatsApp Assistant API is running"
    });
});

app.use("/api/health", healthRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);