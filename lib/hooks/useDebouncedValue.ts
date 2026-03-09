import { startTransition, useEffect, useState } from "react";

export function useDebouncedValue<Type>(value: Type, delay: number = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (delay === 0) {
      startTransition(() => setDebouncedValue(value));
    } else {
      const timeout = setTimeout(() => {
        startTransition(() => setDebouncedValue(value));
      }, delay);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [delay, value]);

  return debouncedValue;
}
