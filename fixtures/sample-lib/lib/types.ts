/**
 * Imperative API for the `Counter` component.
 *
 * NOTE: Access this API by passing a ref to the `counterRef` prop.
 */
export interface CounterImperativeHandle {
  /**
   * Returns the current value.
   */
  getValue(): number;

  /**
   * Restores the counter to its initial value.
   */
  reset(): void;

  /**
   * Sets the current value.
   *
   * @param value New value; clamped to the `min` and `max` props
   */
  setValue(value: number): void;
}
