import type { PropsWithChildren } from "react";

export function Answer({ children }: PropsWithChildren) {
  return <dd className="mb-2 flex flex-col gap-2">{children}</dd>;
}
