import { useMemo } from "react";
import { colors } from "../colors/colors";
import { height, width } from "./constants";

const FONT_FAMILY = "system-ui";
const MAX_FONT_SIZE = 165;
const LINE_HEIGHT = 1.03;

// Logo is centered within a square box on the left
const LOGO_CENTER_X = 275;
const LOGO_SIZE = 440;

// Text fills the region to the right of the logo
const TEXT_X = 535;
const TEXT_MAX_WIDTH = width - TEXT_X - 50;
const TEXT_MAX_HEIGHT = height - 120;

export function GeneratedOgImage({
  gradientColor1,
  gradientColor2,
  logoSvg,
  packageName
}: {
  gradientColor1: string;
  gradientColor2: string;
  logoSvg: string;
  packageName: string;
}) {
  const logoMarkup = useMemo(
    () => (logoSvg.trim() ? prepareLogoSvg(logoSvg) : null),
    [logoSvg]
  );

  const lines = useMemo(
    () => packageName.split(/\r?\n/).filter((line) => line.trim() !== ""),
    [packageName]
  );

  const fontSize = useMemo(() => getFontSize(lines), [lines]);
  const lineHeight = fontSize * LINE_HEIGHT;
  const firstLineY = height / 2 - (lineHeight * (lines.length - 1)) / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width / 2}
      height={height / 2}
      xmlns="http://www.w3.org/2000/svg"
    >
      <linearGradient id="generated-og-image-bg">
        <stop offset="0%" stopColor={gradientColor1} />
        <stop offset="100%" stopColor={gradientColor2} />
      </linearGradient>

      <rect
        fill="url('#generated-og-image-bg')"
        width={width}
        height={height}
      />

      {logoMarkup === null ? (
        <DefaultLogo />
      ) : logoMarkup === INVALID ? (
        <text
          x={LOGO_CENTER_X}
          y={height / 2}
          fill={colors.black}
          fontFamily={FONT_FAMILY}
          fontSize={40}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          Invalid SVG
        </text>
      ) : (
        <g dangerouslySetInnerHTML={{ __html: logoMarkup }} />
      )}

      <g
        fill={colors.white}
        fontFamily={FONT_FAMILY}
        fontSize={fontSize}
        fontWeight="bold"
      >
        {lines.map((line, index) => (
          <text
            dominantBaseline="middle"
            key={index}
            x={TEXT_X}
            y={firstLineY + index * lineHeight}
          >
            {line}
          </text>
        ))}
      </g>
    </svg>
  );
}

function DefaultLogo() {
  const cy = height / 2;

  return (
    <g>
      <circle cx={LOGO_CENTER_X} cy={cy} r="60" fill={colors.black} />
      {[45, -45].map((angle) => (
        <ellipse
          key={angle}
          cx={LOGO_CENTER_X}
          cy={cy}
          rx="220"
          ry="100"
          stroke={colors.black}
          strokeWidth="40"
          fill="none"
          transform={`rotate(${angle}, ${LOGO_CENTER_X}, ${cy})`}
        />
      ))}
    </g>
  );
}

let measureContext: CanvasRenderingContext2D | null = null;

function getFontSize(lines: string[]): number {
  if (lines.length === 0) {
    return MAX_FONT_SIZE;
  }

  measureContext ??= document.createElement("canvas").getContext("2d");

  let fontSize = Math.min(
    MAX_FONT_SIZE,
    TEXT_MAX_HEIGHT / (lines.length * LINE_HEIGHT)
  );

  if (measureContext) {
    const context = measureContext;
    context.font = `bold ${fontSize}px ${FONT_FAMILY}`;
    const maxLineWidth = Math.max(
      ...lines.map((line) => context.measureText(line).width)
    );
    if (maxLineWidth > TEXT_MAX_WIDTH) {
      fontSize *= TEXT_MAX_WIDTH / maxLineWidth;
    }
  }

  return Math.floor(fontSize);
}

const INVALID = Symbol("invalid");

// Parses the pasted SVG and repositions it (as a nested <svg>)
// so that it's scaled to fit within the logo box
function prepareLogoSvg(text: string): string | typeof INVALID {
  const parsed = new DOMParser().parseFromString(text.trim(), "image/svg+xml");
  const root = parsed.documentElement;

  if (
    parsed.querySelector("parsererror") ||
    root.tagName.toLowerCase() !== "svg"
  ) {
    return INVALID;
  }

  // Strip anything that could execute code
  parsed.querySelectorAll("script, foreignObject").forEach((node) => {
    node.remove();
  });
  for (const element of [root, ...Array.from(root.querySelectorAll("*"))]) {
    for (const attribute of Array.from(element.attributes)) {
      if (attribute.name.toLowerCase().startsWith("on")) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  // A viewBox is required for the logo to scale
  if (!root.hasAttribute("viewBox")) {
    const originalWidth = parseFloat(root.getAttribute("width") ?? "");
    const originalHeight = parseFloat(root.getAttribute("height") ?? "");
    if (originalWidth > 0 && originalHeight > 0) {
      root.setAttribute("viewBox", `0 0 ${originalWidth} ${originalHeight}`);
    }
  }

  root.setAttribute("x", `${LOGO_CENTER_X - LOGO_SIZE / 2}`);
  root.setAttribute("y", `${(height - LOGO_SIZE) / 2}`);
  root.setAttribute("width", `${LOGO_SIZE}`);
  root.setAttribute("height", `${LOGO_SIZE}`);
  root.setAttribute("preserveAspectRatio", "xMidYMid meet");
  root.setAttribute("overflow", "visible");
  root.removeAttribute("style");

  return new XMLSerializer().serializeToString(root);
}
