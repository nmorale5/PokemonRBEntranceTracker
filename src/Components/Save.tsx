import LogicState from "../Backend/LogicState";
import "./Save.css";
import { useEffect, useState } from "react";
import { skip } from "rxjs";
import SaveHandler from "./SaveHandler";
import { defaultSettings } from "../Backend/Settings";

const Save = () => {
  const [saveName, setSaveName] = useState(SaveHandler.instance.saveEntries[SaveHandler.instance.saveEntries.length - 1].name);

  useEffect(() => {
    // every time the currentState updates, auto-save that to whatever the saveName is currently
    LogicState.currentState.next(SaveHandler.instance.getState(saveName)!);
    const subscription = LogicState.currentState.pipe(skip(1)).subscribe(state => SaveHandler.instance.setState(state, saveName));
    return () => subscription.unsubscribe();
  }, [saveName]);

  return (
    <div className="Save">
      <label htmlFor="save-name">Load Save:</label>
      <select id="save-name" name="save-name" onChange={() => setSaveName((document.getElementById("save-name") as HTMLSelectElement).value)}>
        {SaveHandler.instance.saveEntries.slice().reverse()
          .map(entry => entry.name)
          .map((name, i) => (
            <option key={i} value={name}>
              {name}
            </option>
          ))}
      </select>
      <button
        onClick={() => {
          const newState = new LogicState(defaultSettings);
          const newName = SaveHandler.instance.getAvailableName();
          SaveHandler.instance.setState(newState, newName);
          setSaveName(newName);
        }}
      >
        New Save
      </button>
    </div>
  );
};

export default Save;
