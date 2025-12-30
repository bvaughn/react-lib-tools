import { describe, expect, test } from "vitest";
import { getDefaultValueType } from "./getDefaultValueType";

describe("getDefaultValueType", () => {
  test.each(["[]", "[1,2]", '["a","b","c"]'])(
    "should identify array value: %s",
    (value) => {
      expect(getDefaultValueType(value)).toBe("array");
    }
  );

  test.each(["true", "false"])("should identify boolean value: %s", (value) => {
    expect(getDefaultValueType(value)).toBe("boolean");
  });

  test("should detect null values", () => {
    expect(getDefaultValueType("null")).toBe("null");
  });

  test.each(["0", "1", "1.0", "-1", "-1.0"])(
    "should identify numeric value: %s",
    (value) => {
      expect(getDefaultValueType(value)).toBe("number");
    }
  );

  test.each(["{}", '{foo:"a",bar:true, baz:123}'])(
    "should identify object value: %s",
    (value) => {
      expect(getDefaultValueType(value)).toBe("object");
    }
  );

  test.each(["", " ", "foo bar baz"])(
    "should identify string value: %o",
    (value) => {
      expect(getDefaultValueType(value)).toBe("string");
    }
  );

  test("should detect undefined values", () => {
    expect(getDefaultValueType("undefined")).toBe("undefined");
  });

  test.each(["1a", "-.!/"])(
    "should identify invalid value: %o as string",
    (value) => {
      expect(getDefaultValueType(value)).toBe("string");
    }
  );
});
