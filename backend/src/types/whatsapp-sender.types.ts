export type WhatsAppSenderMode = "mock" | "cloud";

export interface WhatsAppSendTextInput {
    to: string;
    text: string;
    previewUrl?: boolean;
}

export interface WhatsAppSendTextResult {
    success: boolean;
    mode: WhatsAppSenderMode;
    providerMessageId?: string;
    statusCode?: number;
    error?: string;
    rawResponse?: unknown;
}

export interface WhatsAppCloudSendContact {
    input?: string;
    wa_id?: string;
}

export interface WhatsAppCloudSendMessage {
    id?: string;
    message_status?: string;
}

export interface WhatsAppCloudError {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
}

export interface WhatsAppCloudSendResponse {
    messaging_product?: string;
    contacts?: WhatsAppCloudSendContact[];
    messages?: WhatsAppCloudSendMessage[];
    error?: WhatsAppCloudError;
}