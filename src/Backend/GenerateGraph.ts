const MAX_KEY_ITEMS = 100;
const MAX_TRAINERS = 317;
const NUM_POKEMON = 151;

import { CheckAccessibility, Check } from "./Checks";
import { WarpAccessibility, Warp } from "./Warps";

export const Items: Set<string> = new Set();
export const Regions: Set<string> = new Set();

class GraphClass {
  // TODO
}

export const Graph: GraphClass = new GraphClass();

export function entranceAccessible(entrance: Warp): WarpAccessibility {
  /**
   * Parameters:
   *  Warp: Representation of an entrance
   * Returns enum EntranceAccessibility
   */
  return WarpAccessibility.Other;
}

export function getCheckStatus(check: string): CheckAccessibility {
  /**
   * Parameters:
   *  check: Respresentation of a check
   * Return enum CheckAccessibility
   */
  // TODO: Mapping of string names of checks to Check objects
  throw new Error("todo");
}

/** "check" refers to the specific check-giving thing that is found on the map */
export function setCheckAcquired(checkName: string, acquired: boolean) {
  throw new Error("todo");
}

export function shortestPath(startRegion: string, endRegion: string): Array<string> {
  /**
   * Parameters:
   *  startRegion: start region string
   *  endRegion: destination region string
   * Returns: Ordered array of string locations to enter to arrive at endLoc, not including startLoc
   */
  return [];
}

export function setWarp(fromWarp: Warp, toWarp: Warp) {
  // if there is already a toWarp on the graph, remove it before setting this warp
  throw new Error("todo");
}

export function removeWarp(warp: Warp) {
  throw new Error("todo");
}

export function getWarp(fromWarp: Warp): Warp | null {
  throw new Error("todo");
}

////////////////////// ITEM STATUS ///////////////////////////////

/** "item" refers to the item that is received from a check (e.g., HM01) */
export function setItemStatus(itemName: string, found: boolean) {
  throw new Error("todo");
}

/** "item" refers to the item that is received from a check (e.g., HM01) */
export function getItemStatus(itemName: string): boolean {
  throw new Error("todo");
}

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

export const Settings = {
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
