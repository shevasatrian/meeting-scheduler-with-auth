import { prisma } from "../db/prisma";
import { settingsSchema } from "../validators/settingsSchema";
import { Request, Response } from "express";

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.organizerSettings.findFirst();

    if (!settings) {
      return res.json({ message: "No settings found", data: null });
    }

    res.json({ data: settings });
  } catch (error) {
    console.error("GET settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const parseResult = settingsSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.flatten() });
    }

    const data = parseResult.data;

    const existing = await prisma.organizerSettings.findFirst();

    let saved;

    if (existing) {
      saved = await prisma.organizerSettings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      saved = await prisma.organizerSettings.create({ data });
    }

    res.json({ message: "Settings saved", data: saved });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
