/** Escapes characters with special meaning in a RegExp so user input can be matched literally (e.g. "c++" -> "c\+\+") */
export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
