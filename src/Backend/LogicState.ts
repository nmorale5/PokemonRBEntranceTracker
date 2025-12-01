import { ConstantWarp, generateConstantWarps, generateWarps, Warp, WarpAccessibility } from "./Warps";
import { Check, generateChecks, generatePokemonChecks } from "./Checks";
import * as settingsClass from "./Settings";
import _, { indexOf } from "lodash";
import { BehaviorSubject } from "rxjs";
import { canCut, canFly, CITIES } from "./Requirements";
import { JSONRecord } from "archipelago.js";
import { logItem, Session } from "./Archipelago";

export default class LogicState {
  public items: Set<string> = new Set([]);
  public regions: Set<string> = new Set(["Pallet Town", "Player's House 2F"]);
  public checks: Array<Check>;
  public warps: Array<Warp>;
  public fakeWarps: Array<ConstantWarp>;
  public freeFly: Array<string> = ["", ""];
  public badgeRequirements: Array<string> = ["", "", "", "", ""];

  public constructor(public settings: typeof settingsClass.defaultSettings) {
    this.checks = generateChecks(this).concat(generatePokemonChecks(this));
    this.warps = generateWarps(this);
    this.fakeWarps = generateConstantWarps(this);
    this.updateRegionAccessibility();
    this.changeSettings(Session.instance.slotData);
  }

  public static readonly currentState = new BehaviorSubject<LogicState>(new LogicState(settingsClass.defaultSettings));

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
    if (newState.settings.DoorShuffle !== settingsClass.DoorShuffle.Decoupled) {
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
    if (this.settings.DoorShuffle !== settingsClass.DoorShuffle.Decoupled) {
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
    logItem(itemName, newState);
    newState.updateRegionAccessibility();
    return newState;
  }

  public searchWarps(startRegion: string, endRegion: string) {}

  public updateRegions() {
    return this.shortestPath("Pallet Town", "", true); // Abusing the benefit of attempting a full search from the start location
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
    return [];
  }

  // warning: mutates this state, should only be called internally while creating a new state
  public updateRegionAccessibility() {
    this.regions.clear();
    this.updateRegions();
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

  // warning: mutates this state, should only be called internally while creating a new state
  public changeSettings(slotData: JSONRecord): void {
    if (!slotData) {
      return; // If you haven't loaded, don't try to change settings using this function!
    }

    const settings: typeof settingsClass.defaultSettings = {
      OakWin: false, // Required?
      EliteFourBadges: slotData["elite_four_badges_condition"] as number,
      EliteFourKeyItems: slotData["elite_four_key_items_condition"] as number,
      EliteFourPokedex: slotData["elite_four_pokedex_condition"] as number,
      VictoryRoadBadges: slotData["victory_road_condition"] as number,
      Route22Badges: slotData["route_22_gate_condition"] as number,
      ViridianGymBadges: slotData["viridian_gym_condition"] as number,
      CeruleanCaveBadges: slotData["cerulean_cave_badges_condition"] as number,
      CeruleanCaveKeyItems: slotData["cerulean_cave_key_items_condition"] as number,
      Route3Req: slotData["route_3_condition"] as number,
      RobbedHouseOfficer: !!slotData["robbed_house_officer"],
      FossilReviveCount: slotData["second_fossil_check_condition"] as number,
      FossilItemTypes: settingsClass.FossilItemTypes.Any,
      BadgeSanity: true, // No way currently to find this from state
      BadgeHMRequirement: settingsClass.BadgeHMRequirement.Extra,
      OldMan: slotData["old_man"] as number,
      Pokedex: slotData["randomize_pokedex"] as number,
      KeyItemsOnly: !!slotData["key_items_only"],
      Tea: !!slotData["tea"],
      ExtraKeyItems: !!slotData["extra_key_items"],
      CardKey: slotData["split_card_key"] as number,
      AllElevatorsLocked: !!slotData["all_elevators_locked"],
      ExtraBoulders: !!slotData["extra_strength_boulders"],
      RequireItemFinder: !!slotData["require_item_finder"],
      RandomizeHidden: slotData["randomize_hidden_items"] as number,
      PrizeSanity: !!slotData["prizesanity"],
      TrainerSanity: slotData["trainersanity"] as number,
      RequirePokedex: !!slotData["require_pokedex"],
      DexSanity: 0, // No way currently to find this from state
      DoorShuffle: slotData["door_shuffle"] as number,
      WarpTileShuffle: slotData["warp_tile_shuffle"] as number,
      RandomizeRockTunnel: true, // No way currently to find this from state
      RequireFlash: !!slotData["dark_rock_tunnel_logic"],
      OaksAidRt2: slotData["oaks_aide_rt_2"] as number,
      OaksAidRt11: slotData["oaks_aide_rt_11"] as number,
      OaksAidRt15: slotData["oaks_aide_rt_15"] as number,
      StoneSanity: !!slotData["stonesanity"],
      PokeDollSkip: !!slotData["poke_doll_skip"],
      BicycleGateSkip: !!slotData["bicycle_gate_skips"],
      RandomizeWildPokemon: settingsClass.RandomizePokemon.BSTMatch,
      Area1To1Mapping: !!slotData["area_1_to_1_mapping"],
      RandomizeStarterPokemon: settingsClass.RandomizePokemon.BSTMatch,
      RandomizeStaticPokemon: settingsClass.RandomizePokemon.BSTMatch,
      RandomizeLegendaryPokemon: settingsClass.RandomizeLegendaryPokemon.Shuffle,
    };
    this.settings = settings;
    this.freeFly[0] = CITIES[slotData["free_fly_map"] as number];
    this.freeFly[1] = CITIES[slotData["town_map_fly_map"] as number];
    const extraBadges = slotData["extra_badges"] as JSONRecord;
    const HMs: Array<string> = ["Cut", "Fly", "Surf", "Strength", "Flash"];
    if (extraBadges) {
      this.badgeRequirements = HMs.map(hm => extraBadges[hm] as string);
    }
  }
}
