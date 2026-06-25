import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { healthRoutes } from "./routes/health.routes";
import { contactRoutes } from "./routes/contact.routes";
import { conversationRoutes } from "./routes/conversation.routes";
import { whatsappWebhookRoutes } from "./routes/whatsapp-webhook.routes";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

export const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "WardenAI WhatsApp Assistant API is running"
    });
});

app.use("/api/health", healthRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/webhooks/whatsapp", whatsappWebhookRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);