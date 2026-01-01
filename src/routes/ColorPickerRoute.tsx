import { useState, type CSSProperties } from "react";
import { ColorPicker } from "../components/colors/ColorPicker";
import { type Color, colors } from "../components/colors/colors";

export default function ColorPickerRoute() {
  const [colorA, setColorA] = useState<Color>("white");
  const [colorB, setColorB] = useState<Color>("white");
  const [colorC, setColorC] = useState<Color>("white");

  return (
    <div className="h-screen flex flex-col items-center gap-1">
      <div className="flex flex-row gap-1 p-1">
        <ColorPicker color={colorA} onChange={setColorA} />
        <ColorPicker color={colorB} onChange={setColorB} />
        <ColorPicker color={colorC} onChange={setColorC} />
      </div>
      <div
        className="w-full grow-1"
        data-background-gradient
        style={
          {
            "--color-background-gradient-1": `${colors[colorA]}`,
            "--color-background-gradient-2": `${colors[colorB]}`,
            "--color-background-gradient-3": `${colors[colorC]}`
          } as CSSProperties
        }
      >
        <div className="w-full h-full max-w-350 mx-auto flex flex-col gap-2 pt-2 items-center justify-end px-2">
          <div className="flex flex-row gap-2 items-center">
            <div className="text-white text-shadow-black/80 text-shadow-xs font-bold">
              package-name
            </div>
            <div className="text-black text-shadow-white/50 text-shadow-xs">
              package description
            </div>
          </div>
          <div className="w-full bg-black/80 rounded-t grow-1 p-4">
            <pre className="text-center text-xs">{`--color-background-gradient-1: var(--color-${colorA}); --color-background-gradient-2: var(--color-${colorB}); --color-background-gradient-3: var(--color-${colorC});`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
