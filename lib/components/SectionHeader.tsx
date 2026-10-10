import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "../utils/cn";
import { slugify } from "../utils/slugify";

export function SectionHeader({
  children,
  className,
  id,
  showInContents = true,
  ...rest
}: PropsWithChildren<
  HTMLAttributes<HTMLHeadingElement> & {
    className?: string | undefined;
    /** Include this heading in the sidebar's "On this page" list */
    showInContents?: boolean | undefined;
  }
>) {
  return (
    <h2
      className={cn(
        "text-2xl font-semibold tracking-tight leading-tight text-white mt-6",
        className
      )}
      data-toc={showInContents ? "1" : undefined}
      id={id ?? (typeof children === "string" ? slugify(children) : undefined)}
      {...rest}
    >
      {children}
    </h2>
  );
}
