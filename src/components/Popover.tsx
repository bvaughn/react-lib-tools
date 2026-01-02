import {
  Popover as HeadlessPopover,
  PopoverButton,
  PopoverPanel
} from "@headlessui/react";
import type { PropsWithChildren, ReactNode } from "react";

export function Popover({
  children,
  content
}: PropsWithChildren<{ content: ReactNode }>) {
  return (
    <HeadlessPopover>
      <PopoverButton>{children}</PopoverButton>
      <PopoverPanel
        transition
        anchor="bottom"
        className="data-closed:-translate-y-1 data-closed:opacity-0"
      >
        {content}
      </PopoverPanel>
    </HeadlessPopover>
  );
}
