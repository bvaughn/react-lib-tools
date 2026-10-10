/**
 * Throws an error with the given message if the condition is falsy; narrows the condition's type otherwise.
 */
export function assert(
  expectedCondition: unknown,
  message: string = "Assertion error"
): asserts expectedCondition {
  if (!expectedCondition) {
    throw Error(message);
  }
}
