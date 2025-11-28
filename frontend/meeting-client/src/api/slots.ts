import api from "./axios";

export const getSlots = (start: string, end: string) => {
  return api.get(`/slots`, { params: { start, end } });
};
