import { DivIcon } from "leaflet";

export const getCheckIcon = (color: string) => {
  return new DivIcon({
    className: "Check",
    html: `<div style="
      width: 16px;
      height: 16px;
      border: 2px solid black;
      background-color: ${color}
    " />`,
  });
};

export const getWarpIcon = (color: string, selected = false) => {
  const thickness = selected ? 5 : 2;
  return new DivIcon({
    className: "Warp",
    html: `<div style="
            width: 20px;
            height: 20px;
            background-color: ${color};
            border-left: ${thickness}px solid black;
            border-right: ${thickness}px solid black;
            border-top: ${thickness}px solid black;
            border-bottom: ${thickness}px solid black;
            transform: rotate(45deg);
            box-sizing: border-box;
          " />`,
  });
};
