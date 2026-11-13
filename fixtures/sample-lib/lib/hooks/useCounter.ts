import { useState } from "react";

/**
 * Manages a counter value outside of the Counter component.
 *
 * @param initialValue Value to start counting from.
 * @returns The current value and a function to increment it.
 */
export function useCounter(
  initialValue: number,
  {
    step = 1
  }: {
    /**
     * Amount to increment by; defaults to 1.
     */
    step?: number;
  } = {}
) {
  const [value, setValue] = useState(initialValue);

  return [value, () => setValue((current) => current + step)] as const;
}
