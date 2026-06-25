import { Request, Response } from "express";
import {
    generateAIReplyPreview,
    generateAndStoreAIReply
} from "../services/ai-reply.service";
import { asyncHandler } from "../utils/async-handler";

export const previewAIReplyController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const result = await generateAIReplyPreview({
            phoneNumber: req.body.phoneNumber,
            text: req.body.text
        });

        res.status(200).json({
            success: true,
            message: "AI reply preview generated successfully",
            data: result
        });
    }
);

export const generateAndStoreAIReplyController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const result = await generateAndStoreAIReply({
            phoneNumber: req.body.phoneNumber,
            incomingText: req.body.incomingText,
            incomingMessageId: req.body.incomingMessageId
        });

        res.status(201).json({
            success: true,
            message: "AI reply generation processed successfully",
            data: result
        });
    }
);