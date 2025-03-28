// src/components/MonthCalendar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CalendarDay from "./Day";
import { PERSIAN_DAYS } from "@/constants/persianDays";
import client from '@/lib/graphql/client';
import { GET_MONTH_DETAILS } from '@/lib/graphql/queries';
import { MoonLoader } from "react-spinners";
import type { Month } from "@/types";

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
          variables: { id: selectedMonthId }, // Use the selected month ID
        });
        
        // Check if data.getMonth exists (singular) or data.getMonths (plural)
        const monthData = (data.getMonths && data.getMonths.length ? data.getMonths[0] : null);
        // console.log(monthData);
        if (!monthData) {
          throw new Error("Month data not found");
        }
        
        setMonthDetails(monthData);
        console.log(data.getMonths)
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
      {/* Month Grid - Always visible */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`grid grid-cols-3 gap-4 p-4 transition-all duration-300 ${
          selectedMonthId !== null ? "blur-[2px]" : ""
        }`}
      >
        {months.map((month) => (
          <motion.div
            key={`month-${month.id}`}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={() => setSelectedMonthId(month.id)}
            className="
              p-4 rounded-lg border border-gray-200 bg-white
              shadow-sm cursor-pointer text-center
              flex flex-col items-center justify-center
              h-32 hover:bg-blue-50 hover:border-blue-200
            "
          >
            <motion.span
              className="text-sm text-gray-500"
              whileHover={{ scale: 1.1 }}
            >
              ماه
            </motion.span>
            <motion.h3
              className="text-xl font-bold text-gray-800 mt-1"
              whileHover={{ color: "#3b82f6" }}
            >
              {month.name}
            </motion.h3>
          </motion.div>
        ))}
      </motion.div>

      {/* Month Popup - Appears over the grid */}
      <AnimatePresence>
        {selectedMonthId !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-opacity-50 z-1 backdrop-blur-[2px]"
              onClick={() => {
                setSelectedMonthId(null);
                setMonthDetails(null);
              }}
            />

            <motion.div
              key={`month-${selectedMonthId}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-1 w-full max-w-5xl p-4"
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
                      <motion.header
                        className="mb-6 flex justify-between items-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h2 className="text-2xl font-bold text-gray-900">
                          تقویم {monthDetails?.name } {/*|| months.find(m => m.id === selectedMonthId)?.name}*/}
                        </h2>
                      </motion.header>
                      <button
                        onClick={() => {
                          setSelectedMonthId(null);
                          setMonthDetails(null);
                        }}
                        className="text-gray-500 hover:text-gray-700 text-2xl p-1"
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>

                {loading ? (
                  <div className="flex-1 flex items-center justify-center p-8">
                    <MoonLoader size={40} color="#3b82f6" />
                  </div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500">
                    {error}
                  </div>
                ) : (
                  monthDetails && (
                    <>
                      <motion.div
                        className="mb-3 grid grid-cols-7 gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {PERSIAN_DAYS.map((day) => (
                          <motion.div
                            key={`header-${day}`}
                            whileHover={{ scale: 1.05 }}
                            className="rounded-md bg-gray-100 py-2 text-center font-medium text-gray-600 hover:shadow-md"
                          >
                            {day}
                          </motion.div>
                        ))}
                      </motion.div>
                      
                      <div className="overflow-y-auto max-h-[calc(100vh-300px)] grid grid-cols-7 gap-1">
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