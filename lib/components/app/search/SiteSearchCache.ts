import type { SiteMapPage } from "../../../../types";

let promise: Promise<SiteMapPage[]> | undefined = undefined;
let failed = false;

// A failed read stays cached until it is explicitly cleared (see clearFailedRead);
// clearing it automatically would give React a new promise on every render, retrying indefinitely
export function read() {
  if (promise === undefined) {
    promise = fetch("/generated/site-map.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load search index (${response.status} ${response.statusText})`
          );
        }

        return response.json();
      })
      .catch((error) => {
        failed = true;
        throw error;
      });
  }

  return promise;
}

/** If the last read failed, the next one will try again */
export function clearFailedRead() {
  if (failed) {
    failed = false;
    promise = undefined;
  }
}
