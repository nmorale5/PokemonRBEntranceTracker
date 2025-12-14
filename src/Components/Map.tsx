import React, { useState } from "react";
import "./Map.css";
import { latLngFromPixelCoordinates } from "../util";
import L from "leaflet";
import { CheckAccessibility } from "../Backend/Checks";
import { Warp, WarpAccessibility } from "../Backend/Warps";
import { ImageOverlay, MapContainer, Marker, Tooltip } from "react-leaflet";
import { getCheckIcon, getWarpIcon } from "./Icons";
import WarpClickHandler from "./WarpClickHandler";
import LogicState from "../Backend/LogicState";
import TrackedState from "../Backend/TrackedState";

const Map = (props: {}) => {
  const [selectedWarp, setSelectedWarp] = useState<Warp | null>(null);

  return (
    <>
      <MapContainer zoom={10} center={latLngFromPixelCoordinates(3600, 3600)} style={{ height: "100vh", width: "100vw" }}>
        <ImageOverlay url={"/PokemonRedMapNoArrows.png"} bounds={L.latLngBounds(latLngFromPixelCoordinates(0, 0), latLngFromPixelCoordinates(7200, 7200))}></ImageOverlay>
        {TrackedState.state.checks
          .filter(check => check.coordinates !== null)
          .filter(check => check.enabled)
          .map((check, i) => (
            <Marker
              key={i}
              position={latLngFromPixelCoordinates(check.coordinates!.x, check.coordinates!.y)}
              icon={getCheckIcon(
                check.acquired ? "gray" : check.accessibility === CheckAccessibility.Accessible ? "lawngreen" : check.accessibility === CheckAccessibility.Inaccessible ? "red" : "yellow"
              )}
            >
              <Tooltip>{check.name}</Tooltip>
            </Marker>
          ))}
        {TrackedState.state.warps
          .filter(warp => warp.coordinates !== null) // all warps should be non-null anyway, this is just for completeness
          .map((warp, i) => (
            <Marker
              key={i}
              position={latLngFromPixelCoordinates(warp.coordinates!.x, warp.coordinates!.y)}
              icon={getWarpIcon(
                warp.linkedWarp !== null ? "saddlebrown" : warp.accessibility === WarpAccessibility.Accessible ? "lawngreen" : warp.accessibility === WarpAccessibility.Inaccessible ? "red" : "gray",
                selectedWarp?.equals(warp) ?? false
              )}
              eventHandlers={{
                click: () => {
                  WarpClickHandler.handleClick(warp);
                  setSelectedWarp(WarpClickHandler.selectedWarp);
                },
              }}
            >
              <Tooltip>{`${warp.toString()} → ${warp.linkedWarp?.toString() ?? "(not yet linked)"}`}</Tooltip>
            </Marker>
          ))}
        {/*<MapClickDebug />*/}
      </MapContainer>
    </>
  );
};

export default Map;
