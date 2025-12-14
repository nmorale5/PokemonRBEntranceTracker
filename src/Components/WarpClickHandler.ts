import { Warp } from "../Backend/Warps";
import TrackedState from "../Backend/TrackedState";

export default class WarpClickHandler {
  public static selectedWarp: Warp | null = null;

  public static handleClick(warp: Warp): void {
    warp = TrackedState.state.warps.find(w => w.equals(warp))!;
    if (!this.selectedWarp) {
      this.selectedWarp = warp;
      return;
    }
    if (this.selectedWarp.equals(warp)) {
      TrackedState.state.removeWarp(warp);
    } else {
      TrackedState.state.setWarp(this.selectedWarp, warp);
    }
    this.selectedWarp = null;
  }
}
