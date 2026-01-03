import { useMemo, useState } from "react";
import { ColorPicker } from "../colors/ColorPicker";
import { colors, type Color } from "../colors/colors";
import { Input } from "../Input";
import type { Config } from "./types";

export function OgImageFlatWithLogo({
  packageDescription,
  packageName
}: Config) {
  const [bgColor, setBgColor] = useState<Color>("fuchsia-400");
  const [logoColor, setLogoColor] = useState<Color>("black");
  const [textColor, setTextColor] = useState<Color>("white");
  const [fontSize, setFontSize] = useState(150);

  const config = useMemo(
    () => ({
      bgColor: colors[bgColor],
      fontSize,
      logoColor: colors[logoColor],
      packageDescription,
      packageName,
      textColor: colors[textColor]
    }),
    [bgColor, fontSize, logoColor, packageDescription, packageName, textColor]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <ColorPicker
          color={bgColor}
          onChange={setBgColor}
          title="Background color"
        />
        <ColorPicker
          color={textColor}
          onChange={setTextColor}
          title="Text color"
        />
        <ColorPicker
          color={logoColor}
          onChange={setLogoColor}
          title="Logo color"
        />
        <Input
          className="w-16"
          onChange={(event) => setFontSize(parseInt(event.currentTarget.value))}
          title="Font size"
          type="number"
          value={fontSize}
        />
      </div>
      <svg viewBox="0 0 1200 630" width={600} height={315}>
        <rect fill={config.bgColor} width={1200} height={630} />

        {/*<line x1="0" y1="315" x2="1200" y2="315" stroke="black" />*/}

        <g transform="translate(60,135)">
          <g transform="scale(18)">
            <circle cx="10" cy="10" r="3" fill={config.logoColor}></circle>
            <g stroke={config.logoColor} stroke-width="2" fill="none">
              <ellipse
                cx="10"
                cy="10"
                rx="11"
                ry="5"
                transform="rotate(45, 10, 10)"
              ></ellipse>
              <ellipse
                cx="10"
                cy="10"
                rx="11"
                ry="5"
                transform="rotate(-45, 10, 10)"
              ></ellipse>
            </g>
          </g>
        </g>

        <g
          fill={config.textColor}
          fontSize={config.fontSize}
          font-weight="bold"
          transform="translate(0, 157.5)"
        >
          <text alignmentBaseline="middle" dx={475} dy="0em">
            react
          </text>
          <text alignmentBaseline="middle" dx={475} dy="1em">
            resizable
          </text>
          <text alignmentBaseline="middle" dx={475} dy="2em">
            panels
          </text>
        </g>
      </svg>
    </div>
  );
}
