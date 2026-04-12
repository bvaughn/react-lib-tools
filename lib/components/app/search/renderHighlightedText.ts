import { createElement, type ReactNode } from "react";

export function renderHighlightedText(
  text: string,
  query: string,
  config?: {
    maxLength: number;
    leading: number;
  }
) {
  if (!text) {
    return "";
  }

  const { maxLength = 0, leading = 0 } = config ?? {};

  query = query.trim().toLowerCase();

  const terms = query.split(" ").filter(Boolean);
  if (terms.length === 0) {
    return text;
  }

  const length = text.length;

  if (maxLength && length > maxLength) {
    const [matchIndexStart, matchIndexStop] = findFirstMatch(
      text.toLowerCase(),
      terms
    );

    if (matchIndexStop <= maxLength) {
      text = text.substring(0, maxLength) + "…";
    } else {
      const startIndex = Math.max(0, matchIndexStart - leading);
      const stopIndex = Math.min(length, startIndex + maxLength);

      if (stopIndex > maxLength) {
        text = "…" + text.substring(startIndex, stopIndex);
      }

      if (stopIndex < length) {
        text += "…";
      }
    }
  }

  let markedText = text;

  if (query) {
    terms.forEach((term) => {
      markedText = markedText.replaceAll(new RegExp(`(${term})`, "gi"), "├$1┤");
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

function findFirstMatch(text: string, terms: string[]) {
  let matchIndexStart = text.length;
  let matchIndexStop = text.length;

  terms.forEach((term) => {
    const index = text.indexOf(term);
    if (index < matchIndexStart) {
      matchIndexStart = index;
      matchIndexStop = index + term.length;
    }
  });

  return [matchIndexStart, matchIndexStop];
}
