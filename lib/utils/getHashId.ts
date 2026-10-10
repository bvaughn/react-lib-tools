/**
 * Returns the (decoded) element id referenced by a URL hash, or undefined if there isn't one.
 * Malformed percent-escapes (e.g. from a truncated link) are returned as-is rather than throwing.
 */
export function getHashId(hash: string) {
  if (hash.length <= 1) {
    return undefined;
  }

  const id = hash.slice(1);
  try {
    return decodeURIComponent(id);
  } catch {
    return id;
  }
}
