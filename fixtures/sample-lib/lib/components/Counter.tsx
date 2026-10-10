import { useImperativeHandle, useState, type Ref } from "react";
import type { CounterImperativeHandle } from "../types";

/**
 * Displays a numeric value with buttons to increment and decrement it.
 *
 * ℹ️ Counter manages its own state; use the `onChange` prop to be notified when the value changes.
 */
export function Counter({
  className,
  counterRef,
  initialValue,
  label = "Count",
  max,
  min,
  onChange,
  size = "medium",
  step = 1,
  title
}: {
  /**
   * Class name applied to the outer element.
   */
  className?: string | undefined;

  /**
   * Ref to the counter's imperative API.
   */
  counterRef?: Ref<CounterImperativeHandle> | undefined;

  /**
   * Value displayed when the counter first renders.
   */
  initialValue: number;

  /**
   * Accessible label displayed before the value.
   */
  label?: string | undefined;

  /**
   * Largest allowed value.
   *
   * ⚠️ Values above this are clamped without warning.
   */
  max?: number | undefined;

  /**
   * Smallest allowed value.
   */
  min?: number | undefined;

  /**
   * Called with the new value whenever it changes.
   *
   * ```tsx
   * <Counter initialValue={0} onChange={(value) => console.log(value)} />
   * ```
   */
  onChange?: ((value: number) => void) | undefined;

  /**
   * Controls the size of the buttons and text.
   */
  size?: "small" | "medium" | "large" | undefined;

  /**
   * Amount the value changes by each time a button is pressed.
   */
  step?: number | undefined;

  /**
   * @deprecated Use the `label` prop instead.
   */
  title?: string | undefined;
}) {
  const [value, setValue] = useState(initialValue);

  const update = (newValue: number) => {
    const clamped = Math.min(
      max ?? Infinity,
      Math.max(min ?? -Infinity, newValue)
    );
    if (clamped !== value) {
      setValue(clamped);
      onChange?.(clamped);
    }
  };

  useImperativeHandle(counterRef, () => ({
    getValue: () => value,
    reset: () => update(initialValue),
    setValue: (newValue: number) => update(newValue)
  }));

  return (
    <div
      className={`inline-flex items-center gap-2 ${SIZE_CLASS_NAMES[size]} ${className ?? ""}`}
    >
      <span>{title ?? label}:</span>
      <button
        aria-label="Decrement"
        className="rounded bg-white/10 px-2 hover:bg-white/20 disabled:opacity-50"
        disabled={min !== undefined && value <= min}
        onClick={() => update(value - step)}
      >
        -
      </button>
      <output className="min-w-8 text-center tabular-nums">{value}</output>
      <button
        aria-label="Increment"
        className="rounded bg-white/10 px-2 hover:bg-white/20 disabled:opacity-50"
        disabled={max !== undefined && value >= max}
        onClick={() => update(value + step)}
      >
        +
      </button>
    </div>
  );
}

const SIZE_CLASS_NAMES = {
  small: "text-sm",
  medium: "text-base",
  large: "text-xl"
};
