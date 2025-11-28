/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Props {
  value: string[]; // array of "yyyy-mm-dd"
  onChange: (dates: string[]) => void;
}

function toDateArray(strs: string[]) {
  return strs.map(s => {
    const [y,m,d] = s.split("-");
    return new Date(Number(y), Number(m)-1, Number(d));
  });
}

function toIsoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

export default function BlackoutDatePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date[]>(toDateArray(value || []));
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelected(toDateArray(value || []));
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative inline-block w-full" ref={ref}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="border rounded p-2 w-full text-left bg-white"
        >
          {selected.length === 0 ? "No blackout dates" : `${selected.length} date(s) selected`}
        </button>
        <button
          type="button"
          onClick={() => { setSelected([]); onChange([]); }}
          className="border rounded p-2 bg-gray-100"
        >
          Clear
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 p-3 bg-white border rounded shadow-lg">
          <DayPicker
            mode="multiple"
            selected={selected}
            onSelect={(sel) => {
              const arr = Array.isArray(sel) ? sel : (sel ? [sel] : []);
              setSelected(arr);
              onChange(arr.map(toIsoDate));
            }}
            numberOfMonths={2}
          />
        </div>
      )}
    </div>
  );
}
