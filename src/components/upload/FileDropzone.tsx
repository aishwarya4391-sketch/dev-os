'use client'

import { useState, type DragEvent } from 'react'
import { clsx } from 'clsx'

export function FileDropzone({
  onFile,
  disabled = false,
  busy = false,
}: {
  onFile: (file: File) => void
  disabled?: boolean
  busy?: boolean
}) {
  const [dragging, setDragging] = useState(false)

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={clsx(
        'flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center transition-colors duration-100 ease-out',
        dragging ? 'border-brand bg-brand-bg' : 'border-border-strong bg-bg-primary',
        disabled && 'opacity-60'
      )}
    >
      <p className="text-body text-text-primary">{busy ? 'Uploading…' : 'Drag a POS export here'}</p>
      <p className="text-caption text-text-secondary">CSV or JSON, up to 5 MB</p>
      <input
        id="pos-file"
        type="file"
        accept=".csv,.json"
        disabled={disabled}
        className="peer sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
      <label
        htmlFor="pos-file"
        className={clsx(
          'inline-flex h-10 items-center justify-center rounded-md border border-border-default bg-bg-primary px-4 text-body text-text-primary transition-colors duration-100 ease-out peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand',
          disabled ? 'cursor-not-allowed text-text-disabled' : 'cursor-pointer hover:bg-bg-subtle hover:border-border-strong'
        )}
      >
        Choose file
      </label>
    </div>
  )
}
