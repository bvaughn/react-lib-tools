import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Records the path of the route that has finished rendering, as `data-rendered-path` on the root element.
 *
 * Navigation happens in a transition, so the previous page remains visible while the next one loads;
 * this lets the search index crawler (`compileSearchIndex`) navigate client-side and know when the new page's content is ready.
 * It renders as part of each route's element, so it's committed along with that route's content.
 */
export function RenderedRouteMarker() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    document.documentElement.setAttribute(
      "data-rendered-path",
      pathname + search
    );
  }, [pathname, search]);

  return null;
}
