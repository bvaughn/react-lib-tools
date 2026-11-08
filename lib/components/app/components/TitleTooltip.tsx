import {
  arrow,
  autoPlacement,
  autoUpdate,
  FloatingArrow,
  offset,
  shift,
  useFloating
} from "@floating-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Holds an element's `title` while its tooltip is shown, so the browser doesn't also show its (slow, small) native tooltip */
const ATTRIBUTE = "data-title-tooltip";

/** Size of the tail pointing at the tooltip's target, in pixels */
const ARROW_HEIGHT = 5;
const ARROW_WIDTH = 10;

/**
 * Shows the `title` of the hovered element in a styled tooltip, without the native tooltip's delay.
 * `AppRoot` renders one; render one yourself (once) for pages outside of `AppRoot`. Any element with a `title` attribute gets a tooltip.
 */
export function TitleTooltip() {
  const [state, setState] = useState<{
    element: Element;
    text: string;
  } | null>(null);

  const arrowRef = useRef<SVGSVGElement>(null);

  const { context, floatingStyles, refs } = useFloating({
    elements: { reference: state?.element ?? null },
    middleware: [
      // Leaves room for the tail
      offset(ARROW_HEIGHT + 3),
      autoPlacement(),
      shift({ padding: 4 }),
      // Last, so the tail points at the target even after the tooltip is shifted
      arrow({ element: arrowRef, padding: 6 })
    ],
    open: state !== null,
    strategy: "fixed",
    whileElementsMounted: autoUpdate
  });

  // Show the popover as soon as it's attached, so that it can be measured when positioned
  const { setFloating: setFloatingRef } = refs;
  const setFloating = useCallback(
    (element: HTMLDivElement | null) => {
      setFloatingRef(element);
      if (element && typeof element.showPopover === "function") {
        try {
          if (!element.matches(":popover-open")) {
            element.showPopover();
          }
        } catch {
          // Popovers aren't supported (e.g. older browsers); it's shown in place instead
        }
      }
    },
    [setFloatingRef]
  );

  useEffect(() => {
    let current: { element: Element; observer: MutationObserver } | null = null;

    const hide = () => {
      if (current) {
        const { element, observer } = current;
        observer.disconnect();

        const text = element.getAttribute(ATTRIBUTE);
        element.removeAttribute(ATTRIBUTE);
        // A title set (e.g. by React) while the tooltip was shown takes precedence
        if (text !== null && !element.hasAttribute("title")) {
          element.setAttribute("title", text);
        }

        current = null;
      }
      setState(null);
    };

    // Moves the title aside (so the native tooltip isn't shown) and shows it in ours
    const takeTitle = (element: Element) => {
      const text = element.getAttribute("title");
      if (text !== null) {
        element.removeAttribute("title");
        element.setAttribute(ATTRIBUTE, text);
      }

      const stored = element.getAttribute(ATTRIBUTE) ?? "";
      if (stored.trim()) {
        setState({ element, text: stored });
      } else {
        setState(null);
      }
    };

    const show = (element: Element) => {
      if (current?.element === element) {
        return;
      }

      hide();

      // Keep up with title changes while hovered (e.g. "Show menu" -> "Hide menu")
      const observer = new MutationObserver(() => {
        if (element.hasAttribute("title")) {
          takeTitle(element);
        }
      });
      observer.observe(element, { attributeFilter: ["title"] });

      current = { element, observer };
      takeTitle(element);
    };

    const onPointerOver = (event: PointerEvent) => {
      // Touch taps emulate hover, which would leave tooltips stuck open
      if (event.pointerType !== "mouse") {
        return;
      }

      const target = event.target;
      const element =
        target instanceof Element
          ? target.closest(`[title], [${ATTRIBUTE}]`)
          : null;

      if (element) {
        show(element);
      } else {
        hide();
      }
    };

    const onPointerLeave = (event: PointerEvent) => {
      // Leaving the window
      if (event.relatedTarget === null) {
        hide();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hide();
      }
    };

    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerLeave);
    // Like native tooltips, hide on click
    document.addEventListener("pointerdown", hide);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerLeave);
      document.removeEventListener("pointerdown", hide);
      document.removeEventListener("keydown", onKeyDown);

      hide();
    };
  }, []);

  if (state === null) {
    return null;
  }

  return createPortal(
    // A popover is shown in the top layer, above everything (even modal dialogs), like a native tooltip.
    // The m-0/inset-auto/border-0/overflow-visible classes undo the browser's default popover styles (centered, with a border).
    <div
      className="m-0 inset-auto border-0 overflow-visible bg-slate-800/90 text-white dark:bg-white/80 dark:text-black rounded-md px-2 py-1 shadow-md whitespace-pre-line max-w-80 pointer-events-none"
      popover="manual"
      ref={setFloating}
      role="tooltip"
      style={floatingStyles}
    >
      {state.text}
      <FloatingArrow
        // The same color as the tooltip
        className="fill-slate-800/90 dark:fill-white/80"
        context={context}
        height={ARROW_HEIGHT}
        ref={arrowRef}
        width={ARROW_WIDTH}
      />
    </div>,
    document.body
  );
}
