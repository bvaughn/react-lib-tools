import { Button as HeadlessButton } from "@headlessui/react";
import type { KeyboardEvent, MouseEvent, PropsWithChildren } from "react";
import type { Intent } from "../types";
import { cn } from "../utils/cn";

export function Button({
  children,
  className,
  disabled = false,
  intent = "primary",
  ...rest
}: PropsWithChildren<{
  className?: string | undefined;
  disabled?: boolean | undefined;
  intent?: Intent | undefined;
  onClick?: ((event: MouseEvent) => void) | undefined;
  onKeyDown?: ((event: KeyboardEvent) => void) | undefined;
}>) {
  return (
    <HeadlessButton
      className={cn(
        "rounded-md font-bold cursor-pointer px-2",
        getClassNames(intent, !!disabled),
        {
          "opacity-50 cursor-default": disabled
        },
        className
      )}
      data-focus
      disabled={disabled}
      {...rest}
    >
      {children}
    </HeadlessButton>
  );
}

function getClassNames(intent: Intent, disabled: boolean) {
  switch (intent) {
    case "danger": {
      return cn("bg-red-400 text-red-950 focus:text-black", {
        "hover:bg-red-500 focus:text-black": !disabled
      });
    }
    case "none": {
      return cn("bg-white/20 text-slate-300 focus:text-white", {
        "hover:bg-white/10 focus:text-white": !disabled
      });
    }
    case "success": {
      return cn("bg-emerald-400 text-emerald-950 focus:text-black", {
        "hover:bg-emerald-500 focus:text-black": !disabled
      });
    }
    case "primary": {
      return cn("bg-sky-400 text-sky-950 focus:text-black", {
        "hover:bg-sky-500 focus:text-black": !disabled
      });
    }
    case "warning": {
      return cn("bg-amber-400 text-amber-950 focus:text-black", {
        "hover:bg-amber-500 focus:text-black": !disabled
      });
    }
  }
}
