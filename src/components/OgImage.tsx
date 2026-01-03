import { ArrowDownCircleIcon } from "@heroicons/react/20/solid";
import { useDeferredValue, useLayoutEffect, useState } from "react";
import { getMaxFont } from "../utils/getMaxFont";
import { scaleCanvas } from "../utils/scaleCanvas";
import { colors, type Color } from "./colors/colors";

const maxPackageNameFontSize = 75;
const maxPackageDescriptionFontSize = 50;
const minFontSize = 25;

export function OgImage({
  color1: color1Prop,
  color2: color2Prop,
  packageDescription: packageDescriptionProp,
  packageName: packageNameProp
}: {
  color1: Color;
  color2: Color;
  packageDescription: string;
  packageName: string;
}) {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  const color1 = useDeferredValue(color1Prop);
  const color2 = useDeferredValue(color2Prop);
  const packageDescription = useDeferredValue(packageDescriptionProp);
  const packageName = useDeferredValue(packageNameProp);

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

    let packageNameFontSize = maxPackageNameFontSize;

    // Package name
    {
      const { fontSize, height } = getMaxFont({
        context,
        getFontString: (fontSize: number) => `bold ${fontSize}px sans-serif`,
        maxFontSize: maxPackageNameFontSize,
        minFontSize,
        maxWidth: canvasWidth - 100,
        text: packageName
      });

      packageNameFontSize = fontSize;

      context.fillStyle = "black";
      context.shadowColor = "white";
      context.shadowBlur = 10;
      context.textBaseline = "middle";
      context.textAlign = "center";
      context.fillText(
        packageName,
        canvasCenterX,
        canvasCenterY - height / 2 - 10
      );
    }

    // Package description
    {
      const { height } = getMaxFont({
        context,
        getFontString: (fontSize: number) => `${fontSize}px sans-serif`,
        maxFontSize: Math.min(
          packageNameFontSize,
          maxPackageDescriptionFontSize
        ),
        minFontSize,
        maxWidth: canvasWidth - 100,
        text: packageDescription
      });

      context.fillStyle = "white";
      context.shadowColor = "black";
      context.shadowBlur = 5;
      context.textBaseline = "middle";
      context.textAlign = "center";
      context.fillText(
        packageDescription,
        canvasCenterX,
        canvasCenterY + height / 2 + 10
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
      <canvas className="w-[600px] h-[315px]" ref={setCanvas} />
    </div>
  );
}
