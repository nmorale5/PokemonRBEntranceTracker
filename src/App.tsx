import React, { useEffect, useState } from "react";
import "./App.css";
import Home from "./Components/Home";
import { JSONRecord } from "archipelago.js";
import { ArchipelagoClient } from "./Backend/Archipelago";
import LogicState from "./Backend/LogicState";
import Tracker from "./Components/Tracker";
import TrackedState from "./Backend/TrackedState";
import { SaveHandler } from "./Components/SaveHandler";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [, setStateVersion] = useState(0);

  // get React to trigger re-renders whenever state updates
  useEffect(() => {
    const sub = TrackedState.updates.subscribe(_ => setStateVersion(v => ++v));
    return () => sub.unsubscribe();
  }, []);

  const onLoggedIn = (slotData: JSONRecord, savedWarps: any) => {
    const logicState = new LogicState(slotData, savedWarps);
    ArchipelagoClient.instance.syncLogicState(logicState);
    SaveHandler.instance.autosave(logicState, ArchipelagoClient.instance.credentials!);
    TrackedState.state = logicState;
    setConnected(true);
  };

  const onLoggedOut = () => {
    setConnected(false);
  };

  return <div className="App">{connected ? <Tracker onLoggedOut={onLoggedOut} /> : <Home onLoggedIn={onLoggedIn} />}</div>;
}
