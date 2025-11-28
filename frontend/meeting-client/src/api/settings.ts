/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

export const getSettings = () => api.get("/settings");

export const updateSettings = (payload: any) =>
  api.put("/settings", payload);
