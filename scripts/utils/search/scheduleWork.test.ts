// @vitest-environment node

import { describe, expect, test } from "vitest";
import { scheduleWork } from "./scheduleWork";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("scheduleWork", () => {
  test("should resolve immediately when there is no work", async () => {
    await expect(scheduleWork()).resolves.toBeUndefined();
  });

  test("should wait for work scheduled by other work (e.g. crawled links)", async () => {
    const completed: string[] = [];

    await scheduleWork(async () => {
      await delay(1);
      completed.push("root");

      // Not awaited, the same way crawlPage schedules the pages it finds
      scheduleWork(
        async () => {
          await delay(5);
          completed.push("a");
        },
        async () => {
          await delay(1);
          completed.push("b");
        }
      );
    });

    expect(completed.sort()).toEqual(["a", "b", "root"]);
  });

  test("should run at most 5 units of work at a time", async () => {
    let active = 0;
    let maxActive = 0;

    await scheduleWork(
      ...Array.from({ length: 12 }, () => async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await delay(2);
        active--;
      })
    );

    expect(active).toBe(0);
    expect(maxActive).toBe(5);
  });
});
