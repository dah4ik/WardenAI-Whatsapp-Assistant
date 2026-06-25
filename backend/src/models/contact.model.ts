import mongoose, { Document, Schema } from "mongoose";
import { normalizePhoneNumber } from "../utils/phone.util";

export type ContactStatus = "trusted" | "normal" | "blocked";

export type ResponseStyle =
    | "friendly"
    | "professional"
    | "short"
    | "detailed"
    | "custom";

export interface IContact extends Document {
    phoneNumber: string;
    displayName: string;
    notes?: string;
    status: ContactStatus;
    autoReplyEnabled: boolean;
    approvalRequired: boolean;
    responseStyle: ResponseStyle;
    customInstructions?: string;
    tags: string[];
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
    {
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        displayName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 2000
        },
        status: {
            type: String,
            enum: ["trusted", "normal", "blocked"],
            default: "normal",
            index: true
        },
        autoReplyEnabled: {
            type: Boolean,
            default: false,
            index: true
        },
        approvalRequired: {
            type: Boolean,
            default: true
        },
        responseStyle: {
            type: String,
            enum: ["friendly", "professional", "short", "detailed", "custom"],
            default: "professional"
        },
        customInstructions: {
            type: String,
            trim: true,
            maxlength: 3000
        },
        tags: {
            type: [String],
            default: []
        },
        lastMessageAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

ContactSchema.pre("validate", function normalizeContactPhone(next) {
    if (this.phoneNumber) {
        this.phoneNumber = normalizePhoneNumber(this.phoneNumber);
    }

    if (this.tags && Array.isArray(this.tags)) {
        this.tags = this.tags
            .map((tag) => tag.trim().toLowerCase())
            .filter((tag) => tag.length > 0);
    }

    next();
});

ContactSchema.index({
    displayName: "text",
    phoneNumber: "text",
    tags: "text"
});

export const ContactModel = mongoose.model<IContact>(
    "Contact",
    ContactSchema
);