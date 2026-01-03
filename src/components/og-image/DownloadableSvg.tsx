import { type PropsWithChildren } from "react";

export function DownloadableSvg({ children }: PropsWithChildren) {
  return (
    <a
      className="cursor-pointer"
      download="og.svg"
      onClick={(event) => {
        let current = event.target as HTMLElement | SVGAElement | null;
        while (current) {
          if (current instanceof SVGElement) {
            const base64 = btoa(
              unescape(encodeURIComponent(current.outerHTML))
            );

            event.currentTarget.href = `data:image/svg+xml;base64,${base64}`;
          }

          current = current.parentElement;
        }
      }}
      title="download og.svg"
    >
      {children}
    </a>
  );
}
