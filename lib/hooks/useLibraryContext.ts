import { useContext } from "react";
import { LibraryContext } from "../contexts/LibraryContext";
import { assert } from "../utils/assert";

export function useLibraryContext() {
  const context = useContext(LibraryContext);
  assert(context, "App must be rendered within a LibraryContextProvider");

  return context;
}
