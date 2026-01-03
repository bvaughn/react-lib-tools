import { useLayoutEffect, type RefObject } from "react";
import type { Config } from "./types";

export function OgImageCanvas<DrawConfig extends Config>({
  drawConfig,
  drawFunction,
  ref
}: {
  drawConfig: DrawConfig;
  drawFunction: (
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    config: DrawConfig
  ) => void;
  ref: RefObject<HTMLCanvasElement | null>;
}) {
  useLayoutEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    drawFunction(canvas, context, drawConfig);
  }, [drawConfig, drawFunction, ref]);

  return (
    <a
      className="cursor-pointer"
      download="og.png"
      onClick={(event) => {
        const canvas = ref.current;
        if (canvas === null) {
          event.preventDefault();
          return;
        }

        event.currentTarget.href = canvas.toDataURL();
      }}
      title="download og.png"
    >
      <canvas className="w-[600px] h-[315px]" ref={ref} />
    </a>
  );
}
