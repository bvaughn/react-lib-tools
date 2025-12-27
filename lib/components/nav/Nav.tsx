import type { PropsWithChildren } from "react";

export function Nav({ children }: PropsWithChildren) {
  return (
    <div className="w-full shrink-0 flex flex-col gap-4 py-4 overflow-y-auto">
      {children}
    </div>
  );
}
