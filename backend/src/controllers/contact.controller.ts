import { Request, Response } from "express";
import { ContactStatus } from "../models/contact.model";
import {
    blockContact,
    createContact,
    deleteContact,
    getContactById,
    getContactByPhoneNumber,
    listContacts,
    setContactAutoReply,
    unblockContact,
    updateContact
} from "../services/contact.service";
import { asyncHandler } from "../utils/async-handler";
import { HttpError } from "../utils/http-error";

const parseBooleanQuery = (value: unknown): boolean | undefined => {
    if (value === undefined) {
        return undefined;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    throw new HttpError(400, "Boolean query value must be true or false");
};

export const createContactController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const contact = await createContact(req.body);

        res.status(201).json({
            success: true,
            message: "Contact created successfully",
            data: contact
        });
    }
);

export const listContactsController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const contacts = await listContacts({
            search: req.query.search as string | undefined,
            status: req.query.status as ContactStatus | undefined,
            autoReplyEnabled: parseBooleanQuery(req.query.autoReplyEnabled)
        });

        res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    }
);

export const getContactByIdController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const contact = await getContactById(req.params.id);

        res.status(200).json({
            success: true,
            data: contact
        });
    }
);

export const getContactByPhoneController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const contact = await getContactByPhoneNumber(req.params.phoneNumber);

        if (!contact) {
            throw new HttpError(404, "Contact not found");
        }

        res.status(200).json({
            success: true,
            data: contact
        });
    }
);

export const updateContactController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const contact = await updateContact(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: contact
        });
    }
);

export const deleteContactController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        await deleteContact(req.params.id);

        res.status(200).json({
            success: true,
            message: "Contact deleted successfully"
        });
    }
);

export const setAutoReplyController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        if (typeof req.body.enabled !== "boolean") {
            throw new HttpError(400, "enabled must be a boolean value");
        }

        const contact = await setContactAutoReply(req.params.id, req.body.enabled);

        res.status(200).json({
            success: true,
            message: "Contact auto-reply setting updated successfully",
            data: contact
        });
    }
);

export const blockContactController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const contact = await blockContact(req.params.id);

        res.status(200).json({
            success: true,
            message: "Contact blocked successfully",
            data: contact
        });
    }
);

export const unblockContactController = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
        const contact = await unblockContact(req.params.id);

        res.status(200).json({
            success: true,
            message: "Contact unblocked successfully",
            data: contact
        });
    }
);