import { Request, Response } from "express";
import { prisma } from "../db/prisma";
import { bookingSchema } from "../validators/bookingSchema";

export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { isDeleted: false },
      orderBy: { startTime: "asc" },
    });

    res.json({ data: bookings });
  } catch (error) {
    console.error("GET bookings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const parse = bookingSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.flatten() });
    }

    const data = parse.data;

    // Prevent double booking using transaction
    const booking = await prisma.$transaction(async (tx: any) => {
      // check if slot is already taken
      const existing = await tx.booking.findFirst({
        where: {
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          isDeleted: false,
        },
      });

      if (existing) {
        throw new Error("Slot already booked");
      }

      // create booking
      return await tx.booking.create({
        data: {
          inviteeName: data.inviteeName,
          inviteeEmail: data.inviteeEmail,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
        },
      });
    });

    res.json({ message: "Booking created", data: booking });
  } catch (error) {
    if (String(error).includes("Slot already booked")) {
      return res.status(409).json({ error: "Slot already booked" });
    }

    console.error("Create booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prisma.booking.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    res.json({ message: "Booking deleted" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const rescheduleBooking = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const parse = bookingSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: parse.error.flatten() });
    }

    const data = parse.data;

    const updated = await prisma.$transaction(async (tx: any) => {
      // Check if the new slot is already taken (excluding itself)
      const existing = await tx.booking.findFirst({
        where: {
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          isDeleted: false,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error("Slot already booked");
      }

      // Update the existing record (preserve the same ID)
      return await tx.booking.update({
        where: { id },
        data: {
          inviteeName: data.inviteeName,
          inviteeEmail: data.inviteeEmail,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
        },
      });
    });

    res.json({ message: "Booking rescheduled", data: updated });
  } catch (error) {
    if (String(error).includes("Slot already booked")) {
      return res.status(409).json({ error: "Slot already booked" });
    }

    console.error("Reschedule booking error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
