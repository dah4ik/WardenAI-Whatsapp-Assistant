import mongoose, { Document, Schema, Types } from "mongoose";

export type MessageDirection = "incoming" | "outgoing";
export type MessageSource = "whatsapp" | "dashboard" | "ai" | "system";
export type MessageStatus =
    | "received"
    | "generated"
    | "pending_approval"
    | "approved"
    | "sent"
    | "failed"
    | "ignored";

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    contactId: Types.ObjectId;
    phoneNumber: string;
    direction: MessageDirection;
    source: MessageSource;
    status: MessageStatus;
    text: string;
    originalText?: string;
    aiModel?: string;
    aiReason?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true
        },
        contactId: {
            type: Schema.Types.ObjectId,
            ref: "Contact",
            required: true,
            index: true
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        direction: {
            type: String,
            enum: ["incoming", "outgoing"],
            required: true,
            index: true
        },
        source: {
            type: String,
            enum: ["whatsapp", "dashboard", "ai", "system"],
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: [
                "received",
                "generated",
                "pending_approval",
                "approved",
                "sent",
                "failed",
                "ignored"
            ],
            default: "received",
            index: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        originalText: {
            type: String,
            trim: true
        },
        aiModel: {
            type: String,
            trim: true
        },
        aiReason: {
            type: String,
            trim: true
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

MessageSchema.index({
    text: "text",
    phoneNumber: "text"
});

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);