import { cn } from "react-lib-tools";
import { colors, type Color } from "./colors";

export function ColorSwatch({
  color,
  isSelected,
  onSelect
}: {
  color: Color;
  isSelected?: boolean;
  onSelect?: (color: Color) => void;
}) {
  return (
    <div
      className={cn("w-4 h-4 rounded-xs", {
        "cursor-pointer": !!onSelect,
        "outline outline-2 outline-offset-2 outline outline-sky-400": isSelected
      })}
      onClick={() => onSelect?.(color)}
      style={{
        backgroundColor: colors[color]
      }}
      title={color}
    ></div>
  );
}
