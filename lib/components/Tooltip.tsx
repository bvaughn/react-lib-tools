import {
  autoPlacement,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFloatingPortalNode,
  useFocus,
  useHover,
  useInteractions,
  type Placement
} from "@floating-ui/react";
import {
  useState,
  type KeyboardEvent,
  type PropsWithChildren,
  type ReactNode
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

export function Tooltip({
  children,
  className,
  content,
  positions,
  showOnFocus = false,
  showOnHover = true,
  usePortal
}: PropsWithChildren<{
  className?: string;
  content: ReactNode;
  positions?: Array<Placement> | undefined;
  showOnFocus?: boolean;
  showOnHover?: boolean;
  usePortal?: boolean;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  const portalNode = useFloatingPortalNode({
    root: document.body
  });

  const { refs, floatingStyles, context } = useFloating({
    onOpenChange: setIsOpen,
    open: isOpen,
    middleware: [
      offset(4),
      shift(),
      autoPlacement(positions ? { allowedPlacements: positions } : {})
    ]
  });

  const hover = useHover(context, { enabled: showOnHover });
  const focus = useFocus(context, { enabled: showOnFocus });

  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
    focus,
    hover
  ]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (showOnFocus) {
      switch (event.key) {
        case "Escape": {
          setIsOpen(false);
          break;
        }
        case "Enter": {
          setIsOpen(true);
          break;
        }
      }
    }
  };

  let tooltip: ReactNode = null;
  if (isOpen) {
    tooltip = (
      <div
        className={cn(
          "bg-white/80 text-black rounded-md px-2 py-1 shadow-md whitespace-nowrap z-40",
          className
        )}
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
      >
        {content}
      </div>
    );

    if (usePortal && portalNode) {
      tooltip = createPortal(tooltip, portalNode);
    }
  }

  return (
    <div
      className={cn("group relative flex justify-center", className)}
      onKeyDown={onKeyDown}
    >
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {tooltip}
    </div>
  );
}
