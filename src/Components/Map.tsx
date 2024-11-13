import React, { useEffect } from "react";
import "./Map.css";
import { defaultState } from "../Backend/GenerateGraph";
import { latLngFromPixelCoordinates } from "../util";
import L, { DivIcon } from "leaflet";
import warpData from "../PokemonData/WarpData.json";
import checkData from "../PokemonData/CheckData.json";
import { CheckAccessibility } from "../Backend/Checks";
import { distinctUntilChanged, map, pairwise, Subscription, tap } from "rxjs";
import { WarpAccessibility } from "../Backend/Warps";

const Map = (props: {}) => {
  useEffect(() => {
    const unsubscribeArray: Subscription[] = [];
    const myMap = L.map("map").setView(latLngFromPixelCoordinates(3600, 3600));
    const latLngBounds = L.latLngBounds(latLngFromPixelCoordinates(0, 0), latLngFromPixelCoordinates(7200, 7200));
    L.imageOverlay("/PokemonRedMapNoArrows.png", latLngBounds, {
      alt: "Pokemon Red/Blue Map",
      interactive: true,
    }).addTo(myMap);

    myMap.fitBounds(latLngBounds);
    const currentState = defaultState.asObservable();

    Object.entries(warpData)
      .flatMap(([key, value]) => value)
      .forEach((warp, i) => {
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
        L.marker(latLngFromPixelCoordinates(warp.coordinates.x, warp.coordinates.y), {
          title: `${warp.from} to ${warp.to}`,
          icon: icon,
        }).addTo(myMap);
        unsubscribeArray.push(
          currentState
            .pipe(
              map(state => state.warps.find(w => w.fromWarp === warp.from && w.toWarp === warp.to)!)
              // distinctUntilChanged((prevWarp, curWarp) => prevWarp.accessibility === curWarp.accessibility)
            )
            .subscribe(warp => {
              document.getElementById(warpId)!.style.backgroundColor =
                warp.accessibility === WarpAccessibility.Accessible ? "lawngreen" : warp.accessibility === WarpAccessibility.Inaccessible ? "red" : "gray";
            })
        );
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
      unsubscribeArray.push(
        currentState
          .pipe(
            map(state => state.checks.find(c => c.name === check.name && c.region === check.region)!)
            // distinctUntilChanged((prevCheck, curCheck) => prevCheck.enabled === curCheck.enabled && prevCheck.acquired === curCheck.acquired && prevCheck.accessibility === curCheck.accessibility)
          )
          .subscribe(check => {
            document.getElementById(checkId)!.style.backgroundColor = check.acquired
              ? "gray"
              : check.accessibility === CheckAccessibility.Accessible
                ? "lawngreen"
                : check.accessibility === CheckAccessibility.Inaccessible
                  ? "red"
                  : "yellow";
          })
      );
    });

    // function findClosestCoordinate(
    //   coordinates: [number, number][],
    //   c: [number, number]
    // ): [number, number] {
    //   return coordinates.reduce((closest, current) => {
    //     const distance = Math.sqrt(
    //       Math.pow(current[0] - c[0], 2) + Math.pow(current[1] - c[1], 2)
    //     );
    //     const closestDistance = Math.sqrt(
    //       Math.pow(closest[0] - c[0], 2) + Math.pow(closest[1] - c[1], 2)
    //     );
    //
    //     return distance < closestDistance ? current : closest;
    //   });
    // }

    // myMap.on("click", async function(e) {
    //   const [x, y] = pixelCoordinatesFromLatLng(e.latlng);
    //   const [newX, newY] = findClosestCoordinate(warpData.map(warp => warp.from)
    //     .concat(warpData.map(warp => warp.to))
    //     .map(({x, y}) => [x, y]), [x, y])
    //   await navigator.clipboard.writeText(`,\n      "coordinates": {\n        "x": ${newX},\n        "y": ${newY}\n      }`);
    // });

    // myMap.on("click", async function(e) {
    //   const [x, y] = pixelCoordinatesFromLatLng(e.latlng).map(
    //     (num) => Math.round((num + 8) / 16) * 16 - 8,
    //   );
    //   await navigator.clipboard.writeText(`,\n      "coordinates": {\n        "x": ${x},\n        "y": ${y}\n      }`);
    // });

    return () => {
      myMap.remove();
      unsubscribeArray.forEach(sub => sub.unsubscribe());
    };
  }, []);

  return (
    <>
      <div id="map"></div>
    </>
  );
};

export default Map;
