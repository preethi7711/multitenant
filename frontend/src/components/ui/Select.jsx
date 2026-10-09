import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const Select = forwardRef(function Select(
  { label, error, options = [], className, ...props },
  ref
) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select
        ref={ref}
        className={cn('select', error && 'input-error', className)}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
})
