import type { PropsWithChildren } from "react";
import { ExternalLink } from "../ExternalLink";
import { Link } from "../Link";
import { cn } from "../../utils/cn";
import type { Path } from "../app/routes";

export function HeaderLink({
  ariaLabel,
  children,
  className = "",
  title,
  ...props
}: PropsWithChildren<
  {
    ariaLabel?: string;
    className?: string;
    title: string;
  } & (
    | {
        href: string;
      }
    | {
        to: Path;
      }
  )
>) {
  const linkClassName = cn(
    "block text-header-icons! cursor-pointer",
    className
  );

  return "to" in props ? (
    <Link
      aria-label={ariaLabel || title}
      children={children}
      className={linkClassName}
      title={title}
      to={props.to}
    />
  ) : (
    <ExternalLink
      aria-label={ariaLabel || title}
      children={children}
      className={linkClassName}
      href={props.href}
      title={title}
    />
  );
}
