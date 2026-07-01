import { Router } from "express";
import {
    sendStoredMessageController,
    sendTextMessageController
} from "../controllers/whatsapp-sender.controller";

export const whatsappSenderRoutes = Router();

whatsappSenderRoutes.post("/send", sendTextMessageController);
whatsappSenderRoutes.post("/send-message/:messageId", sendStoredMessageController);