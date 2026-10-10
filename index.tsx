import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

// Each app is loaded lazily so that only its own global CSS is applied
const App = window.location.pathname.startsWith("/color-picker")
  ? lazy(() => import("./src/ColorPickerApp.tsx"))
  : lazy(() => import("./fixtures/sample-lib/src/App.tsx"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense>
      <App />
    </Suspense>
  </StrictMode>
);
