import "./Map.css";
import { Session, urlFromPort } from "../Backend/Archipelago";
import "./Items.css";
import LogicState from "../Backend/LogicState";
import { useState } from "react";

// const PORT = "55459";
// const PLAYER = "Halaffa";

let ongoingSession: Session;

const Items = () => {
  return (
    <div className="Items">
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
