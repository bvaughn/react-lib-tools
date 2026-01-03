import { CheckIcon } from "@heroicons/react/20/solid";
import type { HTMLAttributes } from "react";
import { cn } from "react-lib-tools";
import { colors, type Color } from "./colors";

export function ColorSwatch({
  className,
  color,
  isDark,
  isSelected,
  onSelect,
  ...rest
}: Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> & {
  className?: string;
  color: Color;
  isDark?: boolean;
  isSelected?: boolean;
  onSelect?: (color: Color) => void;
}) {
  return (
    <div
      className={cn(
        "w-4 h-4 rounded-xs",
        "data-focus:outline data-focus:outline-offset-1",
        {
          "cursor-pointer": !!onSelect,
          "outline outline-offset-1": isSelected
        },
        className
      )}
      onClickCapture={() => {
        console.log("onClickCapture:", color);
        onSelect?.(color);
        event?.preventDefault();
      }}
      style={{
        backgroundColor: colors[color]
      }}
      title={color}
      {...rest}
    >
      {isSelected && (
        <CheckIcon
          className={cn("w-4 h-4", {
            "fill-black": !isDark,
            "fill-white": isDark
          })}
        />
      )}
    </div>
  );
}
