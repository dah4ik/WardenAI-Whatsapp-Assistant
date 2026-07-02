import { Contact, Conversation, Message } from "../types";
import { StatCard } from "../components/StatCard";

interface OverviewPageProps {
    contacts: Contact[];
    conversations: Conversation[];
    approvals: Message[];
    loading: boolean;
    onRefresh: () => void;
}

export const OverviewPage = ({
                                 contacts,
                                 conversations,
                                 approvals,
                                 loading,
                                 onRefresh
                             }: OverviewPageProps) => {
    const trustedContacts = contacts.filter(
        (contact) => contact.status === "trusted"
    ).length;

    const autoReplyContacts = contacts.filter(
        (contact) => contact.autoReplyEnabled
    ).length;

    const unreadConversations = conversations.reduce(
        (total, conversation) => total + conversation.unreadCount,
        0
    );

    return (
        <section className="page-section">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Overview</p>
                    <h3>System Snapshot</h3>
                    <p>
                        High-level view of contacts, conversations, AI approvals and unread
                        messages.
                    </p>
                </div>

                <button className="primary-button" onClick={onRefresh} type="button">
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Contacts"
                    value={contacts.length}
                    description="Total managed WhatsApp numbers"
                />
                <StatCard
                    title="Trusted"
                    value={trustedContacts}
                    description="Contacts allowed for stronger automation"
                />
                <StatCard
                    title="Auto Reply"
                    value={autoReplyContacts}
                    description="Contacts with AI auto-reply enabled"
                />
                <StatCard
                    title="Unread"
                    value={unreadConversations}
                    description="Unread incoming WhatsApp messages"
                />
                <StatCard
                    title="Conversations"
                    value={conversations.length}
                    description="Active and historical conversations"
                />
                <StatCard
                    title="Pending Approvals"
                    value={approvals.length}
                    description="AI-generated replies waiting for review"
                />
            </div>

            <div className="info-panel">
                <h4>Current Development Stage</h4>
                <p>
                    The dashboard is connected to the backend API and can display contacts,
                    conversations, messages and pending AI approvals. The next stage will
                    add manual replies, AI previews and contact-level settings from the UI.
                </p>
            </div>
        </section>
    );
};