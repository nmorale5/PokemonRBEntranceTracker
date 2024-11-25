import "./Map.css";
import "./Items.css";
import LogicState from "../Backend/LogicState";
import { CITIES } from "../Backend/Requirements";
import { useEffect, useState } from "react";
import itemIcons from "../PokemonData/ItemIcons.json";

const Items = () => {
  const [currentState, setCurrentState] = useState(LogicState.currentState.value);

  useEffect(() => {
    const subscription = LogicState.currentState.subscribe(state => setCurrentState(state));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="Items">
      <label htmlFor="free-fly">Free Fly Location: </label>
      <select
        id="free-fly"
        name="free-fly"
        value={currentState.freeFly}
        onChange={() => {
          const newState = LogicState.currentState.value.clone();
          newState.freeFly = (document.getElementById("free-fly") as HTMLSelectElement).value;
          newState.updateRegionAccessibility();
          LogicState.currentState.next(newState);
        }}
      >
        {CITIES.map((city, i) => (
          <option key={i} value={city}>
            {city}
          </option>
        ))}
      </select>
      {Object.entries(itemIcons).map(([itemName, imgLocation]) => (
        <img
          key={itemName}
          src={`/items/${imgLocation}.png`}
          alt={itemName}
          onClick={() => {
            const state = LogicState.currentState.value;
            LogicState.currentState.next(state.withItemStatus(itemName, !state.items.has(itemName)));
          }}
          style={{
            width: "48px",
            height: "48px",
            filter: currentState.items.has(itemName) ? "none" : "grayscale(100%)",
          }}
        />
      ))}
    </div>
  );
};

export default Items;
