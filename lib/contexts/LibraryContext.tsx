import { createContext, type ReactNode } from "react";
import type { CommonQuestion } from "../types";

export type Versions = {
  [fullVersion: string]: string;
};

export type LibraryContextType = {
  commonQuestions: CommonQuestion[] | undefined;
  overview: ReactNode | undefined;
  packageDescription: string;
  packageName: string;
  repositoryUrl: string;
  showOpenCollectLink: boolean;
  versions: Versions | undefined;
};

export const LibraryContext = createContext<LibraryContextType | null>(null);
