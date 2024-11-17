import React from "react";
import Map from "./Components/Map";
import "./App.css";
import Login from "./Components/Login";
import Save from "./Components/Save";

export default function App() {
  return (
    <div className="App">
      <Login />
      <Save />
      <Map />
    </div>
  );
}
