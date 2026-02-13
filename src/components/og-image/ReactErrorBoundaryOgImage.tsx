import { colors } from "../colors/colors";

export function ReactErrorBoundaryOgImage() {
  return (
    <svg
      viewBox="0 0 1200 630"
      width={600}
      height={315}
      xmlns="http://www.w3.org/2000/svg"
    >
      <linearGradient id="react-error-boundary-bg">
        <stop offset="0%" stopColor={colors["rose-500"]} />
        <stop offset="100%" stopColor={colors["rose-600"]} />
      </linearGradient>

      <rect fill="url('#react-error-boundary-bg')" width={1200} height={630} />

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
        fill={colors.white}
        fontSize={135}
        fontFamily="system-ui"
        fontWeight="bold"
        transform="translate(540, 165)"
      >
        <text alignmentBaseline="middle" dx={0} dy={0}>
          react
        </text>
        <text alignmentBaseline="middle" dx={0} dy={150}>
          error
        </text>
        <text alignmentBaseline="middle" dx={0} dy={300}>
          boundary
        </text>
      </g>
    </svg>
  );
}
