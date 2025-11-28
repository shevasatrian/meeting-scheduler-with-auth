import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { generateSlots } from "../utils/slotGenerator";

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const start = new Date(req.query.start as string);
    const end = new Date(req.query.end as string);

    const settings = await prisma.organizerSettings.findFirst();
    if (!settings) {
      return res.status(400).json({ error: "Organizer settings not found" });
    }

    // Convert blackoutDates from JsonValue → string[]
    const safeSettings = {
      ...settings,
      blackoutDates: Array.isArray(settings.blackoutDates)
        ? (settings.blackoutDates as string[])
        : [],
    };

    const bookingsRaw = await prisma.booking.findMany({
        where: {
            AND: [
            { endTime: { gte: start } },
            { startTime: { lte: end } },
            { isDeleted: false }
            ],
        },
        orderBy: { startTime: "asc" },
    });

    // FIX: convert ISO string → real Date object
    const bookings = bookingsRaw.map((b: { startTime: string | number | Date; endTime: string | number | Date; }) => ({
        startTime: new Date(b.startTime),
        endTime: new Date(b.endTime)
    }));

    const result = generateSlots({
      startDate: start,
      endDate: end,
      settings: safeSettings,
      bookings,
    });

    res.json({ data: result });
  } catch (error) {
    console.error("Slots error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
