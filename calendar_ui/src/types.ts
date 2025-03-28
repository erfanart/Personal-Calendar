export interface Tag {
  id: number;
  name: string;
  timeSlotId: number;
}

export interface Note {
  id: number;
  text: string;
  timeSlotId: number;
}

export interface TimeSlot {
  id: number;
  hour: number; // 0-23
  dayId: number;
  note: Note;
  tags: Tag[];
}

export interface CalendarDay {
  id: number;
  jalaliDate: string; // Format: "YYYY-MM-DD"
  dayName: string;
  monthId: number;
  timeSlots: TimeSlot[];
}

export interface Month {
  id: number;
  name: string; // e.g. "فروردین", "اردیبهشت"
  season: string; // e.g. "بهار", "تابستان"
  calendarDays: CalendarDay[];
}