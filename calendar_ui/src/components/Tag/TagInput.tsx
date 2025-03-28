"use client";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import { Tag } from "./Tag";
import { ChevronDown } from "lucide-react";
import client from "@/lib/graphql/client";
import { UPSERT_TAGS } from "@/lib/graphql/mutations";
import {Tag as TagType} from "@/types"
interface TagInputProps {
  timeSlotId: number;
  initialTags?: string[];
  onTagsChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  maxWidth?: number;
}

export const TagInput = memo(
  ({
    timeSlotId,
    initialTags = [],
    onTagsChange,
    placeholder = "Add a tag...",
    maxTags,
    maxWidth = 300,
  }: TagInputProps) => {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [inputValue, setInputValue] = useState("");
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const tagsContainerRef = useRef<HTMLDivElement>(null);

    // GraphQL mutation to update tags
    const updateTags = useCallback(async (newTags: string[]) => {
      setIsSaving(true);
      try {
        const { data } = await client.mutate({
          mutation: UPSERT_TAGS,
          variables: {
            timeSlotId,
            tagNames: newTags
          }
        });
        
        // Optional: Update with returned tags if needed
        const serverTags = data.upsertTags.map((t: TagType) => t.name);
        return serverTags;
      } catch (error) {
        console.error("Failed to update tags:", error);
        throw error; // Let the calling code handle the error
      } finally {
        setIsSaving(false);
      }
    }, [timeSlotId]);

    // Handle tags change with optimistic UI update
    const handleTagsChange = useCallback(async (newTags: string[]) => {
      // Optimistic UI update
      setTags(newTags);
      
      try {
        // Update backend
        const serverTags = await updateTags(newTags);
        
        // Optional: Sync with server response
        if (serverTags) {
          setTags(serverTags);
        }
        
        // Notify parent component
        onTagsChange?.(serverTags || newTags);
      } catch (error) {
        // Revert on error
        console.error(error);
        setTags(initialTags);
      }
    }, [updateTags, onTagsChange, initialTags]);

    // Check if tags are overflowing
    useEffect(() => {
      const container = containerRef.current;
      const tagsContainer = tagsContainerRef.current;
      if (!container || !tagsContainer) return;

      const checkOverflow = () => {
        const containerWidth = container.clientWidth;
        const tagsWidth = tagsContainer.scrollWidth;
        setIsOverflowing(tagsWidth > containerWidth);

        if (tagsWidth <= containerWidth) {
          setShowDropdown(false);
        }
      };

      const observer = new ResizeObserver(checkOverflow);
      observer.observe(container);
      observer.observe(tagsContainer);
      checkOverflow();

      return () => observer.disconnect();
    }, [tags]);

    const handleAddTag = useCallback(() => {
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !tags.includes(trimmedValue)) {
        if (!maxTags || tags.length < maxTags) {
          const newTags = [...tags, trimmedValue];
          handleTagsChange(newTags);
          setInputValue("");
        }
      }
    }, [inputValue, tags, maxTags, handleTagsChange]);

    const handleRemoveTag = useCallback(
      (tagToRemove: string) => {
        const newTags = tags.filter((tag) => tag !== tagToRemove);
        handleTagsChange(newTags);
        if (newTags.length <= 1) {
          setShowDropdown(false);
        }
      },
      [tags, handleTagsChange]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAddTag();
        } else if (e.key === "Backspace" && !inputValue) {
          handleRemoveTag(tags[tags.length - 1]);
        }
      },
      [handleAddTag, handleRemoveTag, inputValue, tags]
    );

    const toggleDropdown = useCallback(() => {
      setShowDropdown((prev) => !prev);
    }, []);

    const visibleTags = isOverflowing ? tags.slice(0, 1) : tags;
    const hiddenTagsCount = isOverflowing ? tags.length - 1 : 0;
    const canAddMoreTags = !maxTags || tags.length < maxTags;

    return (
      <div className="space-y-2 w-full">
        <div
          ref={containerRef}
          className={`
          flex items-center gap-2 p-1 border border-gray-200 rounded-md
          ${isOverflowing ? "overflow-x-auto max-h-20" : "overflow-hidden"}
          transition-all duration-200 
          ${isSaving ? "opacity-70" : ""}
        `}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {/* Hidden tags container for measurement */}
          <div
            ref={tagsContainerRef}
            className="flex items-center gap-2 flex-nowrap"
            style={{ visibility: "hidden", position: "absolute" }}
          >
            {tags.map((tag) => (
              <Tag key={tag} text={tag} onRemove={() => {}} />
            ))}
          </div>

          {/* Visible tags */}
          {visibleTags.map((tag) => (
            <Tag 
              key={tag} 
              text={tag} 
              onRemove={isSaving ? undefined : () => handleRemoveTag(tag)}
            />
          ))}

          {/* Dropdown indicator */}
          {hiddenTagsCount > 0 && (
            <button
              onClick={toggleDropdown}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              aria-expanded={showDropdown}
              disabled={isSaving}
            >
              +{hiddenTagsCount}
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
          )}

          {/* Input field */}
          {canAddMoreTags && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddTag}
              placeholder={tags.length === 0 ? placeholder : ""}
              className="flex-1 min-w-[100px] px-2 py-1 focus:outline-none"
              aria-label="Add tag"
              disabled={isSaving}
            />
          )}
        </div>

        {/* Dropdown for overflow tags */}
        {isOverflowing && showDropdown && (
          <div className="mt-1 p-2 border border-gray-200 rounded-md shadow-sm bg-white">
            <div className="flex flex-wrap gap-2">
              {tags.slice(1).map((tag) => (
                <Tag
                  key={tag}
                  text={tag}
                  onRemove={isSaving ? undefined : () => handleRemoveTag(tag)}
                />
              ))}
            </div>
          </div>
        )}

        {isSaving && (
          <div className="text-xs text-gray-500 text-center">Saving tags...</div>
        )}
      </div>
    );
  }
);

TagInput.displayName = "TagInput";