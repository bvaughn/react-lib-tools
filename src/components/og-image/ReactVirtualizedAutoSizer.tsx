import { colors } from "../colors/colors";

export function ReactVirtualizedAutoSizerOgImage() {
  return (
    <svg
      viewBox="0 0 1200 630"
      width={600}
      height={315}
      xmlns="http://www.w3.org/2000/svg"
    >
      <linearGradient id="react-virtualized-auto-sizer-bg">
        <stop offset="0%" stop-color={colors["emerald-300"]} />
        <stop offset="100%" stop-color={colors["emerald-600"]} />
      </linearGradient>

      <rect
        fill="url('#react-virtualized-auto-sizer-bg')"
        width={1200}
        height={630}
      />

      {/*
      <line x1="0" y1="315" x2="1200" y2="315" stroke="black" />
       */}

      <linearGradient id="react-virtualized-auto-sizer-logo">
        <stop offset="0%" stop-color="oklch(100% 0 255)" />
        <stop offset="100%" stop-color="oklch(75% 0 255)" />
      </linearGradient>

      <mask
        maskContentUnits="objectBoundingBox"
        id="react-virtualized-auto-sizer-mask"
      >
        <rect
          width="1"
          height="1"
          fill="url('#react-virtualized-auto-sizer-logo')"
        />
      </mask>

      <g mask="url(#react-virtualized-auto-sizer-mask)">
        <circle cx="275" cy="315" r="60" fill={colors.black} />
        <ellipse
          cx="275"
          cy="315"
          rx="220"
          ry="100"
          stroke={colors.black}
          strokeWidth="40"
          fill="none"
          transform="rotate(45, 275, 315)"
        />
        <ellipse
          cx="275"
          cy="315"
          rx="220"
          ry="100"
          stroke={colors.black}
          strokeWidth="40"
          fill="none"
          transform="rotate(-45, 275, 315)"
        />
      </g>

      <g
        fill={colors.white}
        fontSize={125}
        fontFamily="system-ui"
        fontWeight="bold"
        transform="translate(540, 165)"
      >
        <text alignmentBaseline="middle" dx={0} dy={0}>
          react
        </text>
        <text alignmentBaseline="middle" dx={0} dy={150}>
          virtualized
        </text>
        <text
          dx={0}
          dy={325}
          fontFamily="monospace"
          fontSize={100}
          letterSpacing="-6"
        >
          <tspan fill={colors["emerald-300"]}>{"<"}</tspan>
          <tspan>AutoSizer</tspan>
          <tspan fill={colors["emerald-300"]}>{">"}</tspan>
        </text>
      </g>
    </svg>
  );
}
