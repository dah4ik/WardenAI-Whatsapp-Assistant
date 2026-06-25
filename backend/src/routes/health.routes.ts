import { Router } from "express";
import { getHealthStatus } from "../controllers/health.controller";

export const healthRoutes = Router();

healthRoutes.get("/", getHealthStatus);