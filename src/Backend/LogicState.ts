import { ConstantWarp, generateConstantWarps, generateWarps, Warp, WarpAccessibility } from "./Warps";
import { Check, generateChecks, generatePokemonChecks } from "./Checks";
import { defaultSettings, DoorShuffle } from "./Settings";
import _ from "lodash";
import { BehaviorSubject } from "rxjs";
import { canCut, canFly, CITIES } from "./Requirements";

export default class LogicState {
  public items: Set<string> = new Set([]);
  public regions: Set<string> = new Set(["Pallet Town", "Player's House 2F"]);
  public checks: Array<Check>;
  public warps: Array<Warp>;
  public fakeWarps: Array<ConstantWarp>;
  public freeFly: string = "";

  public constructor(public settings: typeof defaultSettings) {
    this.checks = generateChecks(this).concat(generatePokemonChecks(this));
    this.warps = generateWarps(this);
    this.fakeWarps = generateConstantWarps(this);
    this.updateRegionAccessibility();
  }

  public static readonly currentState = new BehaviorSubject<LogicState>(new LogicState(defaultSettings));

  public clone(): LogicState {
    const newState = _.cloneDeep(this);
    newState.fakeWarps = generateConstantWarps(newState); // Requires reference to new state
    return newState;
  }

  /** "check" refers to the specific check-giving thing that is found on the map */
  public withCheckAcquired(checkId: number, acquired: boolean): LogicState {
    const newState = this.clone();
    newState.checks.find(check => check.id === checkId)!.acquired = acquired;
    return newState;
  }

  public setWarp(fromWarp: Warp, toWarp: Warp): LogicState {
    /**
     * Adds a connection between two warps. Removes any existing connections first.
     * Also mutates the region set of state in response to the additional warp.
     *
     * Parameters:
     *  fromWarp (Warp): The starting point of the connection
     *  toWarp (Warp): The ending point of the connection
     *  state (State): The game state object the warps are a part of
     */
    const newState = this.clone();
    newState._removeWarpMutating(fromWarp);
    const newFromWarp = newState.warps.find(warp => warp.equals(fromWarp))!;
    const newToWarp = newState.warps.find(warp => warp.equals(toWarp))!;
    newFromWarp.linkedWarp = newToWarp;
    if (newState.settings.DoorShuffle !== DoorShuffle.Decoupled) {
      newState._removeWarpMutating(newToWarp);
      newToWarp.linkedWarp = newFromWarp;
    }
    newState.updateRegionAccessibility();
    return newState;
  }

  public removeWarp(warp: Warp): LogicState {
    /**
     * Removes the connection made between two warps.
     * Mutates both warp and the linkedWarp (if linked) by setting their linkedWarp
     * attributes to null. Also mutates the set of regions of state in response to
     * the removed warp.
     *
     * Parameters:
     *  warp (Warp): The warp on either end of the connection to disconnect
     *  state (State): The game state object the warp is a part of
     */
    const newState = this.clone();
    newState._removeWarpMutating(warp);
    return newState;
  }

  // warning: mutates, should only be used with setWarp and removeWarp above
  private _removeWarpMutating(warp: Warp) {
    warp = this.warps.find(w => w.equals(warp))!;
    if (this.settings.DoorShuffle !== DoorShuffle.Decoupled) {
      const otherWarp = warp.linkedWarp === null ? undefined : this.warps.find(w => w.equals(warp.linkedWarp!));
      if (otherWarp?.linkedWarp) {
        otherWarp.linkedWarp = null;
      }
    }
    warp.linkedWarp = null;
    this.updateRegionAccessibility();
  }

  public withItemStatus(itemName: string, found: boolean): LogicState {
    const newState = this.clone();
    if (found) {
      newState.items.add(itemName);
    } else {
      newState.items.delete(itemName);
    }
    newState.updateRegionAccessibility();
    return newState;
  }

  public shortestPath(startRegion: string, endRegion: string, modifyState: boolean = false, includePalletWarp: boolean = true): Array<Warp> {
    /**
     * Gets shortest path from one region to another.
     *
     * Parameters:
     *  startRegion: start region string
     *  endRegion: destination region string
     *  state: game state
     * Returns: Ordered array of warps to enter to arrive at endRegion
     */
    if (startRegion === endRegion) {
      return [];
    }
    const combinedWarps: Array<Warp> = this.warps.concat(this.fakeWarps);
    const exploredRegions: Map<string, Array<Warp>> = new Map(); // Array of maps from region to Warp (to get there)
    exploredRegions.set(startRegion, []);
    let toExplore: Array<string> = [startRegion]; // regions to find new paths from
    if (includePalletWarp) {
      exploredRegions.set("Pallet Town", []); // Can Pallet Warp
      toExplore.push("Pallet Town");
    }
    if (canFly(this) && CITIES.includes(this.freeFly)) {
      exploredRegions.set(this.freeFly, []);
      toExplore.push(this.freeFly);
    }

    let nextExplore: Array<string> = [];
    while (toExplore.length > 0) {
      for (const region of toExplore) {
        if (modifyState) {
          this.regions.add(region); // Only add the this if you are doing the update for accessibility!
        }
        for (const warp of combinedWarps) {
          if (modifyState) {
            warp.updateAccessibility();
          }
          if (warp.region === region) {
            if (warp instanceof ConstantWarp) {
              if (!exploredRegions.has(warp.toWarp) && warp.accessibility === WarpAccessibility.Accessible) {
                nextExplore.push(warp.toWarp);
                exploredRegions.set(warp.toWarp, exploredRegions.get(region)!.concat([warp]));
              }
            } else if (warp.linkedWarp) {
              const linkedWarp: Warp = warp.linkedWarp;
              if (!exploredRegions.has(linkedWarp.region) && warp.accessibility === WarpAccessibility.Accessible) {
                nextExplore.push(linkedWarp.region);
                exploredRegions.set(linkedWarp.region, exploredRegions.get(region)!.concat([warp]));
              }
            } else {
              // Warp is undiscovered, no information. Later, we might be able to do something
              // for non-randomized maps here. Or, we could preset all the warp links
            }
          }
          if (exploredRegions.has(endRegion)) {
            return exploredRegions.get(endRegion)!;
          }
        }
      }
      toExplore = nextExplore;
      nextExplore = [];
    }
    // if (modifyState) {
    //   return new Set(exploredRegions);
    // }
    return [];
  }

  // warning: mutates this state, should only be called internally while creating a new state
  public updateRegionAccessibility() {
    this.regions.clear();
    this.shortestPath("Pallet Town", "", true); // Abusing the benefit of attempting a full search from the start location
    this.updateAll();
  }

  // warning: mutates this state, should only be called internally while creating a new state
  public updateAll(): void {
    /**
     * Performs updates to the accessibility of warps and items based on player inventory,
     * the regions that are available, and the settings.
     *
     * This should be called every time the set of items or settings is changed, and is
     * automatically called whenever the set of regions changes.
     */
    for (const warp of this.warps) {
      warp.updateAccessibility();
    }
    for (const warp of this.fakeWarps) {
      warp.updateAccessibility();
    }
    for (const check of this.checks) {
      check.updateCheckStatus();
    }
  }
}
