import { Input as HeadlessInput, type InputProps } from "@headlessui/react";
import type { RefObject } from "react";
import { cn } from "react-lib-tools";
import { Tooltip } from "./Tooltip";

export function Input({
  className,
  inputRef,
  title,
  ...rest
}: InputProps & {
  inputRef?: RefObject<HTMLInputElement | null> | undefined;
}) {
  let children = (
    <HeadlessInput
      {...rest}
      className={cn(
        "block w-full rounded-lg border-none bg-white/10 px-3 py-1.5 text-sm/6 text-white",
        "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2",
        className
      )}
      ref={inputRef ?? noopRef}
    />
  );

  if (title) {
    children = <Tooltip content={title}>{children}</Tooltip>;
  }

  return children;
}

const noopRef = { current: null };
