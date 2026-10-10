import { stemmer } from "stemmer";

// Very short stems are ambiguous (e.g. "on" from both "on" and "one", "us" from "use"), so they're ignored
const MIN_STEM_LENGTH = 3;

// Words without a meaningful stem are cached as "" so each lookup is a single Map access
const cache = new Map<string, string>();

/**
 * The root form of a lowercase word (e.g. "collapse", "collapsed", and "collapsible" all become "collaps"),
 * or undefined if the word doesn't have a meaningful stem.
 */
export function getStem(word: string): string | undefined {
  let stem = cache.get(word);
  if (stem === undefined) {
    stem = stemmer(word);
    if (stem.length < MIN_STEM_LENGTH) {
      stem = "";
    }
    cache.set(word, stem);
  }
  return stem || undefined;
}
