import type { MouseEvent, PropsWithChildren } from "react";
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
    <button
      aria-label={ariaLabel || title}
      className={cn("cursor-pointer text-header-icons", className)}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
