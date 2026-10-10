import {
  useTransition,
  type AnchorHTMLAttributes,
  type ReactNode
} from "react";
import { useMatch, useNavigate } from "react-router-dom";

type RenderFunction = (params: {
  isActive: boolean;
  isPending: boolean;
}) => ReactNode;

/**
 * Link to another page of the docs site; navigates without reloading the page.
 * Use this rather than `react-router-dom` (which isn't connected to `AppRoot`'s router), and `ExternalLink` for other sites.
 *
 * `compileSearchIndex` finds pages to index by following these links.
 */
export function Link({
  children,
  onClick,
  to,
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> & {
  /** Content, or a function that renders it based on whether the link's page is current (`isActive`) or loading (`isPending`) */
  children?: ReactNode | RenderFunction;
  /** Path of the page to link to, optionally with a hash (e.g. "/props#size") */
  to: string;
}) {
  const isActive = !!useMatch(to);
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  return (
    <a
      children={
        typeof children === "function"
          ? children({ isActive, isPending })
          : children
      }
      data-link={to}
      href={to}
      onClick={(event) => {
        onClick?.(event);

        // Let the browser handle modified clicks (e.g. open in new tab)
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return;
        }

        event.preventDefault();

        startTransition(() => {
          navigate(to);
        });
      }}
      {...rest}
    />
  );
}
