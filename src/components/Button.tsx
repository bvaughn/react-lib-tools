import { Button as HeadlessButton, type ButtonProps } from "@headlessui/react";
import { cn } from "react-lib-tools";
import { Tooltip } from "./Tooltip";

export function Button({ className, title, ...rest }: ButtonProps) {
  let children = (
    <HeadlessButton
      {...rest}
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10",
        "focus:not-data-focus:outline-none data-focus:outline data-focus:outline-2",
        "cursor-pointer data-hover:bg-gray-600 data-open:bg-gray-700",
        className
      )}
    />
  );

  if (title) {
    children = <Tooltip content={title}>{children}</Tooltip>;
  }

  return children;
}
