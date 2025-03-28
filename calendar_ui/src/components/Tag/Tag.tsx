'use client'
import { X } from 'lucide-react'

interface TagProps {
  text: string
  onRemove?: () => void
  className?: string
  removable?: boolean
}

export const Tag = ({
  text,
  onRemove,
  className = '',
  removable = true,
}: TagProps) => {
  return (
    <div
      className={`inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm ${className}`}
    >
      <span>{text}</span>
      {removable && onRemove && (
        <button
          onClick={onRemove}
          className="text-blue-500 hover:text-blue-700 focus:outline-none"
          aria-label={`Remove tag ${text}`}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}