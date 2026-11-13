import type { Intent, Section } from "../../../lib/types.ts";
import { syntaxHighlight, type Language } from "../syntax-highlight.ts";
import { formatDescriptionText } from "./formatDescriptionText.ts";
import { INTENT_FLAGS, normalizeDescription } from "./normalizeDescription.ts";

export async function parseDescription(rawText: string) {
  const sections: Section[] = [];

  const text = normalizeDescription(rawText);

  for (const chunk of text.split("\n\n")) {
    let code = false;
    let content = "";
    let intent: Intent | undefined = undefined;

    if (chunk.startsWith("```")) {
      code = true;

      const match = chunk.match(/^```([a-z]+)/)!;
      const language = match[1].toUpperCase() as Language;

      content = await syntaxHighlight(
        chunk.substring(language.length + 3, chunk.length - 3).trim(),
        language
      );
    } else {
      content = formatDescriptionText(chunk.trim());

      for (const char in INTENT_FLAGS) {
        if (content.startsWith(`<p>${char} `)) {
          intent = INTENT_FLAGS[char as keyof typeof INTENT_FLAGS] as Intent;
          content = content.replace(`<p>${char} `, "<p>");
        }
      }
    }

    sections.push({
      code: code || undefined,
      content,
      intent
    });
  }

  return sections;
}
