import { Router } from "express";
import {
    blockContactController,
    createContactController,
    deleteContactController,
    getContactByIdController,
    getContactByPhoneController,
    listContactsController,
    setAutoReplyController,
    unblockContactController,
    updateContactController
} from "../controllers/contact.controller";

export const contactRoutes = Router();

contactRoutes.get("/", listContactsController);
contactRoutes.post("/", createContactController);

contactRoutes.get("/phone/:phoneNumber", getContactByPhoneController);

contactRoutes.get("/:id", getContactByIdController);
contactRoutes.patch("/:id", updateContactController);
contactRoutes.delete("/:id", deleteContactController);

contactRoutes.patch("/:id/auto-reply", setAutoReplyController);
contactRoutes.patch("/:id/block", blockContactController);
contactRoutes.patch("/:id/unblock", unblockContactController);