import { Router } from "express";
import {
    receiveWhatsAppWebhookController,
    testIncomingWhatsAppMessageController,
    verifyWhatsAppWebhookController
} from "../controllers/whatsapp-webhook.controller";

export const whatsappWebhookRoutes = Router();

whatsappWebhookRoutes.get("/", verifyWhatsAppWebhookController);
whatsappWebhookRoutes.post("/", receiveWhatsAppWebhookController);
whatsappWebhookRoutes.post(
    "/test-incoming",
    testIncomingWhatsAppMessageController
);