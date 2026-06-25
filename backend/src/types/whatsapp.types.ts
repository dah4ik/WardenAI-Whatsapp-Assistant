export interface WhatsAppTextMessage {
    body?: string;
}

export interface WhatsAppButtonMessage {
    text?: string;
    payload?: string;
}

export interface WhatsAppInteractiveReply {
    id?: string;
    title?: string;
    description?: string;
}

export interface WhatsAppInteractiveMessage {
    type?: string;
    button_reply?: WhatsAppInteractiveReply;
    list_reply?: WhatsAppInteractiveReply;
}

export interface WhatsAppImageMessage {
    id?: string;
    mime_type?: string;
    sha256?: string;
    caption?: string;
}

export interface WhatsAppDocumentMessage {
    id?: string;
    filename?: string;
    mime_type?: string;
    sha256?: string;
    caption?: string;
}

export interface WhatsAppAudioMessage {
    id?: string;
    mime_type?: string;
    sha256?: string;
}

export interface WhatsAppVideoMessage {
    id?: string;
    mime_type?: string;
    sha256?: string;
    caption?: string;
}

export interface WhatsAppCloudMessage {
    from?: string;
    id?: string;
    timestamp?: string;
    type?: string;
    text?: WhatsAppTextMessage;
    button?: WhatsAppButtonMessage;
    interactive?: WhatsAppInteractiveMessage;
    image?: WhatsAppImageMessage;
    document?: WhatsAppDocumentMessage;
    audio?: WhatsAppAudioMessage;
    video?: WhatsAppVideoMessage;
}

export interface WhatsAppCloudContactProfile {
    name?: string;
}

export interface WhatsAppCloudContact {
    profile?: WhatsAppCloudContactProfile;
    wa_id?: string;
}

export interface WhatsAppCloudMetadata {
    display_phone_number?: string;
    phone_number_id?: string;
}

export interface WhatsAppCloudValue {
    messaging_product?: string;
    metadata?: WhatsAppCloudMetadata;
    contacts?: WhatsAppCloudContact[];
    messages?: WhatsAppCloudMessage[];
    statuses?: unknown[];
}

export interface WhatsAppCloudChange {
    field?: string;
    value?: WhatsAppCloudValue;
}

export interface WhatsAppCloudEntry {
    id?: string;
    changes?: WhatsAppCloudChange[];
}

export interface WhatsAppCloudWebhookPayload {
    object?: string;
    entry?: WhatsAppCloudEntry[];
}

export interface ParsedWhatsAppIncomingMessage {
    from: string;
    messageId?: string;
    timestamp?: string;
    type: string;
    text: string;
    contactName?: string;
    rawMessage: WhatsAppCloudMessage;
}

export interface MockIncomingWhatsAppMessage {
    phoneNumber: string;
    text: string;
    contactName?: string;
    messageId?: string;
}