import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useState, type PropsWithChildren, type ReactNode } from "react";
import { NavButton } from "./NavButton";

export function NavSection({
  children,
  isActive,
  label
}: PropsWithChildren<{
  /** Section contains the current route (or sections aren't collapsed by default) */
  isActive: boolean;
  label: ReactNode;
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
    <Disclosure as="section" defaultOpen={isActive} key={key}>
      <DisclosureButton className="w-full group border-none! data-focus:bg-ink/10">
        <NavButton>
          <div className="uppercase text-sm font-bold text-ink/50">{label}</div>
          <div className="grow" />
          <ChevronRightIcon className="size-4 fill-ink/60 group-data-hover:fill-ink/50 group-data-open:rotate-90" />
        </NavButton>
      </DisclosureButton>
      <DisclosurePanel className="pl-4">{children}</DisclosurePanel>
    </Disclosure>
  );
}
