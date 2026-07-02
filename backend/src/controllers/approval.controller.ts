import { Request, Response } from "express";
import {
    approveAndSendPendingMessage,
    approvePendingMessage,
    listPendingApprovalMessages,
    rejectPendingMessage
} from "../services/approval.service";
import { asyncHandler } from "../utils/async-handler";

export const listPendingApprovalsController = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
        const messages = await listPendingApprovalMessages();

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    }
);

export const approveMessageController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const message = await approvePendingMessage(req.params.messageId, {
            reviewer: req.body.reviewer,
            note: req.body.note,
            updatedText: req.body.updatedText
        });

        res.status(200).json({
            success: true,
            message: "AI message approved successfully",
            data: message
        });
    }
);

export const rejectMessageController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const message = await rejectPendingMessage(req.params.messageId, {
            reviewer: req.body.reviewer,
            note: req.body.note
        });

        res.status(200).json({
            success: true,
            message: "AI message rejected successfully",
            data: message
        });
    }
);

export const approveAndSendMessageController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const result = await approveAndSendPendingMessage(req.params.messageId, {
            reviewer: req.body.reviewer,
            note: req.body.note,
            updatedText: req.body.updatedText
        });

        res.status(result.sendResult.success ? 200 : 502).json({
            success: result.sendResult.success,
            message: result.sendResult.success
                ? "AI message approved and sent successfully"
                : "AI message approved but sending failed",
            data: result
        });
    }
);