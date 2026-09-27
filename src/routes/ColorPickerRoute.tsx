import { type CSSProperties, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ColorPicker } from "../components/colors/ColorPicker";
import { colors, type Color } from "../components/colors/colors";
import { Input } from "../components/Input";
import { DownloadableSvg } from "../components/og-image/DownloadableSvg";
import { GeneratedOgImage } from "../components/og-image/GeneratedOgImage";
import { Textarea } from "../components/Textarea";

export default function ColorPickerRoute() {
  const [params, setParams] = useSearchParams();

  // Kept in local state (not the URL) since SVG markup can be large
  const [ogLogoSvg, setOgLogoSvg] = useState("");

  const state = {
    gradientColor1: (params.get("gradientColor1") ?? "fuchsia-400") as Color,
    gradientColor2: (params.get("gradientColor2") ?? "purple-700") as Color,
    gradientColor3: (params.get("gradientColor3") ?? "pink-500") as Color,
    ogGradientColor1: (params.get("ogGradientColor1") ??
      "emerald-400") as Color,
    ogGradientColor2: (params.get("ogGradientColor2") ?? "indigo-500") as Color,
    ogPackageName: params.get("ogPackageName") ?? "package\nname",
    packageDescription:
      params.get("packageDescription") ?? "short package description",
    packageName: params.get("packageName") ?? "package-name"
  };

  const {
    gradientColor1,
    gradientColor2,
    gradientColor3,
    ogGradientColor1,
    ogGradientColor2,
    ogPackageName,
    packageDescription,
    packageName
  } = state;

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
      <div className="flex flex-row items-start gap-4 p-2">
        <ColorPicker
          color={ogGradientColor1}
          onChange={(color) => setParams({ ...state, ogGradientColor1: color })}
          title="OG image gradient color 1"
        />
        <ColorPicker
          color={ogGradientColor2}
          onChange={(color) => setParams({ ...state, ogGradientColor2: color })}
          title="OG image gradient color 2"
        />
        <div className="w-1 h-8 bg-white/20 rounded" />
        <Textarea
          className="w-40"
          onChange={(event) =>
            setParams({ ...state, ogPackageName: event.currentTarget.value })
          }
          placeholder="package name"
          rows={Math.max(2, ogPackageName.split("\n").length)}
          title="OG image package name (newlines allowed)"
          value={ogPackageName}
        />
        <Textarea
          className="w-80 font-mono text-xs"
          onChange={(event) => setOgLogoSvg(event.currentTarget.value)}
          placeholder="paste logo SVG"
          rows={4}
          title="OG image logo SVG"
          value={ogLogoSvg}
        />
      </div>
      <div className="p-2">
        <DownloadableSvg>
          <GeneratedOgImage
            gradientColor1={colors[ogGradientColor1]}
            gradientColor2={colors[ogGradientColor2]}
            logoSvg={ogLogoSvg}
            packageName={ogPackageName}
          />
        </DownloadableSvg>
      </div>
    </div>
  );
}
