import { Request, Response } from "express";
import {
    sendStoredOutgoingMessage,
    sendTextMessageToWhatsApp
} from "../services/whatsapp-sender.service";
import { asyncHandler } from "../utils/async-handler";

export const sendTextMessageController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const result = await sendTextMessageToWhatsApp({
            to: req.body.to,
            text: req.body.text,
            previewUrl: req.body.previewUrl
        });

        res.status(result.success ? 200 : 502).json({
            success: result.success,
            message: result.success
                ? "WhatsApp text message sent successfully"
                : "Failed to send WhatsApp text message",
            data: result
        });
    }
);

export const sendStoredMessageController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const result = await sendStoredOutgoingMessage(req.params.messageId);

        res.status(result.success ? 200 : 502).json({
            success: result.success,
            message: result.success
                ? "Stored outgoing message sent successfully"
                : "Failed to send stored outgoing message",
            data: result
        });
    }
);