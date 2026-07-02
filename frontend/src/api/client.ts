import {
    ApiListResponse,
    ApiSingleResponse,
    ApprovalActionInput,
    Contact,
    ContactCreateInput,
    Conversation,
    Message
} from "../types";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const buildUrl = (path: string): string => {
    return `${API_BASE_URL}${path}`;
};

const request = async <T>(
    path: string,
    options: RequestInit = {}
): Promise<T> => {
    const response = await fetch(buildUrl(path), {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`;

        throw new Error(message);
    }

    return data as T;
};

export const apiClient = {
    async getContacts(): Promise<Contact[]> {
        const response = await request<ApiListResponse<Contact>>("/contacts");

        return response.data;
    },

    async createContact(input: ContactCreateInput): Promise<Contact> {
        const response = await request<ApiSingleResponse<Contact>>("/contacts", {
            method: "POST",
            body: JSON.stringify(input)
        });

        return response.data;
    },

    async setContactAutoReply(
        contactId: string,
        enabled: boolean
    ): Promise<Contact> {
        const response = await request<ApiSingleResponse<Contact>>(
            `/contacts/${contactId}/auto-reply`,
            {
                method: "PATCH",
                body: JSON.stringify({ enabled })
            }
        );

        return response.data;
    },

    async blockContact(contactId: string): Promise<Contact> {
        const response = await request<ApiSingleResponse<Contact>>(
            `/contacts/${contactId}/block`,
            {
                method: "PATCH"
            }
        );

        return response.data;
    },

    async unblockContact(contactId: string): Promise<Contact> {
        const response = await request<ApiSingleResponse<Contact>>(
            `/contacts/${contactId}/unblock`,
            {
                method: "PATCH"
            }
        );

        return response.data;
    },

    async getConversations(): Promise<Conversation[]> {
        const response =
            await request<ApiListResponse<Conversation>>("/conversations");

        return response.data;
    },

    async getConversationMessages(conversationId: string): Promise<Message[]> {
        const response = await request<ApiListResponse<Message>>(
            `/conversations/${conversationId}/messages`
        );

        return response.data;
    },

    async markConversationAsRead(
        conversationId: string
    ): Promise<Conversation> {
        const response = await request<ApiSingleResponse<Conversation>>(
            `/conversations/${conversationId}/read`,
            {
                method: "PATCH"
            }
        );

        return response.data;
    },

    async getPendingApprovals(): Promise<Message[]> {
        const response =
            await request<ApiListResponse<Message>>("/approvals/pending");

        return response.data;
    },

    async approveMessage(
        messageId: string,
        input: ApprovalActionInput
    ): Promise<Message> {
        const response = await request<ApiSingleResponse<Message>>(
            `/approvals/${messageId}/approve`,
            {
                method: "POST",
                body: JSON.stringify(input)
            }
        );

        return response.data;
    },

    async rejectMessage(
        messageId: string,
        input: ApprovalActionInput
    ): Promise<Message> {
        const response = await request<ApiSingleResponse<Message>>(
            `/approvals/${messageId}/reject`,
            {
                method: "POST",
                body: JSON.stringify(input)
            }
        );

        return response.data;
    },

    async approveAndSendMessage(
        messageId: string,
        input: ApprovalActionInput
    ): Promise<unknown> {
        const response = await request<ApiSingleResponse<unknown>>(
            `/approvals/${messageId}/approve-and-send`,
            {
                method: "POST",
                body: JSON.stringify(input)
            }
        );

        return response.data;
    }
};