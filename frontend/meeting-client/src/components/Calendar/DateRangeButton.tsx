import { useState, useRef, useEffect } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Props {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
}

export default function DateRangeButton({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // CLICK OUTSIDE → CLOSE POPUP
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const label =
    value?.from && value?.to
      ? `${value.from.toLocaleDateString()} - ${value.to.toLocaleDateString()}`
      : "Pilih Rentang Tanggal";

  const handleSelect = (range: DateRange | undefined) => {
    // jangan close popup kalau baru klik 1x
    if (range?.from && range.to && range.from.getTime() !== range.to.getTime()) {
      onChange(range);
      setOpen(false);
    } else {
      // user baru pilih 1 tanggal → simpan dulu
      onChange(range);
    }
  };

  return (
    <div className="relative inline-block w-full" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="border border-gray-300 px-4 py-2.5 rounded-lg bg-white hover:bg-gray-50 w-full text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent truncate"
      >
        <span className={`block truncate ${value?.from && value?.to ? "text-gray-900" : "text-gray-500"}`}>
          {label}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 bg-white shadow-xl border border-gray-200 rounded-lg mt-2 p-3 left-0">
          <DayPicker
            mode="range"
            selected={value}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}