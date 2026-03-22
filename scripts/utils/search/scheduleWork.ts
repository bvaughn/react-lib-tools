type Work = () => Promise<unknown>;

const CONCURRENCY_LIMIT = 5;

const active = new Set<Work>();
const pending: Work[] = [];

let promise: Promise<unknown> | undefined = undefined;
let promiseResolver: (() => void) | undefined = undefined;

export async function scheduleWork(...work: Work[]) {
  if (work.length === 0) {
    return;
  }

  pending.push(...work);

  if (!promise) {
    promise = new Promise<void>((resolve) => {
      promiseResolver = resolve;
    });
  }

  for (let index = 0; index < CONCURRENCY_LIMIT; index++) {
    doNextUnitOfWork();
  }

  await promise;
}

async function doNextUnitOfWork() {
  if (active.size >= CONCURRENCY_LIMIT) {
    return;
  }

  const next = pending.shift();
  if (next) {
    active.add(next);

    await next();

    active.delete(next);

    doNextUnitOfWork();
  } else if (active.size === 0) {
    promiseResolver?.();

    promise = undefined;
    promiseResolver = undefined;
  }
}
