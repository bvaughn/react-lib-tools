export const INTENT_FLAGS = {
  "❌": "danger",
  "NOTE:": "none",
  ℹ️: "primary",
  "✅": "success",
  "⚠️": "warning"
};

// Converts JSDoc tags into Markdown and ensures that each intent flag
// (including the one @deprecated is replaced with) starts its own paragraph.
// Papers over differences between "@ts-ast-parser/core" and "react-docgen-typescript"
// The `kind` (default "prop") names what a @deprecated tag applies to, e.g. "This hook has been deprecated."
export function normalizeDescription(
  rawText: string,
  { kind = "prop" }: { kind?: string | undefined } = {}
) {
  // Fenced code blocks are left untouched; JSDoc tags are only tags at line start.
  return rawText
    .split(/(```[\s\S]*?```)/)
    .map((part) => (part.startsWith("```") ? part : normalizeText(part, kind)))
    .join("");
}

function normalizeText(rawText: string, kind: string) {
  let text = rawText;

  text = text.replace(
    /^[ \t]*@deprecated\b/gm,
    `❌ This ${kind} has been deprecated.`
  );
  text = text.replace(/^[ \t]*@param (\w+)/gm, "- `$1`");
  text = text.replace(/^[ \t]*@returns?\b[ \t]*/gm, "\n**Returns:** ");

  Object.keys(INTENT_FLAGS).forEach((flag) => {
    text = text
      .split(`\n${flag}`)
      .join(`\n\n${flag}`)
      .replaceAll("\n\n\n", "\n\n");
  });

  return text;
}
