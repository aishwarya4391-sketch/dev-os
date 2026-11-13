import { clsx } from 'clsx'
import { forwardRef, useId, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, className, id, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="text-body text-text-primary">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={clsx(
          'h-10 rounded-md border bg-bg-primary px-3 text-body text-text-primary transition-colors duration-100 ease-out placeholder:text-text-disabled',
          error ? 'border-danger' : 'border-border-default hover:border-border-strong focus:border-brand',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-caption text-danger-text">
          {error}
        </p>
      )}
    </div>
  )
})
