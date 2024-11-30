import React, { useEffect, useState } from "react";
import Map from "./Components/Map";
import "./App.css";
import Login from "./Components/Login";
import Save from "./Components/Save";
import Items from "./Components/Items";
import Directions from "./Components/Directions";
import LogicState from "./Backend/LogicState";

export default function App() {
  const [currentState, setCurrentState] = useState(LogicState.currentState.value);

  useEffect(() => {
    const subscription = LogicState.currentState.subscribe(state => setCurrentState(state));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      <Login />
      <Items currentState={currentState} />
      <Save />
      <Map currentState={currentState}/>
      <Directions currentState={currentState} />
    </div>
  );
}
