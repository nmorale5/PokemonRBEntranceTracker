import { Warp } from "../Backend/Warps";
import { removeWarp, setWarp, State } from "../Backend/GenerateGraph";

export default class WarpClickHandler {
  public static selectedWarp: Warp | null = null;
  private static currentState: State | null = null;

  public static registerCurrentState(state: State) {
    this.currentState = state;
  }

  public static handleClick(warp: Warp): void {
    if (!this.currentState) {
      throw new Error("no state has been registered!");
    }
    warp = this.currentState.warps.find(w => w.equals(warp))!;
    if (this.selectedWarp) {
      if (this.selectedWarp.equals(warp)) {
        removeWarp(warp, this.currentState);
      } else {
        setWarp(this.selectedWarp, warp, this.currentState);
      }
      this.selectedWarp = null;
    } else {
      this.selectedWarp = warp;
    }
  }
}
