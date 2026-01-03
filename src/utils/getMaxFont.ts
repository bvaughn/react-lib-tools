export function getMaxFont({
  context,
  getFontString,
  maxFontSize,
  minFontSize,
  maxWidth,
  text
}: {
  context: CanvasRenderingContext2D;
  getFontString: (fontSize: number) => string;
  maxFontSize: number;
  minFontSize: number;
  maxWidth: number;
  text: string;
}): {
  fontSize: number;
  fontString: string;
  height: number;
  width: number;
} {
  let fontSize = maxFontSize;

  while (fontSize >= minFontSize) {
    context.font = getFontString(fontSize);

    const { width } = context.measureText(text);
    if (width <= maxWidth || fontSize === minFontSize) {
      return {
        fontSize,
        fontString: context.font,
        height: fontSize,
        width
      };
    }

    fontSize--;
  }

  throw Error("Text did not fit");
}
