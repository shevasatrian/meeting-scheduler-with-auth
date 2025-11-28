import { addMinutes, isBefore, isAfter, format } from "date-fns";
import { toDate } from "date-fns-tz";

interface GenerateSlotsProps {
  startDate: Date;
  endDate: Date;
  settings: {
    timezone: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    meetingDuration: number;
    bufferBefore: number;
    bufferAfter: number;
    minimumNotice: number;
    blackoutDates: string[];
  };
  bookings: {
    startTime: Date; // already UTC because Prisma stores ISO timestamps
    endTime: Date;
  }[];
}

export function generateSlots({
  startDate,
  endDate,
  settings,
  bookings,
}: GenerateSlotsProps) {
  const {
    timezone,
    workingHoursStart,
    workingHoursEnd,
    meetingDuration,
    bufferBefore,
    bufferAfter,
    minimumNotice,
    blackoutDates,
  } = settings;

  const days: any[] = [];
  const minNoticeTime = addMinutes(new Date(), minimumNotice * 60);

  // LOOP TANGGAL
  for (
    let day = new Date(startDate);
    !isAfter(day, endDate);
    day = addMinutes(day, 1440)
  ) {
    const dayStr = format(day, "yyyy-MM-dd");

    // SKIP BLACKOUT
    if (blackoutDates.includes(dayStr)) continue;

    // KONVERSI JAM KERJA KE UTC
    const workingStartUTC = toDate(`${dayStr}T${workingHoursStart}:00`, {
      timeZone: timezone,
    });

    const workingEndUTC = toDate(`${dayStr}T${workingHoursEnd}:00`, {
      timeZone: timezone,
    });

    const slots: string[] = [];

    // LOOP SLOT PER 30 MENIT (meetingDuration)
    for (
      let slotStart = workingStartUTC;
      isBefore(slotStart, workingEndUTC);
      slotStart = addMinutes(slotStart, meetingDuration)
    ) {
      const slotEnd = addMinutes(slotStart, meetingDuration);

      if (isAfter(slotEnd, workingEndUTC)) continue;

      // MINIMUM NOTICE
      if (isBefore(slotStart, minNoticeTime)) continue;

      // BUFFER
      const paddedStart = addMinutes(slotStart, -bufferBefore);
      const paddedEnd = addMinutes(slotEnd, bufferAfter);

      // CHECK BOOKING (UT C → UTC)
      const conflict = bookings.some((b) => {
        return b.startTime < paddedEnd && b.endTime > paddedStart;
      });

      if (!conflict) {
        // TAMPILKAN DALAM ZONA WAKTU LOKAL
        const localDisplay = format(
          toDate(slotStart, { timeZone: timezone }),
          "HH:mm"
        );
        slots.push(localDisplay);
      }
    }

    days.push({
      date: dayStr,
      slots,
    });
  }

  return days;
}
