import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLibraryContext } from "../../hooks/useLibraryContext";
import { cn } from "../../utils/cn";

export function Nav() {
  const { isNavVisible, setIsNavVisible } = useLibraryContext();

  const { pathname } = useLocation();

  useLayoutEffect(() => {
    setIsNavVisible(false);
  }, [pathname, setIsNavVisible]);

  return (
    <div
      className={cn(
        "absolute top-0 left-0 h-full z-400 md:relative w-full md:w-50 shrink-0 hidden md:flex",
        "flex-col gap-4 py-2 border-r border-r-slate-800 overflow-y-auto",
        {
          flex: isNavVisible
        }
      )}
    >
      MOBILE NAV
    </div>
  );
}
