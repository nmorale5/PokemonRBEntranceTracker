import { CheckAccessibility, Check, generateChecks, generatePokemonChecks } from "./Checks";
import {
  WarpAccessibility,
  Warp,
  ConstantWarp,
  generateWarps,
  generateConstantWarps,
} from "./Warps";

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

export class State {
  public items: Set<string> = new Set();
  public regions: Set<string> = new Set();
  public checks: Array<Check>;
  public warps: Array<Warp>;
  public fakeWarps: Array<ConstantWarp>;
  constructor(public settings: typeof defaultSettings) {
    this.checks = generateChecks(this);
    this.checks = this.checks.concat(generatePokemonChecks(this));
    this.warps = generateWarps(this);
    this.fakeWarps = generateConstantWarps(this);
  }
}

// export const Items: Set<string> = new Set();
// export const Regions: Set<string> = new Set();

export function entranceAccessible(entrance: Warp): WarpAccessibility {
  /**
   * Parameters:
   *  Warp: Representation of an entrance
   * Returns enum EntranceAccessibility
   */
  return entrance.accessibility;
}

export function getCheckStatus(check: Check): CheckAccessibility {
  /**
   * Parameters:
   *  check: Respresentation of a check
   * Return enum CheckAccessibility
   */
  return check.accessibility;
}

/** "check" refers to the specific check-giving thing that is found on the map */
export function setCheckAcquired(check: Check, acquired: boolean) {
  check.acquired = acquired;
}

export function generateTextPath(warpPath: Array<Warp>): Array<string> {
  /**
   * Given an array of warps, generates an array of strings that
   * describes the warps in a readable format
   *
   * Parameters:
   *  warpPath: An array of warps
   * Returns An array of human-readable string representations of warps
   */
  return warpPath.map((warp) => {
    return warp.toString();
  });
}

export function updateRegionAccessibility(state: State) {
  /**
   * Updates the Regions set to include all the accessible regions.
   */
  shortestPath("Pallet Town", "", state, true); // Abusing the benefit of attempting a full search from the start location
}

export function shortestPath(
  startRegion: string,
  endRegion: string,
  state: State,
  modifyState: boolean = false
): Array<Warp> {
  /**
   * Parameters:
   *  startRegion: start region string
   *  endRegion: destination region string
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
  let counter = 0;
  while (toExplore.length > 0) {
    if (!modifyState){
      console.log(exploredRegions);
      console.log(counter);
    }
    for (const region of toExplore) {
      if (modifyState) {
        state.regions.add(region); // Only add the state if you are doing the update for accessibility!
      }
      for (const warp of combinedWarps) {
        warp.updateAccessibility();
        if (warp.region === region) {
          if (warp instanceof ConstantWarp) {
            if (
              !exploredRegions.has(warp.toWarp) &&
              warp.accessibility === WarpAccessibility.Accessible
            ) {
              nextExplore.push(warp.toWarp);
              exploredRegions.set(warp.toWarp, exploredRegions.get(region)!.concat([warp]));
            }
          } else if (warp.linkedWarp) {
            const linkedWarp: Warp = warp.linkedWarp;
            if (
              !exploredRegions.has(linkedWarp.region) &&
              warp.accessibility === WarpAccessibility.Accessible
            ) {
              nextExplore.push(linkedWarp.region);
              exploredRegions.set(linkedWarp.region, exploredRegions.get(region)!.concat([warp]));
            }
          } else {
            // Warp is undiscovered, no information. Later, we might be able to do something
            // for non-randomized maps here. Or, we could preset all of the warp links
          }
        }
        if (exploredRegions.has(endRegion)) {
          console.log(exploredRegions);
          return exploredRegions.get(endRegion)!;
        }
      }
      counter += 1;
    }
    toExplore = nextExplore;
    nextExplore = [];
  }
  // if (modifyState) {
  //   return new Set(exploredRegions);
  // }
  return [];
}

export function setWarp(fromWarp: Warp, toWarp: Warp) {
  fromWarp.linkedWarp = toWarp;
  toWarp.linkedWarp = fromWarp;
}

export function removeWarp(warp: Warp) {
  warp.linkedWarp = null;
}

export function getWarp(fromWarp: Warp): Warp | null {
  return fromWarp.linkedWarp;
}

////////////////////// ITEM STATUS ///////////////////////////////

/** "item" refers to the item that is received from a check (e.g., HM01) */
export function setItemStatus(itemName: string, found: boolean, state: State) {
  if (found) {
    state.items.add(itemName);
  } else {
    state.items.delete(itemName);
  }
}

/** "item" refers to the item that is received from a check (e.g., HM01) */
export function getItemStatus(itemName: string, state: State): boolean {
  return state.items.has(itemName);
}

export const defaultState: State = new State(defaultSettings);
defaultState.regions.add("Pallet Town"); // Pallet Warp
defaultState.regions.add("Player's House 2F"); // Spawn Location
updateRegionAccessibility(defaultState);
