import { describe, expect, test } from "vitest";
import { getStem } from "./stem";

describe("getStem", () => {
  test("words with the same root share a stem", () => {
    expect(getStem("collapse")).toBe(getStem("collapsible"));
    expect(getStem("collapsed")).toBe(getStem("collapsible"));
    expect(getStem("panel")).toBe(getStem("panels"));
    expect(getStem("resize")).toBe(getStem("resizing"));
  });

  test("very short stems are ignored", () => {
    expect(getStem("on")).toBeUndefined();
    expect(getStem("one")).toBeUndefined();
    expect(getStem("use")).toBeUndefined();
  });

  test("stems remain correct after the cache fills up", () => {
    const expected = getStem("collapsible");
    for (let index = 0; index < 10_050; index++) {
      getStem(`word${index}`);
    }
    expect(getStem("collapsible")).toBe(expected);
    expect(getStem("on")).toBeUndefined();
  });
});
