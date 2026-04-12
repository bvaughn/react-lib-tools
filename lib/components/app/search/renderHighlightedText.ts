import { createElement, type ReactNode } from "react";

export function renderHighlightedText(
  text: string,
  query: string,
  config?: {
    maxLength: number;
    leading: number;
  }
) {
  const { maxLength = 250, leading = 0 } = config ?? {};

  query = query.trim().toLowerCase();

  if (maxLength && text.length > maxLength) {
    const firstIndex = text.toLowerCase().indexOf(query);
    const startIndex = Math.max(0, firstIndex - leading);
    const stopIndex = Math.min(text.length, startIndex + maxLength);

    text = text.substring(startIndex, stopIndex);

    if (startIndex > 0) {
      text = "…" + text;
    }
  }

  let markedText = text;

  if (query) {
    query.split(/\s+/).forEach((current) => {
      markedText = markedText.replaceAll(
        new RegExp(`(${current})`, "gi"),
        "├$1┤"
      );
    });
  }

  const rendered: ReactNode[] = [];

  let current = "";
  let markOpenCount = 0;

  for (let charIndex = 0; charIndex < markedText.length; charIndex++) {
    const char = markedText.charAt(charIndex);

    switch (char) {
      case "├": {
        markOpenCount++;
        if (markOpenCount === 1 && current) {
          rendered.push(current);
          current = "";
        }
        break;
      }
      case "┤": {
        markOpenCount--;
        if (markOpenCount === 0 && current) {
          rendered.push(createMark(current));
          current = "";
        }
        break;
      }
      default: {
        current += char;
        break;
      }
    }
  }

  if (current) {
    rendered.push(current);
  }

  return rendered;
}

let key = 0;

function createMark(text: string) {
  return createElement("mark", {
    children: text,
    className: "bg-transparent text-sky-300",
    key: ++key
  });
}
