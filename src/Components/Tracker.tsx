import React from "react";
import "./Tracker.css";
import Items from "./Items";
import Map from "./Map";
import Directions from "./Directions";

const Tracker = (props: { onLoggedOut: () => void }) => {
  return (
    <div className="Tracker">
      <Items />
      <Map />
      <Directions />
      {/*<button onClick={() => {*/}
      {/*  ArchipelagoClient.instance.logout();*/}
      {/*  props.onLoggedOut();*/}
      {/*}}>Home</button>*/}
    </div>
  );
}

export default Tracker;
