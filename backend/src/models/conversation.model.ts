import mongoose, { Document, Schema, Types } from "mongoose";

export type ConversationStatus = "open" | "pending_approval" | "closed" | "blocked";

export interface IConversation extends Document {
    contactId: Types.ObjectId;
    phoneNumber: string;
    displayName: string;
    status: ConversationStatus;
    lastMessageText?: string;
    lastMessageAt?: Date;
    unreadCount: number;
    aiEnabled: boolean;
    approvalRequired: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
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
        displayName: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["open", "pending_approval", "closed", "blocked"],
            default: "open",
            index: true
        },
        lastMessageText: {
            type: String,
            trim: true
        },
        lastMessageAt: {
            type: Date,
            index: true
        },
        unreadCount: {
            type: Number,
            default: 0
        },
        aiEnabled: {
            type: Boolean,
            default: false,
            index: true
        },
        approvalRequired: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

ConversationSchema.index({
    phoneNumber: "text",
    displayName: "text",
    lastMessageText: "text"
});

export const ConversationModel = mongoose.model<IConversation>(
    "Conversation",
    ConversationSchema
);