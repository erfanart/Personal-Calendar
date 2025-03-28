"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TimeSlot as TimeSlotType } from "@/types";
import Note from "./Note";
import { TagInput } from "./Tag/TagInput";

interface TimeSlotProps {
  timeSlots: TimeSlotType[];
  onNoteUpdate?: (slotId: number, text: string) => void;
}

const TimeSlot = ({ timeSlots, onNoteUpdate }: TimeSlotProps) => {
  // All hooks moved to the top before any conditionals
  const [localTimeSlots, setLocalTimeSlots] = useState<TimeSlotType[]>(() =>
    timeSlots.map((slot) => ({
      ...slot,
      note: slot.note ? { ...slot.note } : { id: -1, text: "", timeSlotId: slot.id },
      tags: slot.tags ? [...slot.tags] : [],
    }))
  );

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);

  // Now safe to have conditional return
  if (timeSlots.length === 0) return null;

  const formatTime = (hour: number) => {
    const numHour = typeof hour === "string" ? parseInt(hour) : hour;
    return `${numHour.toString().padStart(2, "0")}:00`;
  };

  const handleNoteUpdate = (slotId: number, newText: string) => {
    setLocalTimeSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              note: {
                ...slot.note,
                text: newText,
              },
            }
          : slot
      )
    );

    if (onNoteUpdate) {
      onNoteUpdate(slotId, newText);
    }
  };

  return (
    <>
      {localTimeSlots.map((slot, index) => (
        <div
          key={`slot-container-${slot.id}`}
          className="border p-2 rounded-lg h-40 flex flex-col bg-white shadow-sm mb-2 transition-all duration-200 ease-in-out"
          dir="rtl"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">
              {formatTime(slot.hour)} - {formatTime((slot.hour + 1) % 24)}
            </span>
          </div>
          <TagInput
            timeSlotId={slot.id}
            initialTags={slot.tags.map((tag) => tag.name)}
            onTagsChange={(newTags) => {
              console.log("Tags updated:", newTags);
            }}
            placeholder="+ Add tag"
            maxTags={10}
          />
          <div className="mt-4">
            <motion.div
              key={`slot-note-${slot.id}`}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedTimeSlot(index)}
              transition={{
                delay: index * 0.03,
                type: "spring",
                stiffness: 400,
              }}
              className="cursor-pointer border border-gray-200 p-2 rounded-lg hover:shadow-md hover:border-blue-400 hover:bg-blue-50 hover:transform hover:-translate-y-0.5"
              dir="rtl"
            >
              {slot.note?.text || <span className="text-gray-400">یاداشت</span>}
            </motion.div>
          </div>

          <AnimatePresence>
            {selectedTimeSlot === index && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 backdrop-blur-[2px] z-10"
                  onClick={() => setSelectedTimeSlot(null)}
                />

                <motion.div
                  key={`note-modal-${slot.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed inset-0 z-20 flex items-center justify-center p-4"
                >
                  <div className="w-full h-full max-w-6xl mx-auto flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                      <h3 className="text-xl font-bold">یاداشت</h3>
                      <button
                        onClick={() => setSelectedTimeSlot(null)}
                        className="text-gray-500 hover:text-gray-700 text-2xl p-1"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <Note
                        note={localTimeSlots[index]?.note}
                        onSave={(text) => handleNoteUpdate(slot.id, text)}
                        timeSlotId={slot.id}
                      />
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      ))}
    </>
  );
};

export default TimeSlot;