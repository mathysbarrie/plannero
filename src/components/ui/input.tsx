import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`w-full px-3 py-2 border bg-white text-[13px] text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-colors ${
            error ? 'border-amber-500' : 'border-neutral-200 hover:border-neutral-300'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-[11px] text-amber-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
