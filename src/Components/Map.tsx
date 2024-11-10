import React, { ForwardedRef, forwardRef, MutableRefObject, Ref, useEffect, useRef } from "react";
import "./Map.css";
import { defaultState, State } from "../Backend/GenerateGraph";
import { latLngFromPixelCoordinates, pixelCoordinatesFromLatLng } from "../util";
import L, { DivIcon } from "leaflet";
import warpData from "../PokemonData/warps.json";
import checkData from "../PokemonData/CheckData.json";
import { Check, CheckAccessibility } from "../Backend/Checks";
import { BehaviorSubject, distinctUntilChanged, map, Subscription } from "rxjs";

const Map = forwardRef<BehaviorSubject<void>>((props: {}, ref) => {
  const stateRef = useRef(defaultState);

  useEffect(() => {
    const unsubscribeArray: Subscription[] = [];
    const myMap = L.map("map").setView(latLngFromPixelCoordinates(3600, 3600));
    const latLngBounds = L.latLngBounds(
      latLngFromPixelCoordinates(0, 0),
      latLngFromPixelCoordinates(7200, 7200),
    );
    L.imageOverlay("/PokemonRedMapNoArrows.png", latLngBounds, {
      alt: "Pokemon Red/Blue Map",
      interactive: true,
    }).addTo(myMap);

    myMap.fitBounds(latLngBounds);

    warpData.forEach((warp, i) => {
      const warpId = `warp-${i}`;
      const icon = new DivIcon({
        className: "Warp",
        html: `<div id="${warpId}" style="
          width: 20px;
          height: 20px;
          background-color: red;
          border-left: 2px solid black;
          border-right: 2px solid black;
          border-top: 2px solid black;
          border-bottom: 2px solid black;
          transform: rotate(45deg);
          box-sizing: border-box;
        " />`,
      });
      L.marker(latLngFromPixelCoordinates(warp.from.x, warp.from.y), {
        title: `${warp.from.region} to ${warp.to.region}`,
        icon: icon,
      }).addTo(myMap);
      L.marker(latLngFromPixelCoordinates(warp.to.x, warp.to.y), {
        title: `${warp.to.region} to ${warp.from.region}`,
        icon: icon,
      }).addTo(myMap);
    });

    checkData.forEach((check, i) => {
      if (!check.coordinates) {
        return;
      }
      const checkId = `check-${i}`;
      const icon = new DivIcon({
        className: "Check",
        html: `<div id="${checkId}" style="
          width: 16px;
          height: 16px;
          border: 2px solid black
        " />`,
      });
      L.marker(latLngFromPixelCoordinates(check.coordinates.x, check.coordinates.y), {
        title: check.name,
        icon: icon,
      }).addTo(myMap);
      unsubscribeArray.push((ref! as MutableRefObject<BehaviorSubject<void>>).current.pipe(
        map(_ => stateRef.current),
        map(state => state.checks.find(c => c.name === check.name && c.region === check.region)!),
        distinctUntilChanged((prevCheck, curCheck) => prevCheck.enabled === curCheck.enabled && prevCheck.acquired === curCheck.acquired && prevCheck.accessibility === curCheck.accessibility),
      ).subscribe((check) => {
        document.getElementById(checkId)!.style.backgroundColor = check.acquired
          ? "gray"
          : check.accessibility === CheckAccessibility.Accessible
            ? "lawngreen"
            : check.accessibility === CheckAccessibility.Inaccessible
              ? "red"
              : "yellow";
      }));
    });

    myMap.on("click", async function(e) {
      const [x, y] = pixelCoordinatesFromLatLng(e.latlng).map(
        (num) => Math.round((num + 8) / 16) * 16 - 8,
      ); // get the center of the nearest 16x16 square
      await navigator.clipboard.writeText(`,\n    "coordinates": { "x": ${x}, "y": ${y} }`);
    });

    return () => {
      myMap.remove();
      unsubscribeArray.forEach(sub => sub.unsubscribe());
    };
  }, [ref]);

  return (
    <>
      <div id="map"></div>
    </>
  );
});

export default Map;
