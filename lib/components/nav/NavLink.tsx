import { type PropsWithChildren } from "react";
import { cn } from "../../utils/cn";
import { Box } from "../Box";
import { Link } from "../Link";
import { NavButton } from "./NavButton";

export function NavLink({
  children,
  className,
  path
}: PropsWithChildren<{
  className?: string | undefined;
  path: string;
}>) {
  return (
    <Link to={path}>
      {({ isActive, isPending }) => (
        <NavButton
          className={cn(
            "px-4 cursor-pointer",
            {
              "font-bold text-fuchsia-400 hover:text-fuchsia-200": isActive,
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
