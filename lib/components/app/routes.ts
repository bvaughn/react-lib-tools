import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type Route = LazyExoticComponent<ComponentType<unknown>>;

export const routes = {
  "*": lazy(() => import("./routes/PageNotFound")),
  "/": lazy(() => import("./routes/GettingStartedRoute")),
  "/common-questions": lazy(() => import("./routes/CommonQuestionsRoute")),
  "/support": lazy(() => import("./routes/SupportRoute")),
  "/versions": lazy(() => import("./routes/VersionsRoute"))
} satisfies Record<string, Route>;

export type Routes = Record<keyof typeof routes, Route>;
export type Path = keyof Routes;
