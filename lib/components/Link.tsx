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

export function Link({
  children,
  onClick,
  to,
  ...rest
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> & {
  children?: ReactNode | RenderFunction;
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
