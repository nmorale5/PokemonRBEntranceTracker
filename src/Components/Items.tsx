import "./Map.css";
import "./Items.css";
import LogicState from "../Backend/LogicState";
import { CITIES } from "../Backend/Requirements";
import { useEffect, useState } from "react";

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
          <option key={i} value={city}>{city}</option>
        ))}
      </select>
      {["Fuji Saved", "Silph Co Liberated"].map(name => (
        <button
          key={name}
          onClick={async () => {
            LogicState.currentState.next(LogicState.currentState.value.withItemStatus(name, !LogicState.currentState.value.items.has(name)));
          }}
          color="gray"
        >
          {`${name}`}
        </button>
      ))}
    </div>
  );
};

export default Items;
