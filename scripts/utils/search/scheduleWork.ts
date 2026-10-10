type Work = () => Promise<unknown>;

const CONCURRENCY_LIMIT = 5;

const active = new Set<Work>();
const pending: Work[] = [];

let promise: Promise<unknown> | undefined = undefined;
let promiseResolver: (() => void) | undefined = undefined;

/**
 * Queues work to run with limited concurrency (shared across all callers).
 * The returned promise resolves once the queue is empty, including work queued by other work while it runs;
 * this lets crawling a page schedule its links without awaiting them, and the first caller wait for the whole crawl.
 */
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
