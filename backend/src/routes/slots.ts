import { Router } from "express";
import { getAvailableSlots } from "../controllers/slotsController";

export const slotsRouter = Router();

slotsRouter.get("/", getAvailableSlots);
