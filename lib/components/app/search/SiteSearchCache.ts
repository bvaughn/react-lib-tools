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
            ignoreLocation: true,
            includeMatches: false,
            isCaseSensitive: false,
            keys: [
              { name: "title", weight: 5 },
              { name: "section", weight: 1 },
              { name: "text", weight: 1 }
            ],
            minMatchCharLength: 2,
            threshold: 0
          },
          Fuse.parseIndex<SiteSearchRecord>(searchIndex)
        );

        resolve(fuse);
      });
    });
  }

  return promise;
}
