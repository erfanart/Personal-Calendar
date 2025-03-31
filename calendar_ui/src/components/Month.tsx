"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarDay from "./Day";
import { PERSIAN_DAYS } from "@/constants/persianDays";
import client from "@/lib/graphql/client";
import { GET_MONTH_DETAILS } from "@/lib/graphql/queries";
import { MoonLoader } from "react-spinners";
import type { Month } from "@/types";
import Backdrop from "./Backdrop";

interface MonthCalendarProps {
  months: Month[];
}

const MonthCalendar = ({ months }: MonthCalendarProps) => {
  const [selectedMonthId, setSelectedMonthId] = useState<number | null>(null);
  const [monthDetails, setMonthDetails] = useState<Month | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthDetails = async () => {
      if (!selectedMonthId) return;

      setLoading(true);
      setError(null);

      try {
        const { data } = await client.query({
          query: GET_MONTH_DETAILS,
          variables: { id: selectedMonthId },
        });

        const monthData =
          data.getMonths && data.getMonths.length ? data.getMonths[0] : null;
        if (!monthData) {
          throw new Error("Month data not found");
        }

        setMonthDetails(monthData);
      } catch (err) {
        setError("Failed to load month details");
        console.error("Error fetching month details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthDetails();
  }, [selectedMonthId]);

  return (
    <div className="relative" dir="rtl">
      {/* Month Grid - Responsive columns */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-3 transition-all duration-300 ${
          selectedMonthId !== null ? "blur-[2px]" : ""
        }`}
      >
        {months.map((month) => (
          <motion.div
            key={`month-${month.id}`}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={() => setSelectedMonthId(month.id)}
            className="
              p-3 rounded-lg border border-gray-200 bg-white
              shadow-sm cursor-pointer text-center
              flex flex-col items-center justify-center
              h-28 sm:h-32 hover:bg-blue-50 hover:border-blue-200
            "
          >
            <span className="text-xs sm:text-sm text-gray-500">ماه</span>
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 mt-1">
              {month.name}
            </h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Month Popup - Responsive sizing */}
      <AnimatePresence>
        {selectedMonthId !== null && (
          <>
            <Backdrop
              zIndex={10}
              blurAmount="2px"
              onClick={() => {
                setSelectedMonthId(null);
              }}
            />

            <motion.div
              key={`month-${selectedMonthId}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              // className="fixed inset-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 z-20 w-full sm:w-[95%] sm:max-w-5xl p-2 sm:p-4"
              className="fixed inset-0 z-20 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2  w-full sm:w-[95%] sm:max-w-5xl sm:max-w-5xl p-2 sm:p-4 "
            >
              <div className="w-full h-[80vh] sm:h-[90vh] md:h-[95vh] mx-auto max-w-5xl flex flex-col bg-white rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center p-3 sm:p-4 border-b">
                  {loading ? (
                    <div className="flex-1 flex justify-center">
                      <MoonLoader size={20} color="#3b82f6" />
                    </div>
                  ) : error ? (
                    <div className="text-red-500 text-sm sm:text-base">
                      {error}
                    </div>
                  ) : (
                    <>
                      <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                        تقویم {monthDetails?.name}
                      </h2>
                      <button
                        onClick={() => {
                          setSelectedMonthId(null);
                          setMonthDetails(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer sm:text-2xl p-1"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>

                {loading ? (
                  <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                    <MoonLoader size={30} color="#3b82f6" />
                  </div>
                ) : error ? (
                  <div className="p-4 sm:p-8 text-center text-red-500">
                    {error}
                  </div>
                ) : (
                  monthDetails && (
                    <>
                      <motion.div
                        className="mb-2 grid grid-cols-7 gap-1 px-1 sm:px-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {PERSIAN_DAYS.map((day) => (
                          <div
                            key={`header-${day}`}
                            className="rounded-md bg-gray-100 py-1 sm:py-2 text-center text-xs sm:text-sm font-medium text-gray-600"
                          >
                            {day}
                          </div>
                        ))}
                      </motion.div>

                      <div className=" overflow-y-auto flex-1 grid grid-cols-7 gap-1 px-1 sm:px-2 pb-2">
                        <CalendarDay days={monthDetails.calendarDays} />
                      </div>
                    </>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MonthCalendar;
