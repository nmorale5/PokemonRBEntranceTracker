import { ConstantWarp, generateConstantWarps, generateWarps, Warp, WarpAccessibility } from "./Warps";
import { Check, generateChecks, generatePokemonChecks } from "./Checks";
import * as Settings from "./Settings";
import { Observable, Subject } from "rxjs";
import { CITIES } from "./Requirements";
import { JSONRecord } from "archipelago.js";
import _ from "lodash";

export enum UpdateType {
  Items,
  Checks,
  Warps,
  Any,
}

type SavedWarp = { toWarp: string; fromWarp: string } | null;

export default class LogicState {
  public items: Set<string> = new Set([]);
  public regions: Set<string> = new Set(["Pallet Town", "Player's House 2F"]);
  public checks: Array<Check>;
  public warps: Array<Warp>;
  public fakeWarps: Array<ConstantWarp>;
  public settings: typeof Settings.defaultSettings = Settings.defaultSettings;
  public freeFly: Array<string> = ["", ""];
  public extraBadgeRequirements: Array<string> = ["", "", "", "", ""]; // extra badge (if any) for ["Cut", "Fly", "Surf", "Strength", "Flash"], respectively

  private readonly _updates = new Subject<UpdateType>();
  public readonly updates = this._updates as Observable<UpdateType>;

  public constructor(slotData?: JSONRecord, savedWarps?: SavedWarp[]) {
    this.checks = generateChecks(this).concat(generatePokemonChecks(this));
    this.warps = generateWarps(this);
    this.fakeWarps = generateConstantWarps(this);
    this._populateWithSavedWarps(savedWarps);
    this._setSettings(slotData);
    this._updateRegionAccessibility();
  }

  public clone(): LogicState {
    const newState = _.cloneDeep(this);
    newState.fakeWarps = generateConstantWarps(newState); // Requires reference to new state
    return newState;
  }

  private emitUpdate(updateType: UpdateType) {
    this._updates.next(updateType);
  }

  public addChecks(checkIds: number[] | number) {
    if (typeof checkIds === "number") {
      checkIds = [checkIds];
    }
    for (const id of checkIds) {
      this.checks.find(check => check.id === id)!.acquired = true;
    }
    this.emitUpdate(UpdateType.Checks);
  }

  public addItem(itemName: string, deleteFlag = false) {
    if (deleteFlag) {
      this.items.delete(itemName);
    } else {
      this.items.add(itemName);
    }
    this._updateRegionAccessibility();
    this.emitUpdate(UpdateType.Items);
  }

  public setWarp(fromWarp: Warp, toWarp: Warp) {
    /**
     * Adds a connection between two warps. Removes any existing connections first.
     * Also mutates the region set of state in response to the additional warp.
     *
     * Parameters:
     *  fromWarp (Warp): The starting point of the connection
     *  toWarp (Warp): The ending point of the connection
     *  state (State): The game state object the warps are a part of
     */
    this._removeWarpInternal(fromWarp);
    const newFromWarp = this.warps.find(warp => warp.equals(fromWarp))!;
    const newToWarp = this.warps.find(warp => warp.equals(toWarp))!;
    newFromWarp.linkedWarp = newToWarp;
    if (this.settings.DoorShuffle !== Settings.DoorShuffle.Decoupled) {
      this._removeWarpInternal(newToWarp);
      newToWarp.linkedWarp = newFromWarp;
    }
    this._updateRegionAccessibility();
    this.emitUpdate(UpdateType.Warps);
  }

  public removeWarp(warp: Warp) {
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
    this._removeWarpInternal(warp);
    this.emitUpdate(UpdateType.Warps);
  }

  private _removeWarpInternal(warp: Warp) {
    warp = this.warps.find(w => w.equals(warp))!;
    if (this.settings.DoorShuffle !== Settings.DoorShuffle.Decoupled) {
      const otherWarp = warp.linkedWarp === null ? undefined : this.warps.find(w => w.equals(warp.linkedWarp!));
      if (otherWarp?.linkedWarp) {
        otherWarp.linkedWarp = null;
      }
    }
    warp.linkedWarp = null;
    this._updateRegionAccessibility();
  }

  public shortestPath(startRegion: string, endRegion: string): Array<Warp> {
    return this._bfs(startRegion, endRegion);
  }

  private _bfs(startRegion: string, endRegion: string, modifyState = false, includePalletWarp = true): Array<Warp> {
    /**
     * Returns an ordered array of warps to enter to get from startRegion to endRegion
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

  private _updateRegionAccessibility() {
    /**
     * Performs updates to the accessibility of warps and checks based on player inventory,
     * the regions that are available, and the settings.
     *
     * This should be called every time the set of items or settings is changed, and is
     * automatically called whenever the set of regions changes.
     */
    this.regions.clear();
    this._bfs("Pallet Town", "", true); // Abusing the benefit of attempting a full search from the start location
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

  private _populateWithSavedWarps(savedWarps: SavedWarp[] | undefined) {
    if (!savedWarps) return;
    this.warps.forEach((warp, i) => (warp.linkedWarp = savedWarps[i] === null ? null : this.warps.find(w => w.toWarp === savedWarps[i]!.toWarp && w.fromWarp === savedWarps[i]!.fromWarp)!));
  }

  private _setSettings(slotData?: JSONRecord): void {
    if (!slotData) {
      return;
    }
    this.settings = {
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
      FossilItemTypes: Settings.FossilItemTypes.Any,
      BadgeSanity: true, // No way currently to find this from state
      BadgeHMRequirement: Settings.BadgeHMRequirement.Extra,
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
      RandomizeWildPokemon: Settings.RandomizePokemon.BSTMatch,
      Area1To1Mapping: !!slotData["area_1_to_1_mapping"],
      RandomizeStarterPokemon: Settings.RandomizePokemon.BSTMatch,
      RandomizeStaticPokemon: Settings.RandomizePokemon.BSTMatch,
      RandomizeLegendaryPokemon: Settings.RandomizeLegendaryPokemon.Shuffle,
    };
    this.freeFly[0] = CITIES[slotData["free_fly_map"] as number];
    this.freeFly[1] = CITIES[slotData["town_map_fly_map"] as number];
    const extraBadges = slotData["extra_badges"] as JSONRecord;
    if (extraBadges) {
      this.extraBadgeRequirements = ["Cut", "Fly", "Surf", "Strength", "Flash"].map(hm => extraBadges[hm] as string);
    }
  }
}
