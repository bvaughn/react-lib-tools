import {
  useCallback,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode
} from "react";
import {
  LibraryContext,
  type LibraryContextType,
  type Versions
} from "../../../contexts/LibraryContext";
import type { CommonQuestion } from "../../../types";

export function LibraryContextProvider({
  children,
  commonQuestions,
  overview,
  packageDescription,
  packageName,
  repositoryUrl,
  showOpenCollectLink,
  versions
}: PropsWithChildren<{
  commonQuestions?: CommonQuestion[];
  overview?: ReactNode | undefined;
  packageDescription: string;
  packageName: string;
  repositoryUrl: string;
  showOpenCollectLink?: boolean | undefined;
  versions?: Versions | undefined;
}>) {
  const [state, setState] = useState<{
    isNavVisible: boolean;
    isSiteSearchVisible: boolean;
  }>({
    isNavVisible: false,
    isSiteSearchVisible: false
  });

  const setIsNavVisible = useCallback(
    (value: boolean) =>
      setState((prevState) =>
        prevState.isNavVisible === value
          ? prevState
          : {
              ...prevState,
              isNavVisible: value
            }
      ),
    []
  );

  const setIsSiteSearchVisible = useCallback(
    (value: boolean) =>
      setState((prevState) =>
        prevState.isSiteSearchVisible === value
          ? prevState
          : {
              ...prevState,
              isSiteSearchVisible: value
            }
      ),
    []
  );

  const context = useMemo<LibraryContextType>(
    () => ({
      commonQuestions,
      isNavVisible: state.isNavVisible,
      isSiteSearchVisible: state.isSiteSearchVisible,
      overview,
      packageDescription,
      packageName,
      repositoryUrl: repositoryUrl.replace(".git", ""),
      setIsNavVisible,
      setIsSiteSearchVisible,
      showOpenCollectLink: !!showOpenCollectLink,
      versions
    }),
    [
      commonQuestions,
      overview,
      packageDescription,
      packageName,
      repositoryUrl,
      setIsNavVisible,
      setIsSiteSearchVisible,
      showOpenCollectLink,
      state.isNavVisible,
      state.isSiteSearchVisible,
      versions
    ]
  );

  return <LibraryContext.Provider children={children} value={context} />;
}

LibraryContextProvider.displayName = "LibraryContextProvider";
