import {
    MockIncomingWhatsAppMessage,
    ParsedWhatsAppIncomingMessage,
    WhatsAppCloudMessage,
    WhatsAppCloudWebhookPayload
} from "../types/whatsapp.types";
import { getContactByPhoneNumber } from "./contact.service";
import { createMessageForPhoneNumber } from "./conversation.service";
import { HttpError } from "../utils/http-error";
import { normalizePhoneNumber } from "../utils/phone.util";

export interface WebhookProcessingResult {
    phoneNumber: string;
    messageText: string;
    action: "stored" | "ignored" | "blocked";
    reason?: string;
    shouldAutoReply: boolean;
    approvalRequired: boolean;
    conversationId?: string;
    messageId?: string;
}

const getTextFromWhatsAppMessage = (
    message: WhatsAppCloudMessage
): string | null => {
    const messageType = message.type;

    if (messageType === "text") {
        return message.text?.body?.trim() || null;
    }

    if (messageType === "button") {
        return (
            message.button?.text?.trim() ||
            message.button?.payload?.trim() ||
            "[button message]"
        );
    }

    if (messageType === "interactive") {
        return (
            message.interactive?.button_reply?.title?.trim() ||
            message.interactive?.list_reply?.title?.trim() ||
            "[interactive message]"
        );
    }

    if (messageType === "image") {
        return message.image?.caption?.trim() || "[image message]";
    }

    if (messageType === "document") {
        return (
            message.document?.caption?.trim() ||
            message.document?.filename?.trim() ||
            "[document message]"
        );
    }

    if (messageType === "audio") {
        return "[audio message]";
    }

    if (messageType === "video") {
        return message.video?.caption?.trim() || "[video message]";
    }

    return messageType ? `[unsupported message type: ${messageType}]` : null;
};

export const parseWhatsAppCloudWebhookPayload = (
    payload: WhatsAppCloudWebhookPayload
): ParsedWhatsAppIncomingMessage[] => {
    const parsedMessages: ParsedWhatsAppIncomingMessage[] = [];

    if (!payload.entry || !Array.isArray(payload.entry)) {
        return parsedMessages;
    }

    for (const entry of payload.entry) {
        if (!entry.changes || !Array.isArray(entry.changes)) {
            continue;
        }

        for (const change of entry.changes) {
            const value = change.value;

            if (!value?.messages || !Array.isArray(value.messages)) {
                continue;
            }

            for (const message of value.messages) {
                if (!message.from) {
                    continue;
                }

                const text = getTextFromWhatsAppMessage(message);

                if (!text) {
                    continue;
                }

                const contact = value.contacts?.find(
                    (item) => item.wa_id === message.from
                );

                parsedMessages.push({
                    from: message.from,
                    messageId: message.id,
                    timestamp: message.timestamp,
                    type: message.type || "unknown",
                    text,
                    contactName: contact?.profile?.name,
                    rawMessage: message
                });
            }
        }
    }

    return parsedMessages;
};

export const processIncomingWhatsAppMessage = async (
    input: ParsedWhatsAppIncomingMessage
): Promise<WebhookProcessingResult> => {
    const normalizedPhoneNumber = normalizePhoneNumber(input.from);

    const contact = await getContactByPhoneNumber(normalizedPhoneNumber);

    if (!contact) {
        return {
            phoneNumber: normalizedPhoneNumber,
            messageText: input.text,
            action: "ignored",
            reason: "Phone number is not registered in contacts",
            shouldAutoReply: false,
            approvalRequired: true
        };
    }

    if (contact.status === "blocked") {
        const result = await createMessageForPhoneNumber({
            phoneNumber: normalizedPhoneNumber,
            text: input.text,
            direction: "incoming",
            source: "whatsapp",
            status: "ignored",
            metadata: {
                whatsappMessageId: input.messageId,
                whatsappTimestamp: input.timestamp,
                whatsappMessageType: input.type,
                contactName: input.contactName,
                ignoredReason: "Contact is blocked",
                rawMessage: input.rawMessage
            }
        });

        return {
            phoneNumber: normalizedPhoneNumber,
            messageText: input.text,
            action: "blocked",
            reason: "Contact is blocked",
            shouldAutoReply: false,
            approvalRequired: true,
            conversationId: String(result.conversation._id),
            messageId: String(result.message._id)
        };
    }

    const result = await createMessageForPhoneNumber({
        phoneNumber: normalizedPhoneNumber,
        text: input.text,
        direction: "incoming",
        source: "whatsapp",
        status: "received",
        metadata: {
            whatsappMessageId: input.messageId,
            whatsappTimestamp: input.timestamp,
            whatsappMessageType: input.type,
            contactName: input.contactName,
            rawMessage: input.rawMessage
        }
    });

    return {
        phoneNumber: normalizedPhoneNumber,
        messageText: input.text,
        action: "stored",
        shouldAutoReply: contact.autoReplyEnabled,
        approvalRequired: contact.approvalRequired,
        conversationId: String(result.conversation._id),
        messageId: String(result.message._id)
    };
};

export const processWhatsAppCloudWebhookPayload = async (
    payload: WhatsAppCloudWebhookPayload
): Promise<WebhookProcessingResult[]> => {
    const parsedMessages = parseWhatsAppCloudWebhookPayload(payload);

    const results: WebhookProcessingResult[] = [];

    for (const message of parsedMessages) {
        const result = await processIncomingWhatsAppMessage(message);

        results.push(result);
    }

    return results;
};

export const processMockIncomingMessage = async (
    input: MockIncomingWhatsAppMessage
): Promise<WebhookProcessingResult> => {
    if (!input.phoneNumber) {
        throw new HttpError(400, "phoneNumber is required");
    }

    if (!input.text || input.text.trim().length === 0) {
        throw new HttpError(400, "text is required");
    }

    const parsedMessage: ParsedWhatsAppIncomingMessage = {
        from: input.phoneNumber,
        messageId: input.messageId || `mock_${Date.now()}`,
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: "text",
        text: input.text,
        contactName: input.contactName,
        rawMessage: {
            from: input.phoneNumber,
            id: input.messageId || `mock_${Date.now()}`,
            timestamp: String(Math.floor(Date.now() / 1000)),
            type: "text",
            text: {
                body: input.text
            }
        }
    };

    return processIncomingWhatsAppMessage(parsedMessage);
};