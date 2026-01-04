import { type PropsWithChildren } from "react";
import { Tooltip } from "react-lib-tools";
import { height, width } from "./constants";

export function DownloadableSvg({ children }: PropsWithChildren) {
  return (
    <Tooltip content="Left-click to download og.png; right-click to download og.svg">
      <div
        className="cursor-pointer"
        onClick={async (event) => {
          event.preventDefault();

          const dataUrl = getSvgDataUrl(event.target);

          const image = new Image();

          await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = dataUrl;
          });

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext("2d") as CanvasRenderingContext2D;
          context.drawImage(image, 0, 0, width, height);

          downloadAsFile("og.png", canvas.toDataURL("image/png"));
        }}
        onContextMenu={async (event) => {
          event.preventDefault();

          const dataUrl = getSvgDataUrl(event.target);

          downloadAsFile("og.svg", dataUrl);
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
}

function downloadAsFile(fileName: string, data: string) {
  const anchor = document.createElement("a");
  anchor.download = fileName;
  anchor.href = data;
  anchor.click();
}

function getSvgDataUrl(target: EventTarget): string {
  let current = target as HTMLElement | SVGElement | null;
  while (current) {
    if (current.tagName === "svg") {
      const svg = current as SVGElement;
      const xmlSerializer = new XMLSerializer();
      const htmlString = xmlSerializer.serializeToString(svg);

      return `data:image/svg+xml;base64,${btoa(htmlString)}`;
    }

    current = current.parentElement;
  }

  throw Error("SVG Element not found");
}
