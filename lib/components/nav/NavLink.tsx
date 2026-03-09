import { type PropsWithChildren } from "react";
import { cn } from "../../utils/cn";
import type { Path as DefaultPath } from "../app/routes";
import { Box } from "../Box";
import { Link } from "../Link";
import { NavButton } from "./NavButton";

export function NavLink<Path extends string = DefaultPath>({
  children,
  className,
  path
}: PropsWithChildren<{
  className?: string | undefined;
  path: Path;
}>) {
  return (
    <Link to={path}>
      {({ isActive, isPending }) => (
        <NavButton
          className={cn(
            "px-4 cursor-pointer",
            {
              "font-bold text-nav-active hover:text-nav-hover": isActive,
              "opacity-50 pointer-events-none": isPending
            },
            className
          )}
        >
          <Box align="center" direction="row" gap={2}>
            {children}
          </Box>
        </NavButton>
      )}
    </Link>
  );
}
