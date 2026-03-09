import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLibraryContext } from "../../../hooks/useLibraryContext";

export function RouteChangeHandler() {
  const { setIsNavVisible, setIsSiteSearchVisible } = useLibraryContext();

  const { pathname } = useLocation();

  useLayoutEffect(() => {
    setIsNavVisible(false);
    setIsSiteSearchVisible(false);

    const main = document.body.querySelector("[data-main-scrollable]");
    if (main) {
      const timeout = setTimeout(() => {
        main.scrollTo(0, 0);
      }, 1);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [pathname, setIsNavVisible, setIsSiteSearchVisible]);

  return null;
}
