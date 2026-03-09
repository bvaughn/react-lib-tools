import type { MouseEvent, PropsWithChildren } from "react";
import { Tooltip } from "../Tooltip";
import { cn } from "../../utils/cn";

export function HeaderButton({
  ariaLabel,
  children,
  className = "",
  onClick,
  title
}: PropsWithChildren<{
  ariaLabel?: string;
  className?: string;
  isActive?: boolean;
  onClick: (event: MouseEvent) => void;
  title: string;
}>) {
  return (
    <Tooltip className={className} content={title}>
      <button
        aria-label={ariaLabel || title}
        className={cn("cursor-pointer", className)}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  );
}
