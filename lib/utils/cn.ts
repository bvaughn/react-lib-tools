import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names (strings, arrays, or objects of conditional classes, as with `clsx`),
 * resolving conflicting Tailwind classes in favor of the last one (e.g. `cn("p-2", "p-4")` is `"p-4"`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
