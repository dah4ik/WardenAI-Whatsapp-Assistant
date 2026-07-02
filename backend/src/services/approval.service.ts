import { Types } from "mongoose";
import { ConversationModel } from "../models/conversation.model";
import { IMessage, MessageModel } from "../models/message.model";
import { WhatsAppSendTextResult } from "../types/whatsapp-sender.types";
import { HttpError } from "../utils/http-error";
import { sendStoredOutgoingMessage } from "./whatsapp-sender.service";

export interface ApprovalActionInput {
    reviewer?: string;
    note?: string;
    updatedText?: string;
}

export interface ApproveAndSendResult {
    message: IMessage;
    sendResult: WhatsAppSendTextResult;
}

const getMessageOrFail = async (messageId: string): Promise<IMessage> => {
    if (!Types.ObjectId.isValid(messageId)) {
        throw new HttpError(400, "Invalid message id");
    }

    const message = await MessageModel.findById(messageId);

    if (!message) {
        throw new HttpError(404, "Message not found");
    }

    return message;
};

const ensureMessageCanBeApproved = (message: IMessage): void => {
    if (message.direction !== "outgoing") {
        throw new HttpError(400, "Only outgoing messages can be approved");
    }

    if (message.status !== "pending_approval") {
        throw new HttpError(
            409,
            `Only pending approval messages can be approved. Current status: ${message.status}`
        );
    }
};

const updateConversationAfterApprovalAction = async (
    conversationId: Types.ObjectId
): Promise<void> => {
    await ConversationModel.findByIdAndUpdate(
        conversationId,
        {
            status: "open"
        },
        {
            runValidators: true
        }
    );
};

export const listPendingApprovalMessages = async (): Promise<IMessage[]> => {
    const messages = await MessageModel.find({
        direction: "outgoing",
        status: "pending_approval"
    })
        .sort({ createdAt: -1 })
        .limit(200);

    return messages;
};

export const approvePendingMessage = async (
    messageId: string,
    input: ApprovalActionInput
): Promise<IMessage> => {
    const message = await getMessageOrFail(messageId);

    ensureMessageCanBeApproved(message);

    const approvedText =
        input.updatedText && input.updatedText.trim().length > 0
            ? input.updatedText.trim()
            : message.text;

    const updatedMetadata = {
        ...(message.metadata || {}),
        approval: {
            status: "approved",
            reviewer: input.reviewer || "dashboard-user",
            note: input.note || null,
            approvedAt: new Date().toISOString(),
            textWasEdited: approvedText !== message.text
        }
    };

    const updatedMessage = await MessageModel.findByIdAndUpdate(
        message._id,
        {
            status: "approved",
            text: approvedText,
            originalText: approvedText !== message.text ? message.text : message.originalText,
            metadata: updatedMetadata
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedMessage) {
        throw new HttpError(500, "Failed to approve message");
    }

    await updateConversationAfterApprovalAction(updatedMessage.conversationId);

    return updatedMessage;
};

export const rejectPendingMessage = async (
    messageId: string,
    input: ApprovalActionInput
): Promise<IMessage> => {
    const message = await getMessageOrFail(messageId);

    ensureMessageCanBeApproved(message);

    const updatedMetadata = {
        ...(message.metadata || {}),
        approval: {
            status: "rejected",
            reviewer: input.reviewer || "dashboard-user",
            note: input.note || null,
            rejectedAt: new Date().toISOString()
        }
    };

    const updatedMessage = await MessageModel.findByIdAndUpdate(
        message._id,
        {
            status: "rejected",
            metadata: updatedMetadata
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedMessage) {
        throw new HttpError(500, "Failed to reject message");
    }

    await updateConversationAfterApprovalAction(updatedMessage.conversationId);

    return updatedMessage;
};

export const approveAndSendPendingMessage = async (
    messageId: string,
    input: ApprovalActionInput
): Promise<ApproveAndSendResult> => {
    const approvedMessage = await approvePendingMessage(messageId, input);

    const sendResult = await sendStoredOutgoingMessage(String(approvedMessage._id));

    const refreshedMessage = await MessageModel.findById(approvedMessage._id);

    if (!refreshedMessage) {
        throw new HttpError(500, "Failed to reload sent message");
    }

    return {
        message: refreshedMessage,
        sendResult
    };
};