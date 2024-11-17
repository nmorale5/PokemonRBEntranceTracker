import { defaultSettings } from "../Backend/Settings";
import { CheckAccessibility } from "../Backend/Checks";
import { Warp, WarpAccessibility } from "../Backend/Warps";
import LogicState from "../Backend/LogicState";

describe("entranceAccessible", () => {
  it("should update accessibility of relevant warps when regions are added", () => {
    const state: LogicState = new LogicState(defaultSettings);
    state.regions.add("Pallet Town");
    const warps = state.warps;
    for (const warp of warps) {
      warp.updateAccessibility();
      if (state.regions.has(warp.region)) {
        expect(warp.accessibility).toBe(WarpAccessibility.Accessible);
      } else {
        expect(warp.accessibility !== WarpAccessibility.Accessible).toBeTruthy();
      }
    }
  });
});

describe("getCheckStatus", () => {
  it("should update accessibility of relevant checks when regions are added", () => {
    const state: LogicState = new LogicState(defaultSettings);
    const checks = state.checks;
    state.regions.add("Fuchsia Warden's House");
    state.items.add("Gold Teeth");
    for (const check of checks) {
      check.updateCheckStatus();
      if (check.name === "Safari Zone Warden" || check.type === "Pokemon" || check.name === "Free Sample Man") {
        expect(check.accessibility).toBe(CheckAccessibility.Accessible);
      } else {
        expect(check.accessibility).toBe(CheckAccessibility.Inaccessible);
      }
    }
  });
});

describe("updateRegionAccessibility", () => {
  it("should update available regions when near other regions without requirements", () => {
    const state: LogicState = new LogicState(defaultSettings);
    state.regions.add("Pallet Town");
    state.updateRegionAccessibility();
    expect(state.regions.has("Route 1")).toBeTruthy();
    expect(state.regions.has("Viridian Forest")).toBeFalsy();
    expect(state.regions.has("Route 21")).toBeFalsy();
  });

  it("should update available regions when near other regions with requirements", () => {
    const state: LogicState = new LogicState(defaultSettings);
    state.regions.add("Pallet Town");
    state.items.add("HM03 Surf");
    state.items.add("Soul Badge");
    state.updateRegionAccessibility();
    expect(state.regions.has("Route 1")).toBeTruthy();
    expect(state.regions.has("Viridian Forest")).toBeFalsy();
    expect(state.regions.has("Route 21")).toBeTruthy();
    expect(state.regions.has("Cinnabar Island")).toBeTruthy();
  });
});

describe("shortestPath", () => {
  it("should give empty path if start === end", () => {
    const state: LogicState = new LogicState(defaultSettings);
    expect(state.shortestPath("Pallet Town", "Pallet Town").length).toBe(0);
  });

  it("should give empty path if unreachable", () => {
    const state: LogicState = new LogicState(defaultSettings);
    expect(state.shortestPath("Pallet Town", "Indigo Plateau").length).toBe(0);
  });

  it("should give path if reachable", () => {
    const state: LogicState = new LogicState(defaultSettings);
    state.regions.add("Pallet Town");
    state.updateRegionAccessibility();
    const path = state.shortestPath("Pallet Town", "Route 22");
    expect(path.length).toBe(3);
    expect(path.map(warp => warp.toString()).reduce((prev, next) => prev + next, "")).toBe(
      ["Pallet Town to Route 1", "Route 1 to Viridian City", "Viridian City to Route 22"].reduce((prev, next) => prev + next, "")
    );
  });
});

// describe("warpOperations", () => {
//   it("should give path if there is warp to path", () => {
//     const state: LogicState = new LogicState(defaultSettings);
//     state.regions.add("Pallet Town");
//     for (const warp of state.warps) {
//       if (warp.toWarp === "Pokemon Tower 1F" && warp.fromWarp === "Lavender Town") {
//         for (const warp2 of state.warps) {
//           if (warp2.toWarp === "Rival's House" && warp2.fromWarp === "Pallet Town") {
//             this.setWarp(warp2, warp, state);
//             expect(warp.linkedWarp).toBe(warp2);
//             expect(warp2.linkedWarp).toBe(warp);
//           }
//         }
//       }
//     }
//     const path = shortestPath("Pallet Town", "Lavender Town", state);
//     expect(path.length).toBe(1);
//     expect(generateTextPath(path).reduce((prev, next) => prev + next, "")).toBe(["Pallet Town to Rival's House"].reduce((prev, next) => prev + next, ""));
//   });
//
//   it("should not give path if there is no longer a warp to path", () => {
//     const state: LogicState = new LogicState(defaultSettings);
//     state.regions.add("Pallet Town");
//     let removingWarp: Warp;
//     for (const warp of state.warps) {
//       if (warp.toWarp === "Pokemon Tower 1F" && warp.fromWarp === "Lavender Town") {
//         for (const warp2 of state.warps) {
//           if (warp2.toWarp === "Rival's House" && warp2.fromWarp === "Pallet Town") {
//             setWarp(warp2, warp, state);
//             removingWarp = warp2;
//           }
//         }
//       }
//     }
//     removeWarp(removingWarp!, state);
//     expect(removingWarp!.linkedWarp).toBe(null);
//     const path = shortestPath("Pallet Town", "Lavender Town", state);
//     expect(path.length).toBe(0);
//     expect(state.regions.has("Lavender Town")).toBeFalsy();
//   });
// });
