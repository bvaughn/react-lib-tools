import { ArrowDownCircleIcon } from "@heroicons/react/20/solid";
import { useLayoutEffect, useState } from "react";
import { scaleCanvas } from "../utils/scaleCanvas";
import { colors, type Color } from "./colors/colors";

export function OgImage({
  color1,
  color2,
  packageDescription,
  packageName,
  showTextShadow
}: {
  color1: Color;
  color2: Color;
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

    console.log("[pre] canvas.width:", canvas.width);
    scaleCanvas(canvas, context);
    console.log("[post] canvas.width:", canvas.width);

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

    // Package name
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.font = "bold 50px sans-serif";
    context.fillStyle = "black";
    if (showTextShadow) {
      context.shadowColor = "white";
      context.shadowBlur = 4;
    }
    context.fillText(packageName, canvasCenterX, canvasCenterY - 30);

    // Package description
    // context.measureText(packageName);
    context.font = "40px sans-serif";
    context.fillStyle = "white";
    if (showTextShadow) {
      context.shadowColor = "black";
      context.shadowBlur = 2;
    }
    context.fillText(packageDescription, canvasCenterX, canvasCenterY + 30);
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
