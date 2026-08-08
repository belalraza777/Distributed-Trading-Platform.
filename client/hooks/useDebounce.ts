import { useState, useEffect } from "react"

// delays updating a value until the user stops typing
// usage: const debouncedSearch = useDebounce(searchInput, 400)
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}