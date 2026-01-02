import { useMemo, useRef, useState } from "react";
import { Input } from "../Input";
import { Tooltip } from "../Tooltip";
import { ColorSwatch } from "./ColorSwatch";
import { colors, type Color } from "./colors";

const colorsUnfiltered = Object.keys(colors).filter((current) =>
  current.includes("-")
);

export function ColorPicker({
  color,
  onChange
}: {
  onChange: (color: Color) => void;
  color: Color;
}) {
  const [filterText, setFilterText] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const colorsFiltered = useMemo(
    () =>
      filterText
        ? colorsUnfiltered.filter((current) => current.includes(filterText))
        : colorsUnfiltered,
    [filterText]
  );

  return (
    <Tooltip
      className="p-1 bg-black/80"
      content={
        <div className="w-54 flex flex-wrap gap-1">
          {colorsFiltered.map((current) => (
            <ColorSwatch
              color={current as Color}
              key={current}
              isSelected={color === current}
              onSelect={(nextColor) => {
                onChange(nextColor);

                inputRef.current?.focus();
              }}
            />
          ))}
        </div>
      }
      showOnFocus
      showOnHover={false}
    >
      <div className="flex flex-row gap-2 items-center">
        <ColorSwatch color={color} />
        <Input
          inputRef={inputRef}
          onChange={(event) => {
            setFilterText(event.currentTarget.value);
          }}
          placeholder="Filter"
          value={filterText}
        />
      </div>
    </Tooltip>
  );
}
