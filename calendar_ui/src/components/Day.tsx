// src/components/CalendarDay.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TimeSlots from "./TimeSlots";
import client from "@/lib/graphql/client";
import { GET_DAY_DETAILS } from "@/lib/graphql/queries";
import { MoonLoader } from "react-spinners";
import type { CalendarDay } from "@/types";
import { PERSIAN_DAYS, type PersianDayName } from "@/constants/persianDays";
import Backdrop from "./Backdrop";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640); // موبایل = کمتر از 640px
    };

    handleResize(); // مقدار اولیه
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

interface CalendarDayProps {
  days: CalendarDay[];
}

function isPersianDayName(dayName: string): dayName is PersianDayName {
  return PERSIAN_DAYS.includes(dayName as PersianDayName);
}

const CalendarDay = ({ days }: CalendarDayProps) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [dayDetails, setDayDetails] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const formatTime = (hour: number) => {
    const numHour = typeof hour === "string" ? parseInt(hour) : hour;
    return `${numHour.toString().padStart(2, "0")}:00`;
  };

  const getWeekdayIndex = (dayName: string) => {
    if (!isPersianDayName(dayName)) {
      console.error(`Invalid day name received: ${dayName}`);
      return 0;
    }
    return PERSIAN_DAYS.indexOf(dayName);
  };

  useEffect(() => {
    const fetchDayDetails = async () => {
      if (selectedDayIndex === null) return;

      setLoading(true);
      setError(null);

      try {
        const { data } = await client.query({
          query: GET_DAY_DETAILS,
          variables: { id: days[selectedDayIndex].id }, // Use the day's ID instead of index
        });
        setDayDetails(data.getCalendarDays[0]);
      } catch (err) {
        setError("Failed to load day details");
        console.error("Error fetching day details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDayDetails();
  }, [selectedDayIndex, days]);

  if (!days || days.length === 0) return null;

  const firstDayIndex = getWeekdayIndex(days[0].dayName);
  const emptySlots = Array.from({ length: firstDayIndex });

  return (
    <>
      {emptySlots.map((_, index) => (
        <motion.div
          key={`empty-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: index * 0.02 }}
          className={`${
            isMobile ? "h-[10vh]" : "h-40"
          } rounded border  border-gray-100 bg-gray-50`}
        />
      ))}

      {days.map((day, index) => (
        <React.Fragment key={`day-container-${day.id}`}>
          <motion.div
            key={`day-${day.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedDayIndex(index)}
            transition={{
              delay: (firstDayIndex + index) * 0.03,
              type: "spring",
              stiffness: 300,
            }}
            className={`border p-2 rounded-lg ${
              isMobile ? "h-[10vh]" : "h-40"
            } flex flex-col
              bg-white shadow-sm
              ease-in-out
              hover:shadow-md hover:border-blue-400 hover:bg-blue-50
              hover:transform hover:-translate-y-0.5
              cursor-pointer`}
            dir="rtl"
          >
            {isMobile && (
              <>
                <h3 className="flex items-center justify-center font-medium  text-2xl text-gray-700">
                  {day.jalaliDate.split("-")[2]}
                </h3>
              </>
            )}
            {!isMobile && (
              <>
                <div className="mb-1 border-b pb-1">
                  <h3 className="flex items-center justify-center font-medium  text-sm text-gray-700">
                    {day.jalaliDate.split("-")[2]}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {day.jalaliDate.split("-").join("/")}
                  </p>
                </div>

                <div className="flex-grow overflow-y-auto">
                  <div className="sm:block">
                    {day.timeSlots.map((slot) => {
                      const hour =
                        typeof slot.hour === "string"
                          ? parseInt(slot.hour)
                          : slot.hour;
                      const nextHour = (hour + 1) % 24;

                      return (
                        <div
                          key={slot.id}
                          className={`text-xs py-1 text-right text-gray-600 ${
                            slot.note?.text || slot.tags.length > 0
                              ? ""
                              : "bg-red-100"
                          }`}
                        >
                          {formatTime(hour)} - {formatTime(nextHour)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </motion.div>

          <AnimatePresence>
            {selectedDayIndex === index && (
              <>
                <Backdrop
                  zIndex={30}
                  blurAmount="2px"
                  onClick={() => {
                    setSelectedDayIndex(null);
                    setDayDetails(null);
                  }}
                />
                <motion.div
                  key={`day-popup-${selectedDayIndex}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="fixed z-[100] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md h-[80vh]"
                  style={{
                    zIndex: 1000,
                  }}
                >
                  <div className="w-full h-full max-w-6xl mx-auto flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                      {loading ? (
                        <div className="flex-1 flex justify-center">
                          <MoonLoader size={24} color="#3b82f6" />
                        </div>
                      ) : error ? (
                        <div className="text-red-500">{error}</div>
                      ) : (
                        <>
                          {console.log(dayDetails)}
                          <h3 className="text-lg font-bold">{day.dayName}</h3>
                          <p>{day.jalaliDate.split("-").join("/")}</p>
                          <button
                            onClick={() => {
                              setSelectedDayIndex(null);
                              setDayDetails(null);
                            }}
                            className="text-gray-500 hover:text-gray-700 cursor-pointer text-2xl p-1"
                            aria-label="Close"
                          >
                            ×
                          </button>
                        </>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 pb-1">
                      {loading ? (
                        <div className="flex-1 flex justify-center">
                          <MoonLoader size={24} color="#3b82f6" />
                        </div>
                      ) : error ? (
                        <div className="text-red-500">{error}</div>
                      ) : (
                        <>
                          <TimeSlots timeSlots={dayDetails?.timeSlots || []} />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </React.Fragment>
      ))}
    </>
  );
};

export default CalendarDay;
