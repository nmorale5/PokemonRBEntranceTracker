import React, { useEffect } from "react";
import "./Map.css";
import L from "leaflet";
import { latLngFromPixelCoordinates, pixelCoordinatesFromLatLng } from "./util";
import warpData from "./PokemonData/warps.json";
import checkData from "./PokemonData/CheckData.json";

export default function Map() {
  useEffect(() => {
    const map = L.map("map").setView(latLngFromPixelCoordinates(3600, 3600));
    const latLngBounds = L.latLngBounds(
      latLngFromPixelCoordinates(0, 0),
      latLngFromPixelCoordinates(7200, 7200),
    );
    L.imageOverlay("/PokemonRedMapNoArrows.png", latLngBounds, {
      alt: "Pokemon Red/Blue Map",
      interactive: true,
    }).addTo(map);

    map.fitBounds(latLngBounds);

    warpData.forEach((warp) => {
      L.marker(latLngFromPixelCoordinates(warp.from.x, warp.from.y), {
        title: `${warp.from.region} to ${warp.to.region}`,
      }).addTo(map);
      L.marker(latLngFromPixelCoordinates(warp.to.x, warp.to.y), {
        title: `${warp.to.region} to ${warp.from.region}`,
      }).addTo(map);
    });

    checkData.forEach((check) => {
      if (!check.coordinates) {
        return;
      }
      L.marker(latLngFromPixelCoordinates(check.coordinates.x, check.coordinates.y), {
        title: check.name,
      }).addTo(map);
    });

    map.on("click", async function(e) {
      const [x, y] = pixelCoordinatesFromLatLng(e.latlng).map(num => Math.round((num + 8) / 16) * 16 - 8); // get the center of the nearest 16x16 square
      await navigator.clipboard.writeText(`,\n    "coordinates": { "x": ${x}, "y": ${y} }`);
    });

    return () => {
      map.remove();
    };
  }, []);

  return <div id="map"></div>;
}
