import { Request, Response } from "express";
import { env } from "../config/env";
import {
    processMockIncomingMessage,
    processWhatsAppCloudWebhookPayload
} from "../services/whatsapp-webhook.service";
import { WhatsAppCloudWebhookPayload } from "../types/whatsapp.types";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";

export const verifyWhatsAppWebhookController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode !== "subscribe") {
            throw new HttpError(400, "Invalid webhook verification mode");
        }

        if (!challenge || typeof challenge !== "string") {
            throw new HttpError(400, "Missing webhook challenge");
        }

        if (token !== env.whatsappVerifyToken) {
            throw new HttpError(403, "Invalid WhatsApp verify token");
        }

        res.status(200).send(challenge);
    }
);

export const receiveWhatsAppWebhookController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const payload = req.body as WhatsAppCloudWebhookPayload;

        const results = await processWhatsAppCloudWebhookPayload(payload);

        res.status(200).json({
            success: true,
            message: "WhatsApp webhook processed successfully",
            processedMessages: results.length,
            data: results
        });
    }
);

export const testIncomingWhatsAppMessageController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const result = await processMockIncomingMessage({
            phoneNumber: req.body.phoneNumber,
            text: req.body.text,
            contactName: req.body.contactName,
            messageId: req.body.messageId
        });

        res.status(201).json({
            success: true,
            message: "Mock WhatsApp incoming message processed successfully",
            data: result
        });
    }
);