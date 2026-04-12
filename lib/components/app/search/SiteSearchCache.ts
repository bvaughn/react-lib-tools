import type { SiteMapPage } from "../../../../types";

let promise: Promise<SiteMapPage[]> | undefined = undefined;

export function read() {
  if (promise === undefined) {
    promise = fetch("/generated/site-map.json").then((response) =>
      response.json()
    );
  }

  return promise;
}
