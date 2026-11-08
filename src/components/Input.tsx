import { Input as HeadlessInput, type InputProps } from "@headlessui/react";
import type { RefObject } from "react";
import { cn } from "react-lib-tools";

export function Input({
  className,
  inputRef,
  ...rest
}: InputProps & {
  inputRef?: RefObject<HTMLInputElement | null> | undefined;
}) {
  return (
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
}

const noopRef = { current: null };
