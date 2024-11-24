import "./Map.css";
import "./Items.css";
import LogicState from "../Backend/LogicState";
import { CITIES } from "../Backend/Requirements";

const Items = () => {
  return (
    <div className="Items">
      <label htmlFor="free-fly">Free Fly Location: </label>
      <select
        id="free-fly"
        name="free-fly"
        onChange={() => {
          const newState = LogicState.currentState.value.clone();
          newState.freeFly = (document.getElementById("free-fly") as HTMLSelectElement).value;
          newState.updateRegionAccessibility();
          LogicState.currentState.next(newState);
        }}
      >
        {CITIES.map(city => (
          <option value={city}>{city}</option>
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
