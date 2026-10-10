import { BrowserRouter, Route, Routes } from "react-router-dom";
import ColorPickerRoute from "./routes/ColorPickerRoute.tsx";

import "@tailwindplus/elements";
import "../index.css";

export default function ColorPickerApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/color-picker" element={<ColorPickerRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
