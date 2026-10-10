import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type Route = LazyExoticComponent<ComponentType<unknown>>;

export const routes = {
  "/badge": lazy(() => import("./routes/BadgeRoute")),
  "/badge/props": lazy(() => import("./routes/BadgePropsRoute")),
  "/counter": lazy(() => import("./routes/CounterRoute")),
  "/counter/imperative-handle": lazy(
    () => import("./routes/CounterImperativeHandleRoute")
  ),
  "/counter/props": lazy(() => import("./routes/CounterPropsRoute"))
} satisfies Record<string, Route>;

export type Routes = Record<keyof typeof routes, Route>;
export type Path = keyof Routes;
