import { type AnchorHTMLAttributes, type PropsWithChildren } from "react";
import { cn } from "../../utils/cn";
import type { Path as DefaultPath } from "../app/routes";
import { Box } from "../Box";
import { Link } from "../Link";
import { NavButton } from "./NavButton";

export function NavLink<Path extends string = DefaultPath>({
  children,
  className,
  path,
  ...rest
}: PropsWithChildren<
  {
    className?: string | undefined;
    path: Path;
  } & Pick<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "aria-controls" | "aria-expanded" | "onClick"
  >
>) {
  return (
    <Link className="block" data-nav-link to={path} {...rest}>
      {({ isActive, isPending }) => (
        <NavButton
          className={cn(
            "px-4 cursor-pointer",
            "active:animate-pulse",
            {
              "[-webkit-text-stroke:0.5px_currentColor] text-nav-active hover:text-nav-hover":
                isActive,
              "animate-pulse pointer-events-none": isPending
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
