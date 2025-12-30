import { createContext, type ReactNode } from "react";

export type Versions = {
  [major: string]: {
    [fullVersion: string]: string;
  };
};

export type LibraryContextType = {
  overview?: ReactNode | undefined;
  packageName: string;
  showOpenCollectLink: boolean;
  versions: Versions | undefined;
};

export const LibraryContext = createContext<LibraryContextType | null>(null);
