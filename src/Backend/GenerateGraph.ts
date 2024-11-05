export enum EntranceAccessibility {
  "Inaccessible",
  "Accessible",
  "Other",
}

export enum CheckAccessibility {
  "Inaccessible",
  "Accessible",
  "Acquired",
  "Other",
}

export class Warp {
  constructor(
    public fromRegion: string,
    public toRegion: string
  ) {}
  equals(other: Warp) {
    return other.fromRegion == this.fromRegion && other.toRegion == this.toRegion;
  }
}

export function entranceAccessible(entrance: Warp): EntranceAccessibility {
  /**
   * Parameters:
   *  Warp: Representation of an entrance
   * Returns enum EntranceAccessibility
   */
  return EntranceAccessibility.Other;
}

export function getCheckStatus(check: string): CheckAccessibility {
  /**
   * Parameters:
   *  check: Respresentation of a check
   * Return enum CheckAccessibility
   */
  return CheckAccessibility.Other;
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

export const Settings = {
  CanFlyWithoutBadge: false,
};

if (!Settings.CanFlyWithoutBadge) {
  throw new Error("handle this later");
}
