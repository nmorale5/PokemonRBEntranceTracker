import { CheckAccessibility, Check, generateChecks, generatePokemonChecks } from "./Checks";
import { WarpAccessibility, Warp, ConstantWarp, generateWarps, generateConstantWarps } from "./Warps";
import { BehaviorSubject, Observable } from "rxjs";
import _ from "lodash";

const MAX_KEY_ITEMS = 100;
const MAX_TRAINERS = 317;
const NUM_POKEMON = 151;

////////////////////// SETTINGS ///////////////////////////////////

export enum Route3Req {
  "Open",
  "DefeatBrock",
  "DefeatAny",
  "BoulderBadge",
  "AnyBadge",
}

export enum FossilItemTypes {
  "Any",
  "Key",
  "Unique",
  "NoKey",
}

export enum BadgeHMRequirement {
  "None",
  "Default",
  "Extra",
  "ExtraPlus",
}

export enum OldMan {
  "Default",
  "EarlyParcel",
  "None",
}

export enum Pokedex {
  "Default",
  "Random",
  "Start",
}

export enum CardKey {
  "Default",
  "Split",
  "Progressive",
}

export enum RandomizeHidden {
  "No",
  "Yes",
  "Junk",
}

export enum DoorShuffle {
  "Default",
  "Simple",
  "Interiors",
  "Full",
  "Insanity",
  "Decoupled",
}

export enum WarpTileShuffle {
  "Default",
  "Shuffled",
  "Mixed",
}

export enum RandomizePokemon {
  "Default",
  "TypeMatch",
  "BSTMatch",
  "BothMatch",
  "Random",
}

export enum RandomizeLegendaryPokemon {
  "Default",
  "Shuffle",
  "Static",
  "Any",
}

export const defaultSettings = {
  OakWin: false, // Required?
  EliteFourBadges: 8,
  EliteFourKeyItems: 0,
  EliteFourPokedex: 0,
  VictoryRoadBadges: 7,
  Route22Badges: 7,
  ViridianGymBadges: 7,
  CeruleanCaveBadges: 4,
  CeruleanCaveKeyItems: 24,
  Route3Req: Route3Req.BoulderBadge,
  RobbedHouseOfficer: true,
  FossilReviveCount: 0,
  FossilItemTypes: FossilItemTypes.Any,
  BadgeSanity: true,
  BadgeHMRequirement: BadgeHMRequirement.Default,
  OldMan: OldMan.Default,
  Pokedex: Pokedex.Random,
  KeyItemsOnly: false,
  Tea: true,
  ExtraKeyItems: true,
  CardKey: CardKey.Progressive,
  AllElevatorsLocked: false,
  ExtraBoulders: false,
  RequireItemFinder: false,
  RandomizeHidden: RandomizeHidden.Yes,
  PrizeSanity: false,
  TrainerSanity: MAX_TRAINERS,
  RequirePokedex: true,
  DexSanity: 0,
  DoorShuffle: DoorShuffle.Insanity,
  WarpTileShuffle: WarpTileShuffle.Mixed,
  RandomizeRockTunnel: true,
  RequireFlash: true,
  OaksAidRt2: 10,
  OaksAidRt11: 20,
  OaksAidRt15: 30,
  StoneSanity: true,
  PokeDollSkip: false,
  BicycleGateSkip: false,
  RandomizeWildPokemon: RandomizePokemon.BSTMatch,
  Area1To1Mapping: true,
  RandomizeStarterPokemon: RandomizePokemon.BSTMatch,
  RandomizeStaticPokemon: RandomizePokemon.BSTMatch,
  RandomizeLegendaryPokemon: RandomizeLegendaryPokemon.Shuffle,
};

////////////////////// State /////////////////////////////////////////////////////

export class State {
  public items: Set<string> = new Set();
  public regions: Set<string> = new Set();
  public checks: Array<Check>;
  public warps: Array<Warp>;
  public fakeWarps: Array<ConstantWarp>;

  private _behaviorSubject: BehaviorSubject<State> | null = null;

  constructor(public settings: typeof defaultSettings) {
    this.checks = generateChecks(this);
    this.checks = this.checks.concat(generatePokemonChecks(this));
    this.warps = generateWarps(this);
    this.fakeWarps = generateConstantWarps(this);
  }

  updateAll(): void {
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
    this._behaviorSubject?.next(this); // put this line wherever else state may get updated
  }

  public asObservable(): Observable<State> {
    if (!this._behaviorSubject) {
      this._behaviorSubject = new BehaviorSubject<State>(this);
    }
    return this._behaviorSubject;
  }
}

///////////////////////////// API ///////////////////////////////////////////////////////

export function entranceAccessible(entrance: Warp): WarpAccessibility {
  /**
   * Consider using entrance.accessibility
   *
   * Parameters:
   *  Warp: Representation of an entrance
   * Returns enum EntranceAccessibility
   */
  return entrance.accessibility;
}

/////////////////////////////// Check API ///////////////////////////////////////////////

export function getCheckStatus(check: Check): CheckAccessibility {
  /**
   * Consider using check.accessibility
   *
   * Parameters:
   *  check: Representation of a check
   * Return enum CheckAccessibility
   */
  return check.accessibility;
}

/** "check" refers to the specific check-giving thing that is found on the map */
export function setCheckAcquired(check: Check, acquired: boolean) {
  /**
   * Please just use check.acquired.
   *
   * Parameters:
   *  check (Check): The check to set acquired to
   *  acquired (boolean): The value to set acquired to
   */
  check.acquired = acquired;
}

//////////////////////////////// Search and Update API //////////////////////////

export function generateTextPath(warpPath: Array<Warp>): Array<string> {
  /**
   * Given an array of warps, generates an array of strings that
   * describes the warps in a readable format
   *
   * Parameters:
   *  warpPath: An array of warps
   * Returns An array of human-readable string representations of warps
   */
  return warpPath.map(warp => {
    return warp.toString();
  });
}

export function updateRegionAccessibility(state: State) {
  /**
   * Updates the Regions set to include all the accessible regions.
   *
   * Parameters:
   *  state (State): The game state to modify the regions of
   */
  state.regions.clear();
  shortestPath("Pallet Town", "", state, true); // Abusing the benefit of attempting a full search from the start location
  state.updateAll();
}

export function shortestPath(startRegion: string, endRegion: string, state: State, modifyState: boolean = false): Array<Warp> {
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
  const combinedWarps: Array<Warp> = state.warps.concat(state.fakeWarps);
  const exploredRegions: Map<string, Array<Warp>> = new Map(); // Array of maps from region to Warp (to get there)
  exploredRegions.set(startRegion, []);
  let toExplore: Array<string> = [startRegion]; // regions to find new paths from
  let nextExplore: Array<string> = [];
  while (toExplore.length > 0) {
    for (const region of toExplore) {
      if (modifyState) {
        state.regions.add(region); // Only add the state if you are doing the update for accessibility!
      }
      for (const warp of combinedWarps) {
        warp.updateAccessibility();
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

/////////////////////////////// Warp API /////////////////////////////////////////////

export function setWarp(fromWarp: Warp, toWarp: Warp, state: State) {
  /**
   * Adds a connection between two warps. Removes any existing connections first.
   * Also mutates the region set of state in response to the additional warp.
   *
   * Parameters:
   *  fromWarp (Warp): The starting point of the connection
   *  toWarp (Warp): The ending point of the connection
   *  state (State): The game state object the warps are a part of
   */
  removeWarp(fromWarp, state);
  fromWarp.linkedWarp = toWarp;
  if (state.settings.DoorShuffle !== DoorShuffle.Decoupled) {
    removeWarp(toWarp, state);
    toWarp.linkedWarp = fromWarp;
  }
  updateRegionAccessibility(state);
}

export function removeWarp(warp: Warp, state: State) {
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
  if (state.settings.DoorShuffle !== DoorShuffle.Decoupled) {
    const otherWarp = warp.linkedWarp;
    if (otherWarp?.linkedWarp) otherWarp.linkedWarp = null;
  }
  warp.linkedWarp = null;
  updateRegionAccessibility(state);
}

export function getWarp(fromWarp: Warp): Warp | null {
  /**
   * Gets the connecting warp from a warp. Consider using
   * warp.linkedWarp directly.
   *
   * Parameters:
   *  fromWarp (Warp): The warp to get the corresponding linked warp from.
   *
   * Returns the linked warp, or null if it isn't linked.
   */
  return fromWarp.linkedWarp;
}

////////////////////// ITEM STATUS API ///////////////////////////////

/** "item" refers to the item that is received from a check (e.g., HM01) */
export function setItemStatus(itemName: string, found: boolean, state: State) {
  if (found) {
    state.items.add(itemName);
  } else {
    state.items.delete(itemName);
  }
  updateRegionAccessibility(state);
}

/** "item" refers to the item that is received from a check (e.g., HM01) */
export function getItemStatus(itemName: string, state: State): boolean {
  return state.items.has(itemName);
}

// Creating default state

export const defaultState: State = new State(defaultSettings);
defaultState.regions.add("Pallet Town"); // Pallet Warp
defaultState.regions.add("Player's House 2F"); // Spawn Location
updateRegionAccessibility(defaultState);
