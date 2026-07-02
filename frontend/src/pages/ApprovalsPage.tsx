import { useState } from "react";
import { apiClient } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { Message } from "../types";

interface ApprovalsPageProps {
    approvals: Message[];
    onRefresh: () => Promise<void>;
}

const formatDate = (value?: string): string => {
    if (!value) {
        return "Unknown date";
    }

    return new Date(value).toLocaleString();
};

export const ApprovalsPage = ({ approvals, onRefresh }: ApprovalsPageProps) => {
    const [reviewer, setReviewer] = useState("admin");
    const [note, setNote] = useState("");
    const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
    const [actionMessage, setActionMessage] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const getUpdatedText = (message: Message): string | undefined => {
        const editedText = editedTexts[message._id];

        if (!editedText || editedText.trim().length === 0) {
            return undefined;
        }

        return editedText.trim();
    };

    const handleApprove = async (message: Message) => {
        setProcessingId(message._id);
        setActionMessage("");

        try {
            await apiClient.approveMessage(message._id, {
                reviewer,
                note,
                updatedText: getUpdatedText(message)
            });

            setActionMessage("Message approved successfully");
            await onRefresh();
        } catch (error) {
            setActionMessage(error instanceof Error ? error.message : "Approve failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (message: Message) => {
        setProcessingId(message._id);
        setActionMessage("");

        try {
            await apiClient.rejectMessage(message._id, {
                reviewer,
                note
            });

            setActionMessage("Message rejected successfully");
            await onRefresh();
        } catch (error) {
            setActionMessage(error instanceof Error ? error.message : "Reject failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleApproveAndSend = async (message: Message) => {
        setProcessingId(message._id);
        setActionMessage("");

        try {
            await apiClient.approveAndSendMessage(message._id, {
                reviewer,
                note,
                updatedText: getUpdatedText(message)
            });

            setActionMessage("Message approved and sent successfully");
            await onRefresh();
        } catch (error) {
            setActionMessage(
                error instanceof Error ? error.message : "Approve and send failed"
            );
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <section className="page-section">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Approvals</p>
                    <h3>AI Review Queue</h3>
                    <p>
                        Review sensitive AI-generated replies before they can be sent to
                        WhatsApp.
                    </p>
                </div>
            </div>

            <div className="panel approval-controls">
                <label>
                    Reviewer
                    <input
                        value={reviewer}
                        onChange={(event) => setReviewer(event.target.value)}
                        placeholder="admin"
                    />
                </label>

                <label>
                    Review Note
                    <input
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Optional review note"
                    />
                </label>
            </div>

            {actionMessage && <p className="form-message">{actionMessage}</p>}

            <div className="approvals-grid">
                {approvals.map((message) => (
                    <div className="approval-card" key={message._id}>
                        <div className="approval-card-header">
                            <div>
                                <strong>{message.phoneNumber}</strong>
                                <small>{formatDate(message.createdAt)}</small>
                            </div>

                            <StatusBadge value={message.status} />
                        </div>

                        <div className="approval-body">
                            <p>{message.text}</p>
                        </div>

                        {message.aiReason && (
                            <div className="risk-box">
                                <strong>AI risk reason</strong>
                                <p>{message.aiReason}</p>
                            </div>
                        )}

                        <label>
                            Edit before approval
                            <textarea
                                value={editedTexts[message._id] ?? ""}
                                onChange={(event) =>
                                    setEditedTexts({
                                        ...editedTexts,
                                        [message._id]: event.target.value
                                    })
                                }
                                placeholder="Optional edited reply text"
                            />
                        </label>

                        <div className="action-row">
                            <button
                                className="primary-button"
                                disabled={processingId === message._id}
                                onClick={() => handleApproveAndSend(message)}
                                type="button"
                            >
                                Approve & Send
                            </button>

                            <button
                                className="ghost-button"
                                disabled={processingId === message._id}
                                onClick={() => handleApprove(message)}
                                type="button"
                            >
                                Approve
                            </button>

                            <button
                                className="danger-button"
                                disabled={processingId === message._id}
                                onClick={() => handleReject(message)}
                                type="button"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}

                {approvals.length === 0 && (
                    <div className="empty-state large-empty-state">
                        No pending approvals. Sensitive AI replies will appear here.
                    </div>
                )}
            </div>
        </section>
    );
};