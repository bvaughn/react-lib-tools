import { ArrowDownCircleIcon } from "@heroicons/react/20/solid";
import { useLayoutEffect, useState } from "react";
import { getMaxFont } from "../utils/getMaxFont";
import { scaleCanvas } from "../utils/scaleCanvas";
import { colors, type Color } from "./colors/colors";

export function OgImage({
  color1,
  color2,
  maxFontSize = 150,
  minFontSize = 50,
  packageDescription,
  packageName,
  showTextShadow
}: {
  color1: Color;
  color2: Color;
  maxFontSize?: number | undefined;
  minFontSize?: number | undefined;
  packageDescription: string;
  packageName: string;
  showTextShadow: boolean;
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useLayoutEffect(() => {
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    scaleCanvas(canvas, context);

    const canvasWidth = canvas.width / window.devicePixelRatio;
    const canvasHeight = canvas.height / window.devicePixelRatio;
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    // Gradient background
    const gradient = context.createLinearGradient(
      0,
      0,
      canvasWidth * Math.cos(45),
      canvasHeight * Math.sin(45)
    );
    gradient.addColorStop(0, colors[color1]);
    gradient.addColorStop(1, colors[color2]);
    context.fillStyle = gradient;
    context.roundRect(0, 0, canvasWidth, canvasHeight, 25);
    context.fill();

    let packageNameFontSize = maxFontSize;

    // Package name
    {
      context.fillStyle = "black";
      if (showTextShadow) {
        context.shadowColor = "white";
        context.shadowBlur = 10;
      }
      const { fontSize } = getMaxFont({
        context,
        getFontString: (fontSize: number) => `bold ${fontSize}px sans-serif`,
        maxFontSize,
        minFontSize,
        maxWidth: canvasWidth - 100,
        text: packageName
      });

      packageNameFontSize = fontSize;

      context.textBaseline = "middle";
      context.textAlign = "center";
      context.fillText(
        packageName,
        canvasCenterX,
        canvasCenterY - fontSize / window.devicePixelRatio
      );
    }

    // Package description
    {
      context.fillStyle = "white";
      if (showTextShadow) {
        context.shadowColor = "black";
        context.shadowBlur = 5;
      }
      const { fontSize } = getMaxFont({
        context,
        getFontString: (fontSize: number) => `${fontSize}px sans-serif`,
        maxFontSize: packageNameFontSize - 25,
        minFontSize,
        maxWidth: canvasWidth - 100,
        text: packageDescription
      });

      context.textBaseline = "middle";
      context.textAlign = "center";
      context.fillText(
        packageDescription,
        canvasCenterX,
        canvasCenterY + fontSize / window.devicePixelRatio
      );
    }
  });

  return (
    <div className="relative">
      <a
        className="absolute top-4 right-4 block pointer-cursor"
        download="og.png"
        onClick={(event) => {
          if (canvas === null) {
            event.preventDefault();
            return;
          }

          event.currentTarget.href = canvas.toDataURL();
        }}
      >
        <ArrowDownCircleIcon className="w-8 h-8 stroke fill-black stroke-white/50" />
      </a>
      <canvas className="w-[1200px] h-[630px]" ref={setCanvas} />
    </div>
  );
}
