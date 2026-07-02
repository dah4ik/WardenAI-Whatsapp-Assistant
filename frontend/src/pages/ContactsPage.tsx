import { FormEvent, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { Contact, ContactCreateInput, ContactStatus, ResponseStyle } from "../types";
import { apiClient } from "../api/client";

interface ContactsPageProps {
    contacts: Contact[];
    onRefresh: () => Promise<void>;
}

const initialForm: ContactCreateInput = {
    phoneNumber: "",
    displayName: "",
    notes: "",
    status: "normal",
    autoReplyEnabled: false,
    approvalRequired: true,
    responseStyle: "professional",
    tags: []
};

export const ContactsPage = ({ contacts, onRefresh }: ContactsPageProps) => {
    const [form, setForm] = useState<ContactCreateInput>(initialForm);
    const [tagsText, setTagsText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionMessage, setActionMessage] = useState("");

    const handleCreateContact = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsSubmitting(true);
        setActionMessage("");

        try {
            await apiClient.createContact({
                ...form,
                tags: tagsText
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
            });

            setForm(initialForm);
            setTagsText("");
            setActionMessage("Contact created successfully");
            await onRefresh();
        } catch (error) {
            setActionMessage(error instanceof Error ? error.message : "Create failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleAutoReply = async (contact: Contact) => {
        setActionMessage("");

        try {
            await apiClient.setContactAutoReply(contact._id, !contact.autoReplyEnabled);
            await onRefresh();
        } catch (error) {
            setActionMessage(error instanceof Error ? error.message : "Update failed");
        }
    };

    const handleBlockToggle = async (contact: Contact) => {
        setActionMessage("");

        try {
            if (contact.status === "blocked") {
                await apiClient.unblockContact(contact._id);
            } else {
                await apiClient.blockContact(contact._id);
            }

            await onRefresh();
        } catch (error) {
            setActionMessage(error instanceof Error ? error.message : "Update failed");
        }
    };

    return (
        <section className="page-section">
            <div className="page-header">
                <div>
                    <p className="eyebrow">Contacts</p>
                    <h3>Managed WhatsApp Numbers</h3>
                    <p>
                        Add numbers that the assistant is allowed to know. Unknown numbers
                        are ignored by default.
                    </p>
                </div>
            </div>

            <div className="split-grid">
                <form className="panel form-panel" onSubmit={handleCreateContact}>
                    <h4>Add Contact</h4>

                    <label>
                        Phone Number
                        <input
                            value={form.phoneNumber}
                            onChange={(event) =>
                                setForm({ ...form, phoneNumber: event.target.value })
                            }
                            placeholder="+972501234567"
                            required
                        />
                    </label>

                    <label>
                        Display Name
                        <input
                            value={form.displayName}
                            onChange={(event) =>
                                setForm({ ...form, displayName: event.target.value })
                            }
                            placeholder="Client name"
                            required
                        />
                    </label>

                    <label>
                        Status
                        <select
                            value={form.status}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    status: event.target.value as ContactStatus
                                })
                            }
                        >
                            <option value="normal">normal</option>
                            <option value="trusted">trusted</option>
                            <option value="blocked">blocked</option>
                        </select>
                    </label>

                    <label>
                        Response Style
                        <select
                            value={form.responseStyle}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    responseStyle: event.target.value as ResponseStyle
                                })
                            }
                        >
                            <option value="professional">professional</option>
                            <option value="friendly">friendly</option>
                            <option value="short">short</option>
                            <option value="detailed">detailed</option>
                            <option value="custom">custom</option>
                        </select>
                    </label>

                    <label>
                        Tags
                        <input
                            value={tagsText}
                            onChange={(event) => setTagsText(event.target.value)}
                            placeholder="client, vip, test"
                        />
                    </label>

                    <label>
                        Notes
                        <textarea
                            value={form.notes}
                            onChange={(event) =>
                                setForm({ ...form, notes: event.target.value })
                            }
                            placeholder="Optional internal notes"
                        />
                    </label>

                    <div className="checkbox-row">
                        <input
                            id="autoReplyEnabled"
                            type="checkbox"
                            checked={form.autoReplyEnabled}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    autoReplyEnabled: event.target.checked
                                })
                            }
                        />
                        <label htmlFor="autoReplyEnabled">Enable AI auto-reply</label>
                    </div>

                    <div className="checkbox-row">
                        <input
                            id="approvalRequired"
                            type="checkbox"
                            checked={form.approvalRequired}
                            onChange={(event) =>
                                setForm({
                                    ...form,
                                    approvalRequired: event.target.checked
                                })
                            }
                        />
                        <label htmlFor="approvalRequired">Require approval</label>
                    </div>

                    <button className="primary-button" disabled={isSubmitting} type="submit">
                        {isSubmitting ? "Creating..." : "Create Contact"}
                    </button>

                    {actionMessage && <p className="form-message">{actionMessage}</p>}
                </form>

                <div className="panel">
                    <h4>Contacts List</h4>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>AI</th>
                                <th>Approval</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact._id}>
                                    <td>
                                        <strong>{contact.displayName}</strong>
                                        <small>{contact.tags.join(", ") || "No tags"}</small>
                                    </td>
                                    <td>{contact.phoneNumber}</td>
                                    <td>
                                        <StatusBadge value={contact.status} />
                                    </td>
                                    <td>{contact.autoReplyEnabled ? "Enabled" : "Disabled"}</td>
                                    <td>{contact.approvalRequired ? "Required" : "Not required"}</td>
                                    <td>
                                        <div className="action-row">
                                            <button
                                                className="ghost-button"
                                                onClick={() => handleToggleAutoReply(contact)}
                                                type="button"
                                            >
                                                {contact.autoReplyEnabled ? "Disable AI" : "Enable AI"}
                                            </button>
                                            <button
                                                className={
                                                    contact.status === "blocked"
                                                        ? "ghost-button"
                                                        : "danger-button"
                                                }
                                                onClick={() => handleBlockToggle(contact)}
                                                type="button"
                                            >
                                                {contact.status === "blocked" ? "Unblock" : "Block"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan={6}>No contacts yet.</td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
};