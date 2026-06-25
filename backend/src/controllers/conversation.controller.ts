import { Request, Response } from "express";
import { ConversationStatus } from "../models/conversation.model";
import {
    closeConversation,
    createMessageForPhoneNumber,
    getConversationById,
    getConversationMessages,
    listConversations,
    markConversationAsRead
} from "../services/conversation.service";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";

const parseBooleanQuery = (value: unknown): boolean | undefined => {
    if (value === undefined) {
        return undefined;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    throw new HttpError(400, "Boolean query value must be true or false");
};

export const createIncomingMessageController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const result = await createMessageForPhoneNumber({
            phoneNumber: req.body.phoneNumber,
            text: req.body.text,
            direction: "incoming",
            source: "whatsapp",
            status: "received",
            metadata: {
                createdBy: "manual-api-test"
            }
        });

        res.status(201).json({
            success: true,
            message: "Incoming message saved successfully",
            data: result
        });
    }
);

export const createOutgoingMessageController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const result = await createMessageForPhoneNumber({
            phoneNumber: req.body.phoneNumber,
            text: req.body.text,
            direction: "outgoing",
            source: req.body.source ?? "dashboard",
            status: req.body.status ?? "sent",
            aiModel: req.body.aiModel,
            aiReason: req.body.aiReason,
            metadata: req.body.metadata ?? {}
        });

        res.status(201).json({
            success: true,
            message: "Outgoing message saved successfully",
            data: result
        });
    }
);

export const listConversationsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const conversations = await listConversations({
            search: req.query.search as string | undefined,
            status: req.query.status as ConversationStatus | undefined,
            aiEnabled: parseBooleanQuery(req.query.aiEnabled)
        });

        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    }
);

export const getConversationController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const conversation = await getConversationById(req.params.id);

        res.status(200).json({
            success: true,
            data: conversation
        });
    }
);

export const getConversationMessagesController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const messages = await getConversationMessages(req.params.id);

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    }
);

export const markConversationAsReadController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const conversation = await markConversationAsRead(req.params.id);

        res.status(200).json({
            success: true,
            message: "Conversation marked as read",
            data: conversation
        });
    }
);

export const closeConversationController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const conversation = await closeConversation(req.params.id);

        res.status(200).json({
            success: true,
            message: "Conversation closed successfully",
            data: conversation
        });
    }
);