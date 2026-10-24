import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

/**
 * A list of hook parameters or return values; children should be `HookSignatureItem`s.
 */
export function HookSignature({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <dl className={cn("flex flex-col gap-2", className)}>{children}</dl>;
}
