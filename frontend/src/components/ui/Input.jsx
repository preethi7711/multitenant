import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export const Input = forwardRef(function Input(
  { label, error, className, ...props },
  ref
) {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input
        ref={ref}
        className={cn('input', error && 'input-error', className)}
        {...props}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  )
})
