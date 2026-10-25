import type { PropsWithChildren } from "react";
import { Box } from "../Box";
import { cn } from "../../utils/cn";

export function NavButton({
  children,
  className,
  disabled
}: PropsWithChildren<{ className?: string; disabled?: boolean }>) {
  return (
    <Box
      align="center"
      className={cn(
        "px-4 min-h-8 py-1.5 leading-snug cursor-pointer text-ink/90 hover:text-ink focus:bg-ink/10 focus-within:bg-ink/10",
        { "pointer-events-none text-ink/50": disabled },
        className
      )}
      direction="row"
      gap={1}
    >
      {children}
    </Box>
  );
}
