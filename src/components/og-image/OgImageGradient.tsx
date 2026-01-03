import { useMemo, useRef, useState } from "react";
import { ColorPicker } from "../colors/ColorPicker";
import { colors, type Color } from "../colors/colors";
import { OgImageCanvas } from "./OgImageCanvas";
import type { Config } from "./types";
import { drawGradient } from "./utils/drawGradient";

export function OgImageGradient({ packageDescription, packageName }: Config) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [color1, setColor1] = useState<Color>("fuchsia-400");
  const [color2, setColor2] = useState<Color>("purple-700");
  const [packageNameColor, setPackageNameColor] = useState<Color>("black");
  const [packageDescriptionColor, setPackageDescriptionColor] =
    useState<Color>("white");

  const drawConfig = useMemo(
    () => ({
      color1: colors[color1],
      color2: colors[color2],
      packageName,
      packageNameColor: colors[packageNameColor],
      packageDescription,
      packageDescriptionColor: colors[packageDescriptionColor]
    }),
    [
      color1,
      color2,
      packageName,
      packageNameColor,
      packageDescription,
      packageDescriptionColor
    ]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <ColorPicker
          color={color1}
          onChange={setColor1}
          title="Gradient color 1"
        />
        <ColorPicker
          color={color2}
          onChange={setColor2}
          title="Gradient color 2"
        />
        <ColorPicker
          color={packageNameColor}
          onChange={setPackageNameColor}
          title="Package name color"
        />
        <ColorPicker
          color={packageDescriptionColor}
          onChange={setPackageDescriptionColor}
          title="Package description color"
        />
      </div>
      <OgImageCanvas
        drawConfig={drawConfig}
        drawFunction={drawGradient}
        ref={canvasRef}
      />
    </div>
  );
}
