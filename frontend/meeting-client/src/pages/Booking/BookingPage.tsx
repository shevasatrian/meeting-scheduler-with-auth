/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import "../../App.css";

import DatePicker from "../../components/Calendar/DatePicker";
import SlotList from "../../components/Slots/SlotList";
import BookingForm from "../../components/Booking/BookingForm";
import Modal from "../../components/UI/Modal";

import { getSlots } from "../../api/slots";
import { createBooking } from "../../api/bookings";

export default function BookingPage() {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  function stripTime(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  const today = stripTime(new Date());
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 14);

  const handleDateChange = (value: string) => {
    const chosen = stripTime(new Date(value));
    console.log(chosen)

    if (chosen < today || chosen > maxDate) {
      Swal.fire({
        icon: "warning",
        title: "Out of range",
        text: "You can only book within the next 14 days.",
      });
      return;
    }

    setDate(value);
  };

  const fetchSlots = async (selectedDate: string) => {
    setSlotsLoading(true);
    setSlots([]);
    setSelectedSlot("");

    const start = selectedDate + "T00:00:00";
    const end = selectedDate + "T23:59:59";

    try {
      const res = await getSlots(start, end);
      setSlots(res.data.data[0].slots);
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (date) fetchSlots(date);
  }, [date]);

  const submitBooking = async (payload: any) => {
    setBookingLoading(true);

    try {
      await createBooking(payload);
      Swal.fire({
        title: "Success!",
        text: "Your meeting has been booked successfully.",
        icon: "success",
        confirmButtonColor: "#2563eb",
      });

      setShowModal(false);
      setSelectedSlot("");
      fetchSlots(date);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Book a Meeting</h1>
          </div>
          <p className="text-gray-600 text-sm ml-13">
            Select a date and time slot to schedule your meeting
          </p>
        </div>

        {/* Date Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Choose Date
          </label>
          <DatePicker value={date} onChange={handleDateChange} />
        </div>

        {/* Slots Section */}
        {date && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-gray-600" size={18} />
              <h2 className="text-lg font-semibold text-gray-900">
                Available Time Slots
              </h2>
            </div>

            {slotsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-gray-500 text-sm">Loading available slots...</p>
                </div>
              </div>
            ) : (
              <SlotList
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
              />
            )}

            {/* Continue Button */}
            {selectedSlot && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                >
                  Continue to Booking Details
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!date && (
          <div className="bg-white rounded-xl shadow-sm p-12 border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-gray-400" size={28} />
            </div>
            <p className="text-gray-500">Select a date to view available time slots</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <BookingForm
          date={date}
          time={selectedSlot}
          onSubmit={submitBooking}
          loading={bookingLoading}
        />
      </Modal>
    </div>
  );
}