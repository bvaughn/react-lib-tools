import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { cn } from "react-lib-tools";
import { ColorSwatch } from "./ColorSwatch";
import { colorKeys, colorStops, type Color } from "./colors";

export function ColorPicker({
  color,
  onChange,
  title = "Color"
}: {
  onChange: (color: Color) => void;
  color: Color;
  title?: string;
}) {
  return (
    <Menu>
      <MenuButton
        className={cn(
          "w-35 rounded-md bg-white/5 px-2 py-1 text-sm text-white",
          "cursor-pointer hover:bg-white/10",
          "flex flex-row gap-2 items-center"
        )}
        tabIndex={0}
        title={title}
      >
        <ColorSwatch color={color} />
        <div>{color}</div>
      </MenuButton>
      <MenuItems
        anchor="bottom"
        className="p-1 bg-black/90 flex flex-row gap-1"
      >
        <div className="flex flex-col gap-1">
          <MenuItem
            as={ColorSwatch}
            color="white"
            isDark={false}
            isSelected={color === "white"}
            onSelect={onChange}
          />
          <MenuItem
            as={ColorSwatch}
            color="black"
            isDark={true}
            isSelected={color === "black"}
            onSelect={onChange}
          />
        </div>
        {colorKeys.map((colorKey) => (
          <div className="flex flex-col gap-1" key={colorKey}>
            {colorStops.map((colorStop) => {
              const current = `${colorKey}-${colorStop}`;
              return (
                <MenuItem
                  as={ColorSwatch}
                  color={current as Color}
                  key={current}
                  isDark={colorStop > 500}
                  isSelected={color === current}
                  onSelect={onChange}
                />
              );
            })}
          </div>
        ))}
      </MenuItems>
    </Menu>
  );
}
