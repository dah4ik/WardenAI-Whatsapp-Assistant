import { Router } from "express";
import {
    closeConversationController,
    createIncomingMessageController,
    createOutgoingMessageController,
    getConversationController,
    getConversationMessagesController,
    listConversationsController,
    markConversationAsReadController
} from "../controllers/conversation.controller";

export const conversationRoutes = Router();

conversationRoutes.get("/", listConversationsController);

conversationRoutes.post("/incoming", createIncomingMessageController);
conversationRoutes.post("/outgoing", createOutgoingMessageController);

conversationRoutes.get("/:id", getConversationController);
conversationRoutes.get("/:id/messages", getConversationMessagesController);

conversationRoutes.patch("/:id/read", markConversationAsReadController);
conversationRoutes.patch("/:id/close", closeConversationController);