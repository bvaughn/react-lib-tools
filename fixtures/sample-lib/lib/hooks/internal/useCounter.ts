/**
 * Internal variant of useCounter that is not exported from the package entry point.
 *
 * Exists so compileHooks has to prefer the public declaration when names collide.
 *
 * @param internalOnly Parameter that should never appear in the README.
 */
export function useCounter(internalOnly: number) {
  return internalOnly;
}
