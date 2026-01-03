import { createContext, type ReactNode } from "react";

export type Versions = {
  [major: string]: {
    [fullVersion: string]: string;
  };
};

export type LibraryContextType = {
  overview?: ReactNode | undefined;
  packageDescription: string;
  packageName: string;
  showOpenCollectLink: boolean;
  url: string;
  versions: Versions | undefined;
};

export const LibraryContext = createContext<LibraryContextType | null>(null);
