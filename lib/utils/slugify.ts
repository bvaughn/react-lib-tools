/** Converts heading text into a URL-fragment-friendly id (e.g. "Required props" -> "required-props") */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
