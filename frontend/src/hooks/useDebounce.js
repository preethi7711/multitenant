import { useState, useEffect } from 'react'

/**
 * Debounces a value by the given delay (ms).
 * Returns the debounced value — API calls should use this instead of the raw value.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
