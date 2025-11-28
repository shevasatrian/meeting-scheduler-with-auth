interface SlotListProps {
  slots: string[];
  selectedSlot?: string;
  onSelect: (slot: string) => void;
}

export default function SlotList({ slots, selectedSlot, onSelect }: SlotListProps) {
  if (!slots.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No slots available for this date.</p>
        <p className="text-gray-400 text-sm mt-1">Please select another date.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className={`
            relative py-3 px-4 rounded-lg border-2 font-medium text-sm
            transition-all duration-200
            ${
              selectedSlot === slot
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700"
            }
          `}
        >
          {slot}
          {selectedSlot === slot && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
          )}
        </button>
      ))}
    </div>
  );
}