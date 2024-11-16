import { Warp } from "../Backend/Warps";
import LogicState from "../Backend/LogicState";

export default class WarpClickHandler {
  public static selectedWarp: Warp | null = null;

  public static handleClick(warp: Warp): void {
    const state = LogicState.currentState.value;
    warp = state.warps.find(w => w.equals(warp))!;
    if (this.selectedWarp) {
      if (this.selectedWarp.equals(warp)) {
        LogicState.currentState.next(state.removeWarp(warp));
      } else {
        LogicState.currentState.next(state.setWarp(this.selectedWarp, warp));
      }
      this.selectedWarp = null;
    } else {
      this.selectedWarp = warp;
    }
  }
}
