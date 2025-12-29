import { createContext, type ReactNode } from "react";

export type LibraryContextType = {
  overview?: ReactNode | undefined;
  packageName: string;
  showOpenCollectLink: boolean;
};

export const LibraryContext = createContext<LibraryContextType | null>(null);
