import { describe, expect, test } from "vitest";
import { getHashId } from "./getHashId";

describe("getHashId", () => {
  test("returns undefined for an empty hash", () => {
    expect(getHashId("")).toBeUndefined();
    expect(getHashId("#")).toBeUndefined();
  });

  test("decodes percent-escapes", () => {
    expect(getHashId("#min%20size")).toBe("min size");
  });

  test("returns malformed escapes as-is", () => {
    expect(getHashId("#%E0%A4")).toBe("%E0%A4");
  });
});
