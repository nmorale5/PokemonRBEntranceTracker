import "./Directions.css";
import warpData from "../PokemonData/WarpData.json";
import fakeWarpData from "../PokemonData/FakeWarps.json";
import { useState } from "react";
import TrackedState from "../Backend/TrackedState";

const Directions = (props: {}) => {
  const [fromRegion, setFromRegion] = useState("");
  const [toRegion, setToRegion] = useState("");

  const regionList = Array.from(new Set(Object.keys(warpData).concat(Object.keys(fakeWarpData))));

  return (
    <div className="Directions">
      <label htmlFor="direction-from">From:</label>
      <input list="regions" id="direction-from" name="direction-from" onChange={() => setFromRegion((document.getElementById("direction-from") as HTMLInputElement).value)} />
      <br />
      <label htmlFor="direction-to">To:</label>
      <input list="regions" id="direction-to" name="direction-to" onChange={() => setToRegion((document.getElementById("direction-to") as HTMLInputElement).value)} />
      <datalist id="regions">
        {regionList.map(region => (
          <option value={region} key={region} />
        ))}
      </datalist>
      <ol>{regionList.includes(fromRegion) && regionList.includes(toRegion) && TrackedState.state.shortestPath(fromRegion, toRegion).map((warp, i) => <li key={i}>{warp.toString()}</li>)}</ol>
    </div>
  );
};

export default Directions;
