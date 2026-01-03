import { scaleCanvas } from "../../../utils/scaleCanvas";
import type { Config } from "../types";

const ICON_SIZE = 100;
const VERTICAL_GAP = 5;
const HORIZONTAL_GAP = 25;

type DrawConfig = Config & {
  bgColor: string;
  fontSize: number;
  textColor: string;
};

export async function drawFlatWithLogo(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  { bgColor, fontSize, packageName, textColor }: DrawConfig
) {
  const texts = packageName.split("-");

  scaleCanvas(canvas, context);

  const canvasWidth = canvas.width / window.devicePixelRatio;
  const canvasHeight = canvas.height / window.devicePixelRatio;
  const canvasCenterY = canvasHeight / 2;

  context.fillStyle = bgColor;
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  const textX = HORIZONTAL_GAP * 2 + ICON_SIZE;
  const textY =
    canvasCenterY -
    ((fontSize / window.devicePixelRatio) * texts.length +
      (VERTICAL_GAP * (texts.length - 1)) / 2);

  texts.forEach((text, index) => {
    const offsetY = fontSize * (texts.length / 2);
    console.log(index, "->", offsetY);

    context.font = `bold ${fontSize}px sans-serif`;
    context.fillStyle = textColor;
    context.textBaseline = "middle";
    context.fillText(text, textX, canvasCenterY + offsetY);
  });

  // React SVG icon to the left of the text
  await new Promise<void>((resolve) => {
    const image = new Image();
    image.onload = function () {
      context.drawImage(
        image,
        HORIZONTAL_GAP,
        textY - 25,
        ICON_SIZE,
        ICON_SIZE
      );

      resolve();
    };
    image.src = "/svgs/react-alt.svg";
  });
}
