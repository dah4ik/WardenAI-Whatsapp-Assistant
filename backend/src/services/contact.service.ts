import {
    ContactModel,
    ContactStatus,
    IContact,
    ResponseStyle
} from "../models/contact.model";
import { HttpError } from "../utils/http-error";
import { normalizePhoneNumber } from "../utils/phone.util";

export interface CreateContactInput {
    phoneNumber: string;
    displayName: string;
    notes?: string;
    status?: ContactStatus;
    autoReplyEnabled?: boolean;
    approvalRequired?: boolean;
    responseStyle?: ResponseStyle;
    customInstructions?: string;
    tags?: string[];
}

export interface UpdateContactInput {
    phoneNumber?: string;
    displayName?: string;
    notes?: string;
    status?: ContactStatus;
    autoReplyEnabled?: boolean;
    approvalRequired?: boolean;
    responseStyle?: ResponseStyle;
    customInstructions?: string;
    tags?: string[];
}

export interface ContactListFilters {
    search?: string;
    status?: ContactStatus;
    autoReplyEnabled?: boolean;
}

const allowedStatuses: ContactStatus[] = ["trusted", "normal", "blocked"];

const allowedResponseStyles: ResponseStyle[] = [
    "friendly",
    "professional",
    "short",
    "detailed",
    "custom"
];

const validateStatus = (status?: ContactStatus): void => {
    if (status && !allowedStatuses.includes(status)) {
        throw new HttpError(400, "Invalid contact status");
    }
};

const validateResponseStyle = (responseStyle?: ResponseStyle): void => {
    if (responseStyle && !allowedResponseStyles.includes(responseStyle)) {
        throw new HttpError(400, "Invalid response style");
    }
};

export const createContact = async (
    input: CreateContactInput
): Promise<IContact> => {
    if (!input.phoneNumber) {
        throw new HttpError(400, "Phone number is required");
    }

    if (!input.displayName) {
        throw new HttpError(400, "Display name is required");
    }

    validateStatus(input.status);
    validateResponseStyle(input.responseStyle);

    const normalizedPhoneNumber = normalizePhoneNumber(input.phoneNumber);

    const existingContact = await ContactModel.findOne({
        phoneNumber: normalizedPhoneNumber
    });

    if (existingContact) {
        throw new HttpError(409, "Contact with this phone number already exists");
    }

    const contact = await ContactModel.create({
        phoneNumber: normalizedPhoneNumber,
        displayName: input.displayName,
        notes: input.notes,
        status: input.status ?? "normal",
        autoReplyEnabled: input.autoReplyEnabled ?? false,
        approvalRequired: input.approvalRequired ?? true,
        responseStyle: input.responseStyle ?? "professional",
        customInstructions: input.customInstructions,
        tags: input.tags ?? []
    });

    return contact;
};

export const listContacts = async (
    filters: ContactListFilters
): Promise<IContact[]> => {
    const query: Record<string, unknown> = {};

    if (filters.status) {
        validateStatus(filters.status);
        query.status = filters.status;
    }

    if (typeof filters.autoReplyEnabled === "boolean") {
        query.autoReplyEnabled = filters.autoReplyEnabled;
    }

    if (filters.search) {
        const searchRegex = new RegExp(filters.search, "i");

        query.$or = [
            { displayName: searchRegex },
            { phoneNumber: searchRegex },
            { tags: searchRegex }
        ];
    }

    const contacts = await ContactModel.find(query)
        .sort({ updatedAt: -1 })
        .limit(200);

    return contacts;
};

export const getContactById = async (contactId: string): Promise<IContact> => {
    const contact = await ContactModel.findById(contactId);

    if (!contact) {
        throw new HttpError(404, "Contact not found");
    }

    return contact;
};

export const getContactByPhoneNumber = async (
    phoneNumber: string
): Promise<IContact | null> => {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);

    const contact = await ContactModel.findOne({
        phoneNumber: normalizedPhoneNumber
    });

    return contact;
};

export const updateContact = async (
    contactId: string,
    input: UpdateContactInput
): Promise<IContact> => {
    validateStatus(input.status);
    validateResponseStyle(input.responseStyle);

    const updateData: UpdateContactInput = {
        ...input
    };

    if (input.phoneNumber) {
        const normalizedPhoneNumber = normalizePhoneNumber(input.phoneNumber);

        const existingContact = await ContactModel.findOne({
            phoneNumber: normalizedPhoneNumber,
            _id: { $ne: contactId }
        });

        if (existingContact) {
            throw new HttpError(409, "Another contact already uses this phone number");
        }

        updateData.phoneNumber = normalizedPhoneNumber;
    }

    const updatedContact = await ContactModel.findByIdAndUpdate(
        contactId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedContact) {
        throw new HttpError(404, "Contact not found");
    }

    return updatedContact;
};

export const deleteContact = async (contactId: string): Promise<void> => {
    const deletedContact = await ContactModel.findByIdAndDelete(contactId);

    if (!deletedContact) {
        throw new HttpError(404, "Contact not found");
    }
};

export const setContactAutoReply = async (
    contactId: string,
    enabled: boolean
): Promise<IContact> => {
    const contact = await ContactModel.findByIdAndUpdate(
        contactId,
        {
            autoReplyEnabled: enabled
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!contact) {
        throw new HttpError(404, "Contact not found");
    }

    return contact;
};

export const blockContact = async (contactId: string): Promise<IContact> => {
    const contact = await ContactModel.findByIdAndUpdate(
        contactId,
        {
            status: "blocked",
            autoReplyEnabled: false
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!contact) {
        throw new HttpError(404, "Contact not found");
    }

    return contact;
};

export const unblockContact = async (contactId: string): Promise<IContact> => {
    const contact = await ContactModel.findByIdAndUpdate(
        contactId,
        {
            status: "normal"
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!contact) {
        throw new HttpError(404, "Contact not found");
    }

    return contact;
};