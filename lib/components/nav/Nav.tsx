import type { PropsWithChildren } from "react";

export function Nav({ children }: PropsWithChildren) {
  return (
    <nav className="w-full shrink-0 flex flex-col gap-4 py-4 h-full overflow-y-auto">
      {children}
    </nav>
  );
}
