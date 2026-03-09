import type { PropsWithChildren } from "react";
import { ExternalLink } from "../ExternalLink";
import { Link } from "../Link";
import { Tooltip } from "../Tooltip";
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
  const link =
    "to" in props ? (
      <Link
        aria-label={ariaLabel || title}
        children={children}
        className="text-header-icons! cursor-pointer"
        to={props.to}
      />
    ) : (
      <ExternalLink
        aria-label={ariaLabel || title}
        children={children}
        className="text-header-icons! cursor-pointer"
        href={props.href}
      />
    );

  return (
    <Tooltip className={className} content={title}>
      {link}
    </Tooltip>
  );
}
