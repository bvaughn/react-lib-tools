import { render } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { LibraryContextProvider } from "./components/app/components/LibraryContextProvider";

type ContextProps = Omit<
  ComponentProps<typeof LibraryContextProvider>,
  "children"
>;

/**
 * Renders UI within the providers that AppRoot normally sets up (library context and a router).
 * The current location is rendered into an element with the test id "location".
 */
export function renderWithProviders(
  ui: ReactNode,
  {
    context,
    path = "/"
  }: {
    context?: Partial<ContextProps>;
    path?: string;
  } = {}
) {
  return render(
    <LibraryContextProvider
      packageDescription="a test library"
      packageName="test-lib"
      repositoryUrl="https://github.com/example/test-lib"
      {...context}
    >
      <MemoryRouter initialEntries={[path]}>
        {ui}
        <CurrentLocation />
      </MemoryRouter>
    </LibraryContextProvider>
  );
}

function CurrentLocation() {
  const { hash, pathname } = useLocation();

  return <div data-testid="location">{pathname + hash}</div>;
}
