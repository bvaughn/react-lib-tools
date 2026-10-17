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
        "px-4 min-h-8 py-1.5 leading-snug cursor-pointer text-white/90 hover:text-white focus:bg-white/10 focus-within:bg-white/10",
        { "pointer-events-none text-white/50": disabled },
        className
      )}
      direction="row"
      gap={1}
    >
      {children}
    </Box>
  );
}
