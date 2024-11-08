import {
  entranceAccessible,
  getCheckStatus,
  setCheckAcquired,
  generateTextPath,
  shortestPath,
  updateRegionAccessibility,
  setWarp,
  removeWarp,
  getWarp,
  setItemStatus,
  getItemStatus,
  State,
  defaultSettings,
} from "../Backend/GenerateGraph";
import { CheckAccessibility, generateChecks } from "../Backend/Checks";
import { WarpAccessibility } from "../Backend/Warps";

describe("entranceAccessible", () => {
  it("should initiallize warps to be inaccessible", () => {
    const state: State = new State(defaultSettings);
    const warps = state.warps;
    for (const warp of warps) {
      expect(entranceAccessible(warp)).toBe(WarpAccessibility.Inaccessible);
    }
  });

  it("should update accessibility of relevant warps when regions are added", () => {
    const state: State = new State(defaultSettings);
    state.regions.add("Pallet Town");
    const warps = state.warps;
    for (const warp of warps) {
      warp.updateAccessibility();
      if (state.regions.has(warp.region)) {
        expect(entranceAccessible(warp)).toBe(WarpAccessibility.Accessible);
      } else {
        expect(entranceAccessible(warp) !== WarpAccessibility.Accessible).toBeTruthy();
      }
    }
  });
});

describe("getCheckStatus", () => {
  it("should initiallize checks to be inaccessible", () => {
    const state: State = new State(defaultSettings);
    const checks = state.checks;
    for (const check of checks) {
      if (check.type === "Pokemon") {
        expect(getCheckStatus(check)).toBe(CheckAccessibility.Accessible);
      } else {
        expect(getCheckStatus(check)).toBe(CheckAccessibility.Inaccessible);
      }
    }
  });

  it("should update accessibility of relevant checks when regions are added", () => {
    const state: State = new State(defaultSettings);
    const checks = state.checks;
    state.regions.add("Fuchsia Warden's House");
    state.items.add("Gold Teeth");
    for (const check of checks) {
      check.updateCheckStatus();
      if (check.name === "Safari Zone Warden" || check.type === "Pokemon") {
        expect(getCheckStatus(check)).toBe(CheckAccessibility.Accessible);
      } else {
        expect(getCheckStatus(check)).toBe(CheckAccessibility.Inaccessible);
      }
    }
  });
});

describe("updateRegionAccessibility", () => {
  it("should update available regions when near other regions without requirements", () => {
    const state: State = new State(defaultSettings);
    state.regions.add("Pallet Town");
    updateRegionAccessibility(state);
    expect(state.regions.has("Route 1")).toBeTruthy();
    expect(state.regions.has("Viridian Forest")).toBeFalsy();
    expect(state.regions.has("Route 21")).toBeFalsy();
  });

  it("should update available regions when near other regions with requirements", () => {
    const state: State = new State(defaultSettings);
    state.regions.add("Pallet Town");
    state.items.add("HM 03 Surf");
    state.items.add("Soul Badge");
    updateRegionAccessibility(state);
    expect(state.regions.has("Route 1")).toBeTruthy();
    expect(state.regions.has("Viridian Forest")).toBeFalsy();
    expect(state.regions.has("Route 21")).toBeTruthy();
    expect(state.regions.has("Cinnabar Island")).toBeTruthy();
  });
});

describe("shortestPath", () => {
  it("should give empty path if start === end", () => {
    const state: State = new State(defaultSettings);
    expect(shortestPath("Pallet Town", "Pallet Town", state).length).toBe(0);
  });

  it("should give empty path if unreachable", () => {
    const state: State = new State(defaultSettings);
    expect(shortestPath("Pallet Town", "Indigo Plateau", state).length).toBe(0);
  });

  it("should give path if reachable", () => {
    const state: State = new State(defaultSettings);
    state.regions.add("Pallet Town");
    updateRegionAccessibility(state);
    const path = shortestPath("Pallet Town", "Route 22", state);
    console.log(generateTextPath(path));
    expect(path.length).toBe(3);
    expect(generateTextPath(path).reduce((prev, next) => prev + next, "")).toBe([
      "Pallet Town to Route 1",
      "Route 1 to Viridian City",
      "Viridian City to Route 22",
    ].reduce((prev, next) => prev + next, ""));
  });
});
