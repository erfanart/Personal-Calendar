// src/constants/persianDays.ts
export const PERSIAN_DAYS = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه"
  ] as const;
  
  export type PersianDayName = typeof PERSIAN_DAYS[number];
  
  // Week order mapping for sorting
  export const PERSIAN_DAY_ORDER: Record<PersianDayName, number> = {
    "شنبه": 0,
    "یکشنبه": 1,
    "دوشنبه": 2,
    "سه‌شنبه": 3,
    "چهارشنبه": 4,
    "پنج‌شنبه": 5,
    "جمعه": 6
  };