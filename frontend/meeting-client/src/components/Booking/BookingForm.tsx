/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

interface BookingFormProps {
  date: string;
  time: string;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export default function BookingForm({
  date,
  time,
  onSubmit,
  loading = false,
}: BookingFormProps) {
  const [form, setForm] = useState({
    inviteeName: "",
    inviteeEmail: "",
  });

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = () => {
    if (loading) return;

    const start = `${date}T${time}:00`;

    const startDate = new Date(start);
    const endDate = new Date(startDate.getTime() + 30 * 60000);

    const pad = (n: number) => String(n).padStart(2, "0");
    const end = [
      endDate.getFullYear(),
      pad(endDate.getMonth() + 1),
      pad(endDate.getDate()),
    ].join("-") +
      "T" +
      [pad(endDate.getHours()), pad(endDate.getMinutes()), "00"].join(":");

    onSubmit({
      inviteeName: form.inviteeName,
      inviteeEmail: form.inviteeEmail,
      startTime: start,
      endTime: end,
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Enter your details</h3>

      <input
        name="inviteeName"
        placeholder="Your Name"
        className="border p-2 rounded w-full"
        onChange={change}
        disabled={loading}
      />

      <input
        name="inviteeEmail"
        placeholder="Email"
        className="border p-2 rounded w-full"
        onChange={change}
        disabled={loading}
      />

      <button
        onClick={submit}
        disabled={loading}
        className={`w-full p-2 rounded text-white ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
        }`}
      >
        {loading ? "Submitting..." : "Confirm Booking"}
      </button>
    </div>
  );
}
