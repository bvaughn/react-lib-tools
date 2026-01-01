import { ColorSwatch } from "./ColorSwatch";
import { colors, type Color } from "./colors";

export function ColorPicker({
  color,
  onChange
}: {
  onChange: (color: Color) => void;
  color: string;
}) {
  return (
    <div className="max-w-54 flex flex-wrap gap-1">
      {Object.keys(colors)
        .filter((current) => current.includes("-"))
        .map((current) => (
          <ColorSwatch
            color={current as Color}
            key={current}
            isSelected={color === current}
            onSelect={onChange}
          />
        ))}
    </div>
  );
}
