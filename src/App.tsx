import React from "react";
import Map from "./Components/Map";
import "./App.css";
import Login from "./Components/Login";
import Save from "./Components/Save";
import Items from "./Components/Items";

export default function App() {
  return (
    <div className="App">
      <Login />
      <Items />
      <Save />
      <Map />
    </div>
  );
}
