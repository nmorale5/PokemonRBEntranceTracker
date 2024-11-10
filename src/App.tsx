import React, { useRef } from "react";
import Map from "./Components/Map";
import "./App.css";
import { BehaviorSubject } from "rxjs";

export default function App() {
  const stateUpdatedRef = useRef(new BehaviorSubject<void>(undefined));

  stateUpdatedRef.current.next(undefined);

  return (
    <div className="App">
      <Map ref={stateUpdatedRef} />
    </div>
  );
}
