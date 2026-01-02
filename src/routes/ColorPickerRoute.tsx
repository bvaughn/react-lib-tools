import { type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { ColorPicker } from "../components/colors/ColorPicker";
import { colors, type Color } from "../components/colors/colors";
import { OgImage } from "../components/OgImage";

export default function ColorPickerRoute() {
  const [params, setParams] = useSearchParams();

  const state = {
    color1: (params.get("color1") ?? "fuchsia-400") as Color,
    color2: (params.get("color2") ?? "purple-700") as Color,
    color3: (params.get("color3") ?? "pink-500") as Color,
    packageDescription:
      params.get("packageDescription") ?? "short package description",
    packageName: params.get("packageName") ?? "package-name"
  };

  const { color1, color2, color3, packageDescription, packageName } = state;

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
        <ColorPicker
          color={color1}
          onChange={(color) => setParams({ ...state, color1: color })}
        />
        <ColorPicker
          color={color2}
          onChange={(color) => setParams({ ...state, color2: color })}
        />
        <ColorPicker
          color={color3}
          onChange={(color) => setParams({ ...state, color3: color })}
        />
        <input
          className="bg-slate-800 h-8 px-2 rounded-xs border border-slate-700"
          onChange={(event) =>
            setParams({ ...state, packageName: event.currentTarget.value })
          }
          placeholder="package name"
          value={packageName}
        />
        <input
          className="bg-slate-800 h-8 px-2 rounded-xs border border-slate-700"
          onChange={(event) =>
            setParams({
              ...state,
              packageDescription: event.currentTarget.value
            })
          }
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
