import {
  Textarea as HeadlessTextarea,
  type TextareaProps
} from "@headlessui/react";
import { cn } from "react-lib-tools";

export function Textarea({ className, ...rest }: TextareaProps) {
  return (
    <HeadlessTextarea
      {...rest}
      className={cn(
        "block w-full resize-none rounded-md border-none bg-white/10 px-2 py-1 text-sm text-white",
        "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2",
        className
      )}
    />
  );
}
