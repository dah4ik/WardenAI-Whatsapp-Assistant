import { Router } from "express";
import {
    generateAndStoreAIReplyController,
    previewAIReplyController
} from "../controllers/ai.controller";

export const aiRoutes = Router();

aiRoutes.post("/reply/preview", previewAIReplyController);
aiRoutes.post("/reply/generate", generateAndStoreAIReplyController);