export type PageKey = "overview" | "contacts" | "conversations" | "approvals";

export type ContactStatus = "trusted" | "normal" | "blocked";

export type ResponseStyle =
    | "friendly"
    | "professional"
    | "short"
    | "detailed"
    | "custom";

export interface Contact {
    _id: string;
    phoneNumber: string;
    displayName: string;
    notes?: string;
    status: ContactStatus;
    autoReplyEnabled: boolean;
    approvalRequired: boolean;
    responseStyle: ResponseStyle;
    customInstructions?: string;
    tags: string[];
    lastMessageAt?: string;
    createdAt: string;
    updatedAt: string;
}

export type ConversationStatus =
    | "open"
    | "pending_approval"
    | "closed"
    | "blocked";

export interface Conversation {
    _id: string;
    contactId: string;
    phoneNumber: string;
    displayName: string;
    status: ConversationStatus;
    lastMessageText?: string;
    lastMessageAt?: string;
    unreadCount: number;
    aiEnabled: boolean;
    approvalRequired: boolean;
    createdAt: string;
    updatedAt: string;
}

export type MessageDirection = "incoming" | "outgoing";
export type MessageSource = "whatsapp" | "dashboard" | "ai" | "system";

export type MessageStatus =
    | "received"
    | "generated"
    | "pending_approval"
    | "approved"
    | "sent"
    | "failed"
    | "ignored"
    | "rejected";

export interface Message {
    _id: string;
    conversationId: string;
    contactId: string;
    phoneNumber: string;
    direction: MessageDirection;
    source: MessageSource;
    status: MessageStatus;
    text: string;
    originalText?: string;
    aiModel?: string;
    aiReason?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface ApiListResponse<T> {
    success: boolean;
    count: number;
    data: T[];
    message?: string;
}

export interface ApiSingleResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ContactCreateInput {
    phoneNumber: string;
    displayName: string;
    notes?: string;
    status: ContactStatus;
    autoReplyEnabled: boolean;
    approvalRequired: boolean;
    responseStyle: ResponseStyle;
    tags: string[];
}

export interface ApprovalActionInput {
    reviewer: string;
    note?: string;
    updatedText?: string;
}