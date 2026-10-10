import type { AnchorHTMLAttributes } from "react";

/**
 * Link to another site; opens in a new tab by default.
 * Use `Link` for links to other pages of the docs site.
 */
export function ExternalLink({
  children,
  className,
  href,
  target = "_blank",
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={className}
      href={href}
      target={target}
      rel="noopener noreferrer"
      {...rest}
    >
      {children}
    </a>
  );
}
