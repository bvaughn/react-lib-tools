/**
 * Expands/collapses a Headless UI transition (e.g. a DisclosurePanel) by animating its height.
 * The element's only child should have "min-h-0 overflow-hidden" so it can shrink to nothing.
 * Transition classes are marked important to override the global "transition: none !important" rule.
 */
export const REVEAL_CLASS_NAME =
  "grid grid-rows-[1fr] transition-[grid-template-rows]! duration-250! ease-in-out! motion-reduce:transition-none! data-closed:grid-rows-[0fr]";
