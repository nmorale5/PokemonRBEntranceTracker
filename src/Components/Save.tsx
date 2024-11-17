import LogicState from "../Backend/LogicState";
import "./Save.css";

const SaveData = {
  settings: LogicState.currentState.value.settings,
  items: new Array<string>(),
  warps: LogicState.currentState.value.warps.map(warp =>
    warp.linkedWarp === null
      ? null
      : {
          toWarp: warp.linkedWarp.toWarp,
          fromWarp: warp.linkedWarp.fromWarp,
        }
  ),
  checks: LogicState.currentState.value.checks.map(check => check.acquired),
};

const Save = () => {
  const deserializeState = (saveData: string): LogicState => {
    const deserialized = JSON.parse(saveData) as typeof SaveData;
    const newState = new LogicState(deserialized.settings);
    newState.items = new Set(deserialized.items);
    newState.checks.forEach((check, i) => (check.acquired = deserialized.checks[i]));
    newState.warps.forEach(
      (warp, i) => (warp.linkedWarp = deserialized.warps[i] === null ? null : newState.warps.find(w => w.toWarp === deserialized.warps[i]!.toWarp && w.fromWarp === deserialized.warps[i]!.fromWarp)!)
    );
    newState.updateRegionAccessibility();
    return newState;
  };

  const serializeState = (state: LogicState): string => {
    const items = new Array<string>();
    state.items.forEach(item => items.push(item));
    return JSON.stringify({
      settings: state.settings,
      items,
      warps: state.warps.map(warp =>
        warp.linkedWarp === null
          ? null
          : {
              toWarp: warp.linkedWarp.toWarp,
              fromWarp: warp.linkedWarp.fromWarp,
            }
      ),
      checks: state.checks.map(check => check.acquired),
    });
  };

  const loadSave = () => {
    const saveData = window.localStorage.getItem("save");
    if (!saveData) {
      console.log("did not find save data");
      return;
    }
    LogicState.currentState.next(deserializeState(saveData));
  };

  const writeSave = () => {
    window.localStorage.setItem("save", serializeState(LogicState.currentState.value));
  };

  // useEffect(() => {
  //   // save state every time it updates
  //   const subscription = LogicState.currentState.pipe(map(state => serializeState(state))).subscribe(saveData => window.localStorage.setItem("save", saveData));
  //   return () => subscription.unsubscribe();
  // }, []);

  return (
    <div className="Save">
      <input id="free-fly" type="text" />
      <button
        onClick={() => {
          LogicState.freeFly = (document.getElementById("free-fly") as HTMLInputElement).value;
        }}
      >
        Set Free Fly
      </button>
      <button onClick={writeSave}>Write Save</button>
      <button onClick={loadSave}>Load Save</button>
    </div>
  );
};

export default Save;
