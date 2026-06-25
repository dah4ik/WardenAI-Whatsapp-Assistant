import { Types } from "mongoose";
import { ContactModel, IContact } from "../models/contact.model";
import {
    ConversationModel,
    ConversationStatus,
    IConversation
} from "../models/conversation.model";
import {
    IMessage,
    MessageDirection,
    MessageModel,
    MessageSource,
    MessageStatus
} from "../models/message.model";
import { HttpError } from "../utils/http-error";
import { normalizePhoneNumber } from "../utils/phone.util";

export interface CreateMessageInput {
    phoneNumber: string;
    text: string;
    direction: MessageDirection;
    source: MessageSource;
    status?: MessageStatus;
    aiModel?: string;
    aiReason?: string;
    metadata?: Record<string, unknown>;
}

export interface ConversationListFilters {
    search?: string;
    status?: ConversationStatus;
    aiEnabled?: boolean;
}

const findContactByPhoneOrFail = async (
    phoneNumber: string
): Promise<IContact> => {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    const contact = await ContactModel.findOne({
        phoneNumber: normalizedPhoneNumber
    });

    if (!contact) {
        throw new HttpError(
            404,
            "Contact not found. Add the phone number before creating a conversation."
        );
    }

    return contact;
};

const findOrCreateConversation = async (
    contact: IContact
): Promise<IConversation> => {
    const existingConversation = await ConversationModel.findOne({
        contactId: contact._id
    });

    if (existingConversation) {
        return existingConversation;
    }

    const conversation = await ConversationModel.create({
        contactId: contact._id,
        phoneNumber: contact.phoneNumber,
        displayName: contact.displayName,
        status: contact.status === "blocked" ? "blocked" : "open",
        unreadCount: 0,
        aiEnabled: contact.autoReplyEnabled,
        approvalRequired: contact.approvalRequired
    });

    return conversation;
};

export const createMessageForPhoneNumber = async (
    input: CreateMessageInput
): Promise<{
    conversation: IConversation;
    message: IMessage;
}> => {
    if (!input.text || input.text.trim().length === 0) {
        throw new HttpError(400, "Message text is required");
    }

    const contact = await findContactByPhoneOrFail(input.phoneNumber);
    const conversation = await findOrCreateConversation(contact);

    const message = await MessageModel.create({
        conversationId: conversation._id,
        contactId: contact._id,
        phoneNumber: contact.phoneNumber,
        direction: input.direction,
        source: input.source,
        status: input.status ?? "received",
        text: input.text,
        aiModel: input.aiModel,
        aiReason: input.aiReason,
        metadata: input.metadata ?? {}
    });

    const nextStatus =
        contact.status === "blocked"
            ? "blocked"
            : input.status === "pending_approval"
                ? "pending_approval"
                : "open";

    const unreadIncrement = input.direction === "incoming" ? 1 : 0;

    const updatedConversation = await ConversationModel.findByIdAndUpdate(
        conversation._id,
        {
            status: nextStatus,
            lastMessageText: input.text,
            lastMessageAt: new Date(),
            aiEnabled: contact.autoReplyEnabled,
            approvalRequired: contact.approvalRequired,
            $inc: {
                unreadCount: unreadIncrement
            }
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedConversation) {
        throw new HttpError(500, "Failed to update conversation");
    }

    await ContactModel.findByIdAndUpdate(contact._id, {
        lastMessageAt: new Date()
    });

    return {
        conversation: updatedConversation,
        message
    };
};

export const listConversations = async (
    filters: ConversationListFilters
): Promise<IConversation[]> => {
    const query: Record<string, unknown> = {};

    if (filters.status) {
        query.status = filters.status;
    }

    if (typeof filters.aiEnabled === "boolean") {
        query.aiEnabled = filters.aiEnabled;
    }

    if (filters.search) {
        const searchRegex = new RegExp(filters.search, "i");

        query.$or = [
            { displayName: searchRegex },
            { phoneNumber: searchRegex },
            { lastMessageText: searchRegex }
        ];
    }

    const conversations = await ConversationModel.find(query)
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .limit(200);

    return conversations;
};

export const getConversationById = async (
    conversationId: string
): Promise<IConversation> => {
    if (!Types.ObjectId.isValid(conversationId)) {
        throw new HttpError(400, "Invalid conversation id");
    }

    const conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
        throw new HttpError(404, "Conversation not found");
    }

    return conversation;
};

export const getConversationMessages = async (
    conversationId: string
): Promise<IMessage[]> => {
    await getConversationById(conversationId);

    const messages = await MessageModel.find({
        conversationId
    }).sort({ createdAt: 1 });

    return messages;
};

export const markConversationAsRead = async (
    conversationId: string
): Promise<IConversation> => {
    const conversation = await ConversationModel.findByIdAndUpdate(
        conversationId,
        {
            unreadCount: 0
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!conversation) {
        throw new HttpError(404, "Conversation not found");
    }

    return conversation;
};

export const closeConversation = async (
    conversationId: string
): Promise<IConversation> => {
    const conversation = await ConversationModel.findByIdAndUpdate(
        conversationId,
        {
            status: "closed"
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!conversation) {
        throw new HttpError(404, "Conversation not found");
    }

    return conversation;
};