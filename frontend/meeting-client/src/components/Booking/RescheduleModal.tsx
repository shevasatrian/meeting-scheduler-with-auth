/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Modal from "../UI/Modal";
import DatePicker from "../Calendar/DatePicker";
import SlotList from "../Slots/SlotList";
import { getSlots } from "../../api/slots";
import { rescheduleBooking } from "../../api/bookings";
import Swal from "sweetalert2";
import { Calendar, Clock, User, Mail, ArrowRight } from "lucide-react";

interface BookingForReschedule {
  id: number;
  inviteeName: string;
  inviteeEmail: string;
  startTime: string;
  endTime: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  booking: BookingForReschedule | null;
  onDone?: () => void;
}

export default function RescheduleModal({ open, onClose, booking, onDone }: Props) {
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const getDurationFromBooking = () => {
    if (!booking) return 30;
    const s = new Date(booking.startTime);
    const e = new Date(booking.endTime);
    return Math.round((e.getTime() - s.getTime()) / 60000);
  };

  useEffect(() => {
    if (!open) {
      setDate("");
      setSlots([]);
      setSelectedSlot("");
      setLoadingSlots(false);
      setSubmitting(false);
    }
  }, [open]);

  const fetchSlotsForDate = async (selectedDate: string) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot("");
    try {
      const start = `${selectedDate}T00:00:00`;
      const end = `${selectedDate}T23:59:59`;
      const res = await getSlots(start, end);
      const days = res?.data?.data || [];
      if (Array.isArray(days) && days.length > 0) {
        const dayEntry = days.find((d: any) => d.date === selectedDate);
        setSlots(dayEntry ? dayEntry.slots : []);
      } else {
        setSlots([]);
      }
    } catch (err) {
      console.error("fetch slots error", err);
      Swal.fire("Error", "Gagal memuat slots", "error");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (date) fetchSlotsForDate(date);
  }, [date]);

  const handleConfirm = async () => {
    if (!booking) return;
    if (!selectedSlot) {
      Swal.fire("Info", "Pilih slot terlebih dahulu", "info");
      return;
    }

    setSubmitting(true);
    try {
      const start = `${date}T${selectedSlot}`;
      const dur = getDurationFromBooking();
      const startDate = new Date(start);
      const endDate = new Date(startDate.getTime() + dur * 60000);

      const pad = (n: number) => String(n).padStart(2, "0");
      const end =
        [endDate.getFullYear(), pad(endDate.getMonth() + 1), pad(endDate.getDate())].join("-") +
        "T" +
        [pad(endDate.getHours()), pad(endDate.getMinutes())].join(":");

      const payload = {
        inviteeName: booking.inviteeName,
        inviteeEmail: booking.inviteeEmail,
        startTime: start,
        endTime: end,
      };

      await rescheduleBooking(booking.id, payload);

      Swal.fire({
        title: "Rescheduled",
        text: "Booking berhasil dijadwalkan ulang",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
      });

      onDone && onDone();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || "Gagal menjadwalkan ulang";
      Swal.fire("Error", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-6">
        {!booking ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Current Booking Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <Calendar size={16} />
                Current Booking
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3">
                  <User size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="font-medium text-gray-900">{booking.inviteeName}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{booking.inviteeEmail}</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Current Time</div>
                    <div className="font-medium text-gray-900">
                      {new Date(booking.startTime).toLocaleString()} -{" "}
                      {new Date(booking.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* New Date Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select New Date
              </label>
              <div className="w-full max-w-sm mx-auto">
                <DatePicker value={date} onChange={setDate} />
              </div>
            </div>

            {/* Available Slots */}
            {date && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Available Time Slots
                </label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="inline-block w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading slots...</p>
                    </div>
                  </div>
                ) : (
                  <SlotList slots={slots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleConfirm}
                disabled={submitting || !selectedSlot}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-colors ${
                  submitting || !selectedSlot
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm Reschedule
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                disabled={submitting}
                className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}