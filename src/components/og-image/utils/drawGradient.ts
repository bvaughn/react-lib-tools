import { getMaxFont } from "../../../utils/getMaxFont";
import { scaleCanvas } from "../../../utils/scaleCanvas";
import type { Config } from "../types";

const maxPackageNameFontSize = 75;
const maxPackageDescriptionFontSize = 50;
const minFontSize = 25;
const VERTICAL_GAP = 20;
const HORIZONTAL_MARGIN = 50;

type DrawConfig = Config & {
  color1: string;
  color2: string;
  packageDescriptionColor: string;
  packageNameColor: string;
};

export function drawGradient(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  {
    color1,
    color2,
    packageDescription,
    packageDescriptionColor,
    packageName,
    packageNameColor
  }: DrawConfig
) {
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
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  let packageNameFontSize = maxPackageNameFontSize;

  // Package name
  {
    const { fontSize, height } = getMaxFont({
      context,
      getFontString: (fontSize: number) => `bold ${fontSize}px sans-serif`,
      maxFontSize: maxPackageNameFontSize,
      minFontSize,
      maxWidth: canvasWidth - HORIZONTAL_MARGIN,
      text: packageName
    });

    packageNameFontSize = fontSize;

    context.fillStyle = packageNameColor;
    context.shadowColor = "white";
    context.shadowBlur = 10;
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillText(
      packageName,
      canvasCenterX,
      canvasCenterY - height / 2 - VERTICAL_GAP / 2
    );
  }

  // Package description
  {
    const { height } = getMaxFont({
      context,
      getFontString: (fontSize: number) => `${fontSize}px sans-serif`,
      maxFontSize: Math.min(packageNameFontSize, maxPackageDescriptionFontSize),
      minFontSize,
      maxWidth: canvasWidth - HORIZONTAL_MARGIN,
      text: packageDescription
    });

    context.fillStyle = packageDescriptionColor;
    context.shadowColor = "black";
    context.shadowBlur = 5;
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillText(
      packageDescription,
      canvasCenterX,
      canvasCenterY + height / 2 + VERTICAL_GAP / 2
    );
  }
}
