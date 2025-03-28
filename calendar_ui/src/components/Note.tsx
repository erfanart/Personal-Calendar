"use client";
import React, { useState, useEffect, useRef } from "react";
import client from "@/lib/graphql/client";
import { UPSERT_NOTE } from "@/lib/graphql/mutations"; // You'll need to create this

interface NoteProps {
  note?: { text: string };
  onSave?: (text: string) => void;
  timeSlotId?: number; // Add this prop
}

const Note = ({ note, onSave, timeSlotId }: NoteProps) => {
  const safeNote = note || { text: "" };
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(safeNote.text);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedText(safeNote.text);
  }, [safeNote.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!timeSlotId) {
      setError("Time slot ID is missing");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Call GraphQL mutation
      await client.mutate({
        mutation: UPSERT_NOTE,
        variables: {
          text: editedText,
          timeSlotId: timeSlotId,
        },
      });

      // Call local onSave if provided
      if (onSave) {
        onSave(editedText);
      }

      setIsEditing(false);
    } catch (err) {
      setError("Failed to save note");
      console.error("Error saving note:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-end mb-2">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-700 text-sm px-3 py-1 rounded hover:bg-blue-50"
            disabled={isSaving}
          >
            ویرایش
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="text-green-500 hover:text-green-700 text-sm px-3 py-1 rounded hover:bg-green-50"
              disabled={isSaving}
            >
              {isSaving ? "در حال ذخیره..." : "ذخیره"}
            </button>
            <button
              onClick={() => {
                setEditedText(safeNote.text);
                setIsEditing(false);
              }}
              className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded hover:bg-red-50"
              disabled={isSaving}
            >
              انصراف
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-2 text-center">{error}</div>
      )}

      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="یادداشت خود را بنویسید..."
          disabled={isSaving}
        />
      ) : (
        <div
          className="flex-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap overflow-y-auto"
          onClick={() => !isSaving && setIsEditing(true)}
        >
          {safeNote.text || (
            <span className="text-gray-400">یادداشت بدون متن</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Note;
