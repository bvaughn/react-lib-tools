import { useDeferredValue, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { ColorPicker } from "../components/colors/ColorPicker";
import { colors, type Color } from "../components/colors/colors";
import { Input } from "../components/Input";
import { OgImageFlatWithLogo } from "../components/og-image/OgImageFlatWithLogo";
import { OgImageGradient } from "../components/og-image/OgImageGradient";

export default function ColorPickerRoute() {
  const [params, setParams] = useSearchParams();

  const state = {
    gradientColor1: (params.get("gradientColor1") ?? "fuchsia-400") as Color,
    gradientColor2: (params.get("gradientColor2") ?? "purple-700") as Color,
    gradientColor3: (params.get("gradientColor3") ?? "pink-500") as Color,
    ogImageColor1: (params.get("ogImageColor1") ?? "fuchsia-400") as Color,
    ogImageColor2: (params.get("ogImageColor2") ?? "purple-700") as Color,
    packageDescription:
      params.get("packageDescription") ?? "short package description",
    packageName: params.get("packageName") ?? "package-name"
  };

  const {
    gradientColor1,
    gradientColor2,
    gradientColor3,
    packageDescription,
    packageName
  } = state;

  const packageDescriptionDeferred = useDeferredValue(packageDescription);
  const packageNameDeferred = useDeferredValue(packageName);

  return (
    <div
      className="h-screen flex flex-col gap-2 py-2 items-center"
      style={
        {
          "--color-background-gradient-1": `${colors[gradientColor1]}`,
          "--color-background-gradient-2": `${colors[gradientColor2]}`,
          "--color-background-gradient-3": `${colors[gradientColor3]}`
        } as CSSProperties
      }
    >
      <div className="flex flex-row items-center gap-4 p-2">
        <ColorPicker
          color={gradientColor1}
          onChange={(color) => setParams({ ...state, gradientColor1: color })}
        />
        <ColorPicker
          color={gradientColor2}
          onChange={(color) => setParams({ ...state, gradientColor2: color })}
        />
        <ColorPicker
          color={gradientColor3}
          onChange={(color) => setParams({ ...state, gradientColor3: color })}
        />
        <div className="w-1 h-8 bg-white/20 rounded" />
        <Input
          onChange={(event) =>
            setParams({ ...state, packageName: event.currentTarget.value })
          }
          placeholder="package name"
          title="package name"
          value={packageName}
        />
        <Input
          onChange={(event) =>
            setParams({
              ...state,
              packageDescription: event.currentTarget.value
            })
          }
          placeholder="package description"
          title="package description"
          value={packageDescription}
        />
      </div>
      <div className="w-full grow-1 min-h-30" data-background-gradient>
        <div className="w-full h-full max-w-350 mx-auto flex flex-col gap-2 pt-2 justify-end px-2">
          <div className="flex flex-row gap-2 items-center">
            <div className="text-xl text-white text-shadow-black/80 text-shadow-xs font-bold">
              {packageName}
            </div>
            <div className="text-black text-shadow-white/50 text-shadow-xs">
              {packageDescription}
            </div>
          </div>
          <div className="w-full bg-black/80 rounded-t-lg grow-1 p-4">
            <pre className="text-center text-xs whitespace-pre-wrap">{`--color-background-gradient-1: var(--color-${gradientColor1}); --color-background-gradient-2: var(--color-${gradientColor2}); --color-background-gradient-3: var(--color-${gradientColor3});`}</pre>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 p-2 items-center">
        <OgImageGradient
          packageDescription={packageDescriptionDeferred}
          packageName={packageNameDeferred}
        />
        <OgImageFlatWithLogo
          packageDescription={packageDescriptionDeferred}
          packageName={packageNameDeferred}
        />
      </div>
    </div>
  );
}
