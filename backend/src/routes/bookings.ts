import { Router } from "express";
import {
  getBookings,
  createBooking,
  deleteBooking,
  rescheduleBooking,
} from "../controllers/bookingsController";

export const bookingsRouter = Router();

bookingsRouter.get("/", getBookings);
bookingsRouter.post("/", createBooking);
bookingsRouter.delete("/:id", deleteBooking);
bookingsRouter.put("/:id/reschedule", rescheduleBooking);
