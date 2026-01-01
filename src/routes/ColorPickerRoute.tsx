import { useState, type CSSProperties } from "react";
import { ColorPicker } from "../components/colors/ColorPicker";
import { colors, type Color } from "../components/colors/colors";
import { OgImage } from "../components/OgImage";

export default function ColorPickerRoute() {
  const [color1, setColor1] = useState<Color>("fuchsia-400");
  const [color2, setColor2] = useState<Color>("purple-700");
  const [color3, setColor3] = useState<Color>("pink-500");

  const [packageName, setPackageName] = useState("react-error-boundary");
  const [packageDescription, setPackageDescription] = useState(
    "runtime error handling"
  );

  return (
    <div
      className="h-screen flex flex-col gap-2 py-2 items-center"
      style={
        {
          "--color-background-gradient-1": `${colors[color1]}`,
          "--color-background-gradient-2": `${colors[color2]}`,
          "--color-background-gradient-3": `${colors[color3]}`
        } as CSSProperties
      }
    >
      <div className="flex flex-row gap-1 p-1">
        <ColorPicker color={color1} onChange={setColor1} />
        <ColorPicker color={color2} onChange={setColor2} />
        <ColorPicker color={color3} onChange={setColor3} />
        <input
          onChange={(event) => setPackageName(event.currentTarget.value)}
          placeholder="package name"
          value={packageName}
        />
        <input
          onChange={(event) => setPackageDescription(event.currentTarget.value)}
          placeholder="package description"
          value={packageDescription}
        />
      </div>
      <div className="w-full grow-1" data-background-gradient>
        <div className="w-full h-full max-w-350 mx-auto flex flex-col gap-2 pt-2  justify-end px-2">
          <div className="flex flex-row gap-2 items-center">
            <div className="text-xl text-white text-shadow-black/80 text-shadow-xs font-bold">
              {packageName}
            </div>
            <div className="text-black text-shadow-white/50 text-shadow-xs">
              {packageDescription}
            </div>
          </div>
          <div className="w-full bg-black/80 rounded-t grow-1 p-4">
            <pre className="text-center text-xs">{`--color-background-gradient-1: var(--color-${color1}); --color-background-gradient-2: var(--color-${color2}); --color-background-gradient-3: var(--color-${color3});`}</pre>
          </div>
        </div>
      </div>
      <OgImage
        packageDescription={packageDescription}
        packageName={packageName}
      />
    </div>
  );
}
