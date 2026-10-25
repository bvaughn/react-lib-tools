/** A project listed in the header's project menu */
export type Project = {
  description: string;
  icon: string;
  name: string;
  url: string;
};

const promises = new Map<string, Promise<Project[]>>();
const failed = new Set<string>();

// A failed read stays cached until it is explicitly cleared (see clearFailedRead);
// clearing it automatically would give React a new promise on every render, retrying indefinitely
export function read(url: string) {
  let promise = promises.get(url);
  if (promise === undefined) {
    promise = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load projects (${response.status} ${response.statusText})`
          );
        }

        return response.json();
      })
      .then((json) => {
        const projects = parseProjects(json);

        // use() reads a fulfilled promise's value synchronously, rather than suspending for a render first;
        // so the list renders as soon as the menu opens if it was preloaded (and its first item can be made active)
        Object.assign(promise!, { status: "fulfilled", value: projects });

        return projects;
      })
      .catch((error) => {
        failed.add(url);
        throw error;
      });
    promises.set(url, promise);
  }

  return promise;
}

/** If the last read failed, the next one will try again */
export function clearFailedRead(url: string) {
  if (failed.delete(url)) {
    promises.delete(url);
  }
}

// Every docs site reads the same file, so tolerate entries this version doesn't understand rather than failing
function parseProjects(json: unknown): Project[] {
  if (!Array.isArray(json)) {
    throw new Error("Invalid projects list");
  }

  const projects: Project[] = [];
  for (const value of json) {
    if (
      typeof value?.name !== "string" ||
      typeof value?.url !== "string" ||
      !URL.canParse(value.url)
    ) {
      continue;
    }

    projects.push({
      description:
        typeof value.description === "string" ? value.description : "",
      icon:
        typeof value.icon === "string"
          ? new URL(value.icon, value.url).href
          : new URL("/favicon.svg", value.url).href,
      name: value.name,
      url: value.url
    });
  }

  return projects;
}
