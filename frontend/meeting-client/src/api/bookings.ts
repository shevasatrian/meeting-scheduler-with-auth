/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "./axios";

export const getBookings = () => api.get("/bookings");

export const createBooking = (payload: any) =>
  api.post("/bookings/public", payload);

export const deleteBooking = (id: number) =>
  api.delete(`/bookings/${id}`);

export const rescheduleBooking = (id: number, payload: any) =>
  api.put(`/bookings/${id}/reschedule`, payload);
