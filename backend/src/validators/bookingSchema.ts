import { z } from "zod";

export const bookingSchema = z.object({
  inviteeName: z.string().min(1),
  inviteeEmail: z.string().email(),
  startTime: z.string(),
  endTime: z.string(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
