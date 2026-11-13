import { useRef } from "react";
import type { CounterImperativeHandle } from "../types";

/**
 * Convenience hook to return a properly typed ref for the Counter component.
 */
export const useCounterRef = useRef as typeof useRef<CounterImperativeHandle>;
