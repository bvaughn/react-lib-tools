import { colors } from "../colors/colors";

const config = {
  bgColor1: colors["emerald-400"],
  bgColor2: colors["indigo-500"],
  logoColor: colors.black,
  textColor: colors.white
};

export function ReactWindowOgImage() {
  return (
    <svg
      viewBox="0 0 1200 630"
      width={600}
      height={315}
      xmlns="http://www.w3.org/2000/svg"
    >
      <linearGradient id="react-window">
        <stop offset="0%" stopColor={config.bgColor1} />
        <stop offset="100%" stopColor={config.bgColor2} />
      </linearGradient>

      <rect fill="url('#react-window')" width={1200} height={630} />

      {/*
      <line x1="0" y1="315" x2="1200" y2="315" stroke="black" />
      */}

      <linearGradient id="react-window-logo">
        <stop offset="0%" stopColor="oklch(100% 0 255)" />
        <stop offset="100%" stopColor="oklch(75% 0 255)" />
      </linearGradient>

      <mask maskContentUnits="objectBoundingBox" id="react-window-mask">
        <rect width="1" height="1" fill="url('#react-window-logo')" />
      </mask>

      <g mask="url(#react-window-mask)">
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
        fill={config.textColor}
        fontSize={165}
        fontFamily="system-ui"
        fontWeight="bold"
        transform="translate(535, 240)"
      >
        <text alignmentBaseline="middle" dx={0} dy={0}>
          react
        </text>
        <text alignmentBaseline="middle" dx={0} dy={170}>
          window
        </text>
      </g>
    </svg>
  );
}
