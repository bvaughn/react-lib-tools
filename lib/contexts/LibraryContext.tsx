import { createContext } from "react";

export type LibraryContextType = {
  packageName: string;
};

export const LibraryContext = createContext<LibraryContextType | null>(null);
