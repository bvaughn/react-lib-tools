import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type Route = LazyExoticComponent<ComponentType<unknown>>;

export const routes = {
  "*": lazy(() => import("./routes/PageNotFound")),
  "/": lazy(() => import("./routes/GettingStartedRoute")),
  "/support": lazy(() => import("./routes/SupportRoute"))
} satisfies Record<string, Route>;
