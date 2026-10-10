import type { HTMLAttributes, ReactNode } from "react";

/**
 * Displays a short status label.
 *
 * ✅ Any other HTML attributes are passed through to the underlying `<span>`.
 *
 * ❌ Badges are not interactive; don't render buttons or links inside of them.
 */
export function Badge({
  children,
  className,
  intent = "neutral",
  ...rest
}: HTMLAttributes<HTMLSpanElement> & {
  /**
   * Text to display.
   */
  children: ReactNode;

  /**
   * Class name applied to the badge.
   */
  className?: string | undefined;

  /**
   * Controls the color of the badge.
   */
  intent?: "danger" | "neutral" | "success" | "warning" | undefined;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-sm font-medium ${INTENT_CLASS_NAMES[intent]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </span>
  );
}

const INTENT_CLASS_NAMES = {
  danger: "bg-red-900 text-red-200",
  neutral: "bg-slate-700 text-slate-200",
  success: "bg-green-900 text-green-200",
  warning: "bg-amber-900 text-amber-200"
};
