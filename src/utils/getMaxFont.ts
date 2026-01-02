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
  width: number;
} {
  let fontSize = maxFontSize;

  while (fontSize >= minFontSize) {
    context.font = getFontString(fontSize);

    const { width } = context.measureText(text);
    if (width <= maxWidth) {
      return {
        fontSize,
        fontString: context.font,
        width
      };
    }

    fontSize--;
  }

  throw Error("Text did not fit");
}
