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
        "block w-full rounded-md border-none bg-white/10 px-2 py-1 text-sm text-white",
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
