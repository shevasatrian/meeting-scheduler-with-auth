import cron from "node-cron";
import { prisma } from "../db/prisma";
import { sendEmailReminder } from "../services/emailService";
import { addHours, subHours, 
    // isWithinInterval
 } from "date-fns";

export function startReminderScheduler() {
  console.log("⏱️ Reminder scheduler running...");

  // Run every 1 minute
  cron.schedule("* * * * *", async () => {
    console.log("CRON TICK:", new Date().toISOString());
    const now = new Date();

    // ---- 1. REMINDER: 1 hour before ----
    const oneHourLater = addHours(now, 1);
    console.info(oneHourLater)

    const bookings1Hour = await prisma.booking.findMany({
      where: {
        reminded1Hour: false,
        startTime: {
          gte: now,
          lte: oneHourLater,
        },
      },
    });

    for (const booking of bookings1Hour) {
      console.log(`Sending 1-hour reminder for booking ${booking.id}`);

      await sendEmailReminder(
        booking.inviteeEmail,
        `Reminder: Your meeting is in 1 hour`,
        `Hi ${booking.inviteeName}, your meeting starts in 1 hour at ${booking.startTime}.`
      );

      await prisma.booking.update({
        where: { id: booking.id },
        data: { reminded1Hour: true },
      });
    }

    // ---- 2. REMINDER: At meeting start time ----
    const bookingsStart = await prisma.booking.findMany({
      where: {
        remindedAtStart: false,
        startTime: {
          gte: now,
          lte: addHours(now, 0.02), // tolerance 1–2 minutes
        },
      },
    });

    for (const booking of bookingsStart) {
      console.log(`Sending start-time reminder for booking ${booking.id}`);

      await sendEmailReminder(
        booking.inviteeEmail,
        `Your meeting is starting now`,
        `Hi ${booking.inviteeName}, your meeting is starting right now.`
      );

      await prisma.booking.update({
        where: { id: booking.id },
        data: { remindedAtStart: true },
      });
    }
  });
}
