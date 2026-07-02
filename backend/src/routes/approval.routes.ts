import { Router } from "express";
import {
    approveAndSendMessageController,
    approveMessageController,
    listPendingApprovalsController,
    rejectMessageController
} from "../controllers/approval.controller";

export const approvalRoutes = Router();

approvalRoutes.get("/pending", listPendingApprovalsController);

approvalRoutes.post("/:messageId/approve", approveMessageController);
approvalRoutes.post("/:messageId/reject", rejectMessageController);
approvalRoutes.post("/:messageId/approve-and-send", approveAndSendMessageController);