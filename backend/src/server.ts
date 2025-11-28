import express from "express";
import cors from "cors";
import { settingsRouter } from "./routes/settings"; 
import { bookingsRouter } from "./routes/bookings"; 
import { slotsRouter } from "./routes/slots"; 
import { startReminderScheduler } from "./scheduler/reminderScheduler";
import { authRouter } from "./routes/auth";
import { requireAuth } from "./middleware/auth";

const app = express();

app.use(cors());
app.use(express.json());

// Auth routes
app.use("/api/auth", authRouter);

app.use("/api/bookings/public", bookingsRouter);

// Protected routes
app.use("/api/settings", requireAuth, settingsRouter);
app.use("/api/bookings", requireAuth, bookingsRouter);

// Public route (slots & create booking)
app.use("/api/slots", slotsRouter); 


startReminderScheduler();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
