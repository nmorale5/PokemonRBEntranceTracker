import "./Map.css";
import "./Items.css";
import LogicState from "../Backend/LogicState";
import itemIcons from "../PokemonData/ItemIcons.json";
import TrackedState from "../Backend/TrackedState";

const Items = (props: {}) => {
  return (
    <div className="Items">
      {Object.entries(itemIcons).map(([itemName, imgLocation]) => (
        <img
          key={itemName}
          src={`/items/${imgLocation}.png`}
          alt={itemName}
          title={itemName}
          onClick={() => {
            TrackedState.state.addItems(itemName, TrackedState.state.items.has(itemName));
          }}
          style={{
            width: "32px",
            height: "32px",
            filter: TrackedState.state.items.has(itemName) ? "none" : "grayscale(100%)",
          }}
        />
      ))}
    </div>
  );
};

export default Items;
