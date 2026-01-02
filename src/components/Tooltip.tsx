import {
  offset,
  useFloating,
  useFocus,
  useHover,
  useInteractions
} from "@floating-ui/react";
import {
  useState,
  type KeyboardEvent,
  type PropsWithChildren,
  type ReactNode
} from "react";
import { cn } from "react-lib-tools";

export function Tooltip({
  children,
  className,
  content,
  showOnFocus = false,
  showOnHover = true
}: PropsWithChildren<{
  className?: string;
  content: ReactNode;
  showOnFocus?: boolean;
  showOnHover?: boolean;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    onOpenChange: setIsOpen,
    open: isOpen,
    middleware: [offset(4)]
  });

  const hover = useHover(context, { enabled: showOnHover });
  const focus = useFocus(context, { enabled: showOnFocus });

  const { getReferenceProps, getFloatingProps } = useInteractions([
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

  return (
    <div className="group relative flex justify-center" onKeyDown={onKeyDown}>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {isOpen && (
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
      )}
    </div>
  );
}
