export type Type =
  | "array"
  | "boolean"
  | "null"
  | "number"
  | "object"
  | "string"
  | "undefined";

export function getDefaultValueType(value: string): Type {
  switch (value) {
    case "false":
    case "true": {
      return "boolean";
    }
    case "null": {
      return "null";
    }
    case "undefined": {
      return "undefined";
    }
    default: {
      if (value.trim() === "") {
        return "string";
      } else if (value.startsWith("{") && value.endsWith("}")) {
        return "object";
      }
    }
  }

  try {
    const parsed = JSON.parse(value);
    switch (typeof parsed) {
      case "number": {
        return "number";
      }
      default: {
        if (Array.isArray(parsed)) {
          return "array";
        }

        return "object";
      }
    }
  } catch {
    // No-op
  }

  return "string";
}
