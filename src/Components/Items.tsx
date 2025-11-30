import "./Map.css";
import "./Items.css";
import LogicState from "../Backend/LogicState";
// import { CITIES } from "../Backend/Requirements";
import itemIcons from "../PokemonData/ItemIcons.json";

const Items = (props: { currentState: LogicState }) => {
  return (
    <div className="Items">
      {/* <label htmlFor="free-fly">Free Fly Location: </label>
      <select
        id="free-fly"
        name="free-fly"
        value="TODO - Noah can you get rid of this?"
        value={props.currentState.freeFly}
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
      </select> */}
      {Object.entries(itemIcons).map(([itemName, imgLocation]) => (
        <img
          key={itemName}
          src={`/items/${imgLocation}.png`}
          alt={itemName}
          onClick={() => {
            const state = LogicState.currentState.value;
            LogicState.currentState.next(state.withItemStatus(itemName, !state.items.has(itemName)));
          }}
          title={itemName}
          style={{
            width: "32px",
            height: "32px",
            filter: props.currentState.items.has(itemName) ? "none" : "grayscale(100%)",
          }}
        />
      ))}
    </div>
  );
};

export default Items;
