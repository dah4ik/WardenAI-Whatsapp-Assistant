import { useState } from "react";
import { apiClient } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { Conversation, Message } from "../types";

interface ConversationsPageProps {
    conversations: Conversation[];
    onRefresh: () => Promise<void>;
}

const formatDate = (value?: string): string => {
    if (!value) {
        return "No messages yet";
    }

    return new Date(value).toLocaleString();
};

export const ConversationsPage = ({
                                      conversations,
                                      onRefresh
                                  }: ConversationsPageProps) => {
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [actionMessage, setActionMessage] = useState("");

    const handleOpenConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setLoadingMessages(true);
        setActionMessage("");

        try {
            const loadedMessages = await apiClient.getConversationMessages(
                conversation._id
            );

            setMessages(loadedMessages);
        } catch (error) {
            setActionMessage(
                error instanceof Error ? error.message : "Failed to load messages"
            );
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleMarkAsRead = async () => {
        if (!selectedConversation) {
            return;
        }

        setActionMessage("");

        try {
            await apiClient.markConversationAsRead(selectedConversation._id);
            await onRefresh();

            setSelectedConversation({
                ...selectedConversation,
                unreadCount: 0
            });

            setActionMessage("Conversation marked as read");
        } catch (error) {
            setActionMessage(
                error instanceof Error ? error.message : "Failed to mark as read"
            );
        }
    };

    return (
        <section className="page-section">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Conversations</p>
                    <h3>Message History</h3>
                    <p>View stored incoming WhatsApp messages and AI-generated replies.</p>
                </div>
            </div>

            <div className="split-grid">
                <div className="panel">
                    <h4>Conversations</h4>

                    <div className="conversation-list">
                        {conversations.map((conversation) => (
                            <button
                                key={conversation._id}
                                className={
                                    selectedConversation?._id === conversation._id
                                        ? "conversation-item conversation-item-active"
                                        : "conversation-item"
                                }
                                onClick={() => handleOpenConversation(conversation)}
                                type="button"
                            >
                                <div>
                                    <strong>{conversation.displayName}</strong>
                                    <span>{conversation.phoneNumber}</span>
                                </div>

                                <p>{conversation.lastMessageText || "No message text"}</p>

                                <div className="conversation-meta">
                                    <StatusBadge value={conversation.status} />
                                    <small>{formatDate(conversation.lastMessageAt)}</small>
                                    {conversation.unreadCount > 0 && (
                                        <span className="unread-pill">{conversation.unreadCount}</span>
                                    )}
                                </div>
                            </button>
                        ))}

                        {conversations.length === 0 && (
                            <div className="empty-state">No conversations yet.</div>
                        )}
                    </div>
                </div>

                <div className="panel">
                    <div className="panel-header-row">
                        <h4>
                            {selectedConversation
                                ? selectedConversation.displayName
                                : "Select conversation"}
                        </h4>

                        {selectedConversation && (
                            <button
                                className="ghost-button"
                                onClick={handleMarkAsRead}
                                type="button"
                            >
                                Mark as read
                            </button>
                        )}
                    </div>

                    {actionMessage && <p className="form-message">{actionMessage}</p>}

                    {loadingMessages && <p>Loading messages...</p>}

                    {!loadingMessages && selectedConversation && (
                        <div className="messages-list">
                            {messages.map((message) => (
                                <div
                                    key={message._id}
                                    className={
                                        message.direction === "incoming"
                                            ? "message-bubble message-incoming"
                                            : "message-bubble message-outgoing"
                                    }
                                >
                                    <div className="message-meta">
                                        <strong>{message.source}</strong>
                                        <StatusBadge value={message.status} />
                                    </div>

                                    <p>{message.text}</p>

                                    {message.aiReason && (
                                        <small className="ai-reason">{message.aiReason}</small>
                                    )}

                                    <small>{formatDate(message.createdAt)}</small>
                                </div>
                            ))}

                            {messages.length === 0 && (
                                <div className="empty-state">No messages in this conversation.</div>
                            )}
                        </div>
                    )}

                    {!selectedConversation && (
                        <div className="empty-state">
                            Choose a conversation from the left side to view messages.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};