import { Switch as HeadlessSwitch, type SwitchProps } from "@headlessui/react";
import { cn } from "react-lib-tools";
import { Tooltip } from "./Tooltip";

export function Switch({ className, title, ...rest }: SwitchProps) {
  let children = (
    <div className={cn("h-fit", className)}>
      <HeadlessSwitch
        {...rest}
        className={cn(
          "group relative flex h-7 w-14 rounded-full p-1 cursor-pointer ease-in-out",
          "bg-white/10 hover:bg-white/20 data-checked:bg-sky-500",
          "focus:not-data-focus:outline-none data-focus:outline data-focus:outline-2"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "inline-block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 pointer-events-none",
            "transition! ease-in-out group-data-checked:translate-x-7"
          )}
        />
      </HeadlessSwitch>
    </div>
  );

  if (title) {
    children = <Tooltip content={title}>{children}</Tooltip>;
  }

  return children;
}
