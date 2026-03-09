import { createContext, type ReactNode } from "react";
import type { CommonQuestion } from "../types";

export type Versions = {
  [fullVersion: string]: string;
};

export type LibraryContextType = {
  commonQuestions: CommonQuestion[] | undefined;
  isNavVisible: boolean;
  isSiteSearchVisible: boolean;
  overview: ReactNode | undefined;
  packageDescription: string;
  packageName: string;
  repositoryUrl: string;
  setIsNavVisible: (value: boolean) => void;
  setIsSiteSearchVisible: (value: boolean) => void;
  showOpenCollectLink: boolean;
  versions: Versions | undefined;
};

export const LibraryContext = createContext<LibraryContextType | null>(null);
