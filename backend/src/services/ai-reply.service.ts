import { MessageStatus } from "../models/message.model";

export type AIRiskLevel = "low" | "medium" | "high";

export interface AIRiskAnalysis {
    riskLevel: AIRiskLevel;
    requiresApproval: boolean;
    reason: string;
    matchedSignals: string[];
}

export interface AIReplyGenerationInput {
    phoneNumber: string;
    incomingText: string;
    incomingMessageId?: string;
}

export interface AIReplyGenerationResult {
    generated: boolean;
    replyText?: string;
    model?: string;
    status?: MessageStatus;
    riskAnalysis?: AIRiskAnalysis;
    reason: string;
    savedMessageId?: string;
    conversationId?: string;
}

export interface AIMessageContextItem {
    direction: "incoming" | "outgoing";
    text: string;
    createdAt: Date;
}

export interface AIReplyPreviewInput {
    phoneNumber: string;
    text: string;
}

export interface AIReplyPreviewResult {
    replyText: string;
    model: string;
    riskAnalysis: AIRiskAnalysis;
    promptPreview: string;
}