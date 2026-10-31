import { Button, Transition } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useId, useState, type PropsWithChildren, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { NavButton } from "./NavButton";
import { REVEAL_CLASS_NAME } from "./reveal";

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
  // Expand the section when it becomes active (it animates open only if it was collapsed).
  // Sections aren't collapsed when they become inactive, so the links don't shift under the cursor.
  const [isOpen, setIsOpen] = useState(isActive);
  const [prevIsActive, setPrevIsActive] = useState(isActive);
  if (isActive !== prevIsActive) {
    setPrevIsActive(isActive);
    if (isActive) {
      setIsOpen(true);
    }
  }

  const panelId = useId();
  const Container = variant === "group" ? "div" : "section";

  return (
    <Container>
      <Button
        aria-controls={isOpen ? panelId : undefined}
        aria-expanded={isOpen}
        className="w-full group border-none! data-focus:bg-ink/10"
        data-open={isOpen || undefined}
        onClick={() => setIsOpen(!isOpen)}
      >
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
          <ChevronRightIcon
            className={cn(
              "fill-ink/60 group-data-hover:fill-ink/50 transition-transform! duration-250! motion-reduce:transition-none! group-data-open:rotate-90",
              variant === "group" ? "size-3.5" : "size-4"
            )}
          />
        </NavButton>
      </Button>
      <Transition show={isOpen}>
        <div className={REVEAL_CLASS_NAME} id={panelId}>
          <div
            className={cn(
              "min-h-0 overflow-hidden",
              variant === "group" ? "pl-2" : "pl-4"
            )}
          >
            {children}
          </div>
        </div>
      </Transition>
    </Container>
  );
}
