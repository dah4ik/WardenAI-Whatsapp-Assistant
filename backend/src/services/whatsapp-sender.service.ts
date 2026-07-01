import { Types } from "mongoose";
import { env } from "../config/env";
import { ConversationModel } from "../models/conversation.model";
import { MessageModel } from "../models/message.model";
import {
    WhatsAppCloudSendResponse,
    WhatsAppSenderMode,
    WhatsAppSendTextInput,
    WhatsAppSendTextResult
} from "../types/whatsapp-sender.types";
import { HttpError } from "../utils/http-error";
import { normalizePhoneNumber } from "../utils/phone.util";

const getSenderMode = (): WhatsAppSenderMode => {
    if (env.whatsappSenderMode === "cloud") {
        return "cloud";
    }

    return "mock";
};

const normalizeWhatsAppRecipient = (phoneNumber: string): string => {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    return normalizedPhoneNumber.replace("+", "");
};

const isCloudConfigMissing = (): boolean => {
    return (
        !env.whatsappAccessToken ||
        !env.whatsappPhoneNumberId ||
        env.whatsappAccessToken === "replace_me" ||
        env.whatsappPhoneNumberId === "replace_me"
    );
};

const sendTextMessageMock = async (
    input: WhatsAppSendTextInput
): Promise<WhatsAppSendTextResult> => {
    const normalizedRecipient = normalizeWhatsAppRecipient(input.to);

    return {
        success: true,
        mode: "mock",
        providerMessageId: `mock_wamid_${Date.now()}_${normalizedRecipient}`,
        statusCode: 200,
        rawResponse: {
            messaging_product: "whatsapp",
            contacts: [
                {
                    input: normalizedRecipient,
                    wa_id: normalizedRecipient
                }
            ],
            messages: [
                {
                    id: `mock_wamid_${Date.now()}_${normalizedRecipient}`,
                    message_status: "accepted"
                }
            ],
            text: input.text
        }
    };
};

const sendTextMessageCloud = async (
    input: WhatsAppSendTextInput
): Promise<WhatsAppSendTextResult> => {
    if (isCloudConfigMissing()) {
        return {
            success: false,
            mode: "cloud",
            statusCode: 500,
            error:
                "WhatsApp Cloud API configuration is missing. Check WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID."
        };
    }

    const normalizedRecipient = normalizeWhatsAppRecipient(input.to);

    const endpoint = `${env.whatsappApiBaseUrl}/${env.whatsappApiVersion}/${env.whatsappPhoneNumberId}/messages`;

    const requestBody = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedRecipient,
        type: "text",
        text: {
            preview_url: input.previewUrl ?? false,
            body: input.text
        }
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env.whatsappAccessToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    const responseBody = (await response
        .json()
        .catch(() => null)) as WhatsAppCloudSendResponse | null;

    if (!response.ok) {
        return {
            success: false,
            mode: "cloud",
            statusCode: response.status,
            error:
                responseBody?.error?.message ||
                `WhatsApp Cloud API request failed with status ${response.status}`,
            rawResponse: responseBody
        };
    }

    return {
        success: true,
        mode: "cloud",
        providerMessageId: responseBody?.messages?.[0]?.id,
        statusCode: response.status,
        rawResponse: responseBody
    };
};

export const sendTextMessageToWhatsApp = async (
    input: WhatsAppSendTextInput
): Promise<WhatsAppSendTextResult> => {
    if (!input.to) {
        throw new HttpError(400, "Recipient phone number is required");
    }

    if (!input.text || input.text.trim().length === 0) {
        throw new HttpError(400, "Message text is required");
    }

    if (input.text.length > 4096) {
        throw new HttpError(
            400,
            "WhatsApp text message is too long. Maximum allowed length is 4096 characters."
        );
    }

    const mode = getSenderMode();

    if (mode === "mock") {
        return sendTextMessageMock(input);
    }

    return sendTextMessageCloud(input);
};

export const sendStoredOutgoingMessage = async (
    messageId: string
): Promise<WhatsAppSendTextResult> => {
    if (!Types.ObjectId.isValid(messageId)) {
        throw new HttpError(400, "Invalid message id");
    }

    const message = await MessageModel.findById(messageId);

    if (!message) {
        throw new HttpError(404, "Message not found");
    }

    if (message.direction !== "outgoing") {
        throw new HttpError(400, "Only outgoing messages can be sent");
    }

    if (message.status === "sent") {
        throw new HttpError(409, "Message was already sent");
    }

    if (message.status === "pending_approval") {
        throw new HttpError(
            409,
            "Message requires manual approval before sending"
        );
    }

    if (message.status === "ignored") {
        throw new HttpError(409, "Ignored messages cannot be sent");
    }

    const sendResult = await sendTextMessageToWhatsApp({
        to: message.phoneNumber,
        text: message.text,
        previewUrl: false
    });

    const updatedMetadata = {
        ...(message.metadata || {}),
        whatsappSendResult: sendResult,
        sentAt: sendResult.success ? new Date().toISOString() : undefined,
        failedAt: sendResult.success ? undefined : new Date().toISOString()
    };

    const nextStatus = sendResult.success ? "sent" : "failed";

    await MessageModel.findByIdAndUpdate(
        message._id,
        {
            status: nextStatus,
            metadata: updatedMetadata
        },
        {
            runValidators: true
        }
    );

    if (message.conversationId) {
        await ConversationModel.findByIdAndUpdate(
            message.conversationId,
            {
                lastMessageText: message.text,
                lastMessageAt: new Date()
            },
            {
                runValidators: true
            }
        );
    }

    return sendResult;
};