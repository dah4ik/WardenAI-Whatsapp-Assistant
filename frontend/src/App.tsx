import { useCallback, useEffect, useState } from "react";
import { apiClient } from "./api/client";
import { DashboardLayout } from "./components/DashboardLayout";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { ContactsPage } from "./pages/ContactsPage";
import { ConversationsPage } from "./pages/ConversationsPage";
import { OverviewPage } from "./pages/OverviewPage";
import { Contact, Conversation, Message, PageKey } from "./types";

const App = () => {
    const [currentPage, setCurrentPage] = useState<PageKey>("overview");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [approvals, setApprovals] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState("");

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setGlobalError("");

        try {
            const [loadedContacts, loadedConversations, loadedApprovals] =
                await Promise.all([
                    apiClient.getContacts(),
                    apiClient.getConversations(),
                    apiClient.getPendingApprovals()
                ]);

            setContacts(loadedContacts);
            setConversations(loadedConversations);
            setApprovals(loadedApprovals);
        } catch (error) {
            setGlobalError(
                error instanceof Error
                    ? error.message
                    : "Failed to load dashboard data"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboardData();
    }, [loadDashboardData]);

    const renderPage = () => {
        if (currentPage === "contacts") {
            return (
                <ContactsPage contacts={contacts} onRefresh={loadDashboardData} />
            );
        }

        if (currentPage === "conversations") {
            return (
                <ConversationsPage
                    conversations={conversations}
                    onRefresh={loadDashboardData}
                />
            );
        }

        if (currentPage === "approvals") {
            return (
                <ApprovalsPage approvals={approvals} onRefresh={loadDashboardData} />
            );
        }

        return (
            <OverviewPage
                contacts={contacts}
                conversations={conversations}
                approvals={approvals}
                loading={loading}
                onRefresh={loadDashboardData}
            />
        );
    };

    return (
        <DashboardLayout currentPage={currentPage} onNavigate={setCurrentPage}>
            {globalError && (
                <div className="error-banner">
                    <strong>API Error:</strong> {globalError}
                </div>
            )}

            {loading && <div className="loading-banner">Loading dashboard data...</div>}

            {renderPage()}
        </DashboardLayout>
    );
};

export default App;