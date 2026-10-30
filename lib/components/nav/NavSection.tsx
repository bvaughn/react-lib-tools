import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from "@headlessui/react";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useState, type PropsWithChildren, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { NavButton } from "./NavButton";

export function NavSection({
  children,
  isActive,
  label,
  variant = "section"
}: PropsWithChildren<{
  /** Section contains the current route (sections are otherwise collapsed by default) */
  isActive: boolean;
  label: ReactNode;
  /** Groups (within a section) have smaller headings and less indented links */
  variant?: "group" | "section";
}>) {
  // Disclosure is uncontrolled; remount it with a new key to expand the section when it becomes active.
  // Sections aren't collapsed when they become inactive, so the links don't shift under the cursor.
  const [prevIsActive, setPrevIsActive] = useState(isActive);
  const [key, setKey] = useState(0);
  if (isActive !== prevIsActive) {
    setPrevIsActive(isActive);
    if (isActive) {
      setKey(key + 1);
    }
  }

  return (
    <Disclosure
      as={variant === "group" ? "div" : "section"}
      defaultOpen={isActive}
      key={key}
    >
      <DisclosureButton className="w-full group border-none! data-focus:bg-ink/10">
        <NavButton className={cn(variant === "group" && "min-h-7 py-1")}>
          <div
            className={cn(
              "uppercase text-ink/50",
              variant === "group"
                ? "text-xs font-semibold tracking-wide"
                : "text-sm font-bold"
            )}
          >
            {label}
          </div>
          <div className="grow" />
          <ChevronLeftIcon
            className={cn(
              "fill-ink/60 group-data-hover:fill-ink/50 group-data-open:-rotate-90",
              variant === "group" ? "size-3.5" : "size-4"
            )}
          />
        </NavButton>
      </DisclosureButton>
      <DisclosurePanel className={variant === "group" ? "pl-2" : "pl-4"}>
        {children}
      </DisclosurePanel>
    </Disclosure>
  );
}
