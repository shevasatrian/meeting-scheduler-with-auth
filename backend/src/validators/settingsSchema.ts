import { z } from "zod";

export const settingsSchema = z.object({
  timezone: z.string(),
  workingHoursStart: z.string(),
  workingHoursEnd: z.string(),
  meetingDuration: z.number().min(1),
  bufferBefore: z.number().min(0),
  bufferAfter: z.number().min(0),
  minimumNotice: z.number().min(0),
  blackoutDates: z.array(z.string()),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
