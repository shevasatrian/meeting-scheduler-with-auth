import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";

export const settingsRouter = Router();

settingsRouter.get("/", getSettings);
settingsRouter.put("/", updateSettings);
