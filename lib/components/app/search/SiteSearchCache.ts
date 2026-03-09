import type Fuse from "fuse.js";
import type { SiteSearchRecord } from "react-lib-tools";

let promise: Promise<Fuse<SiteSearchRecord>> | undefined = undefined;

export function read() {
  if (promise === undefined) {
    promise = new Promise((resolve) => {
      Promise.all([
        import("fuse.js").then((module) => module.default),
        fetch("/generated/search-records.json").then((response) =>
          response.json()
        ),
        fetch("/generated/search-index.json").then((response) =>
          response.json()
        )
      ]).then(([Fuse, records, searchIndex]) => {
        const fuse = new Fuse<SiteSearchRecord>(
          records,
          {
            isCaseSensitive: false,
            keys: ["title", "text"],
            threshold: 0.8
          },
          Fuse.parseIndex<SiteSearchRecord>(searchIndex)
        );

        resolve(fuse);
      });
    });
  }

  return promise;
}
