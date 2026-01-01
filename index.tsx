import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ColorPickerRoute from "./src/routes/ColorPickerRoute.tsx";

import "@tailwindplus/elements";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<ColorPickerRoute />} path="/color-picker" />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
