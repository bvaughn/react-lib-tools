import { type PropsWithChildren } from "react";
import { Tooltip } from "react-lib-tools";
import { height, width } from "./constants";

export function DownloadableSvg({ children }: PropsWithChildren) {
  return (
    <Tooltip content="Click to download og.png">
      <div
        className="cursor-pointer"
        onClick={async (event) => {
          event.preventDefault();

          let current = event.target as HTMLElement | SVGAElement | null;
          while (current) {
            if (current.tagName === "svg") {
              const svg = current as SVGElement;
              const xmlSerializer = new XMLSerializer();
              const svgString = xmlSerializer.serializeToString(svg);
              console.log("svg:\n" + svgString);

              const image = new Image();

              await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
                image.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
              });

              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;

              const context = canvas.getContext(
                "2d"
              ) as CanvasRenderingContext2D;
              context.drawImage(image, 0, 0, width, height);

              const anchor = document.createElement("a");
              anchor.download = "og.png";
              anchor.href = canvas.toDataURL("image/png");
              anchor.click();

              return;
            }

            current = current.parentElement;
          }
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
}
