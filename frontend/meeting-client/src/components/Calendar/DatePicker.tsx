import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const selectedDate = value ? new Date(value) : undefined;

  // Range valid: hari ini sampai 14 hari ke depan
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  maxDate.setHours(0, 0, 0, 0);

  const handleSelect = (day: Date | undefined) => {
    if (!day) return;

    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, "0");
    const date = String(day.getDate()).padStart(2, "0");

    onChange(`${year}-${month}-${date}`);
  };

  return (
    <div className="border rounded p-4 shadow-sm">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleSelect}
        disabled={[
          { before: today },   // disable sebelum hari ini
          { after: maxDate }   // disable setelah 14 hari
        ]}
      />
    </div>
  );
}
