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

      <g>
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
