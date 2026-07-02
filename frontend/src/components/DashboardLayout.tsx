import { PageKey } from "../types";

interface DashboardLayoutProps {
    currentPage: PageKey;
    onNavigate: (page: PageKey) => void;
    children: React.ReactNode;
}

const navigationItems: Array<{
    key: PageKey;
    label: string;
    description: string;
}> = [
    {
        key: "overview",
        label: "Overview",
        description: "System status"
    },
    {
        key: "contacts",
        label: "Contacts",
        description: "Allowed numbers"
    },
    {
        key: "conversations",
        label: "Conversations",
        description: "Message history"
    },
    {
        key: "approvals",
        label: "Approvals",
        description: "AI review queue"
    }
];

export const DashboardLayout = ({
                                    currentPage,
                                    onNavigate,
                                    children
                                }: DashboardLayoutProps) => {
    return (
        <div className="dashboard-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-icon">W</div>
                    <div>
                        <h1>WardenAI</h1>
                        <p>WhatsApp Assistant</p>
                    </div>
                </div>

                <nav className="nav-list">
                    {navigationItems.map((item) => (
                        <button
                            key={item.key}
                            className={
                                currentPage === item.key ? "nav-item nav-item-active" : "nav-item"
                            }
                            onClick={() => onNavigate(item.key)}
                            type="button"
                        >
                            <span>{item.label}</span>
                            <small>{item.description}</small>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <p>Mode</p>
                    <strong>Local Development</strong>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="eyebrow">AI WhatsApp Automation Platform</p>
                        <h2>Admin Dashboard</h2>
                    </div>

                    <div className="topbar-status">
                        <span className="pulse-dot" />
                        Backend API: localhost:4000
                    </div>
                </header>

                {children}
            </main>
        </div>
    );
};