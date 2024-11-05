import React, { useEffect } from "react";
import "./Map.css";
import L from "leaflet";
import { latLngFromPixelCoordinates } from "./util";
import warpData from "./PokemonData/warps.json";

export default function Map() {
  useEffect(() => {
    const map = L.map("map").setView(latLngFromPixelCoordinates(3600, 3600));
    const latLngBounds = L.latLngBounds(
      latLngFromPixelCoordinates(0, 0),
      latLngFromPixelCoordinates(7200, 7200)
    );

    L.imageOverlay("/PokemonRedMapNoArrows.png", latLngBounds, {
      alt: "Pokemon Red/Blue Map",
      interactive: true,
    }).addTo(map);

    map.fitBounds(latLngBounds);

    interface Entrance {
      x: number;
      y: number;
      region: string;
    }

    const warps = warpData as { from: Entrance; to: Entrance }[];
    warps.forEach((warp) => {
      L.marker(latLngFromPixelCoordinates(warp.from.x, warp.from.y), {
        title: `${warp.from.region} to ${warp.to.region}`,
      }).addTo(map);
      L.marker(latLngFromPixelCoordinates(warp.to.x, warp.to.y), {
        title: `${warp.to.region} to ${warp.from.region}`,
      }).addTo(map);
    });

    return () => {
      map.remove();
    };
  }, []);

  return <div id="map"></div>;
}
