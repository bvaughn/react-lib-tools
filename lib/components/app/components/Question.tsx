import type { PropsWithChildren } from "react";

export function Question({ children, id }: PropsWithChildren<{ id: string }>) {
  return (
    <dt className="pt-4" id={id}>
      <a
        className="text-lg text-common-question-header! font-bold"
        href={`#${id}`}
      >
        {children}
      </a>
    </dt>
  );
}
