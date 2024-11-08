import { Graph, Items, Settings, Regions, OldMan, Route3Req } from "./GenerateGraph";
import {
  canCut,
  canFlash,
  canSurf,
  canStrength,
  canRockTunnel,
  cardKeyAccess,
  canRoute3,
  canPassGuards,
  enoughBadges,
  enoughFossils,
  pokeDollSkippable,
  canEnterCeruleanCave,
  canEnterEliteFour,
  victoryRoadBoulder,
  seafoamExitBoulder,
  canPassVictoryRoadGate,
  canPassRoute22Gate,
  canEnterViridianGym,
} from "./Requirements";

import warpData from "../PokemonData/WarpData.json";
import fakeWarpData from "../PokemonData/FakeWarps.json";

// import {readJsonFile} from "../util";

export enum WarpAccessibility {
  "Inaccessible",
  "Accessible",
  "Other",
}

export class Warp {
  /**
   * A class to represent a warp (doorway or otherwise) in a game of Pokemon R/B
   *
   * Fields:
   *  fromWarp: the entrance warp
   *  toWarp: the exit warp
   *  region: the region the entrance is found in
   *  flags: additional information about the warp
   *  elevator: true if this warp requires Lift Key to use
   */
  public accessibility = WarpAccessibility.Inaccessible;

  constructor(
    public fromWarp: string,
    public toWarp: string,
    public region: string
  ) {}

  equals(other: Warp) {
    return other.fromWarp == this.fromWarp && other.toWarp == this.toWarp;
  }

  updateAccessibility(): void {
    if (Regions.has(this.region)) {
      this.accessibility = WarpAccessibility.Accessible;
    } else {
      this.accessibility = WarpAccessibility.Inaccessible;
    }
  }
}

export class ConstantWarp extends Warp {
  /**
   * A class to represent an imaginary "doorway" between any two "regions" which
   * either have some sort of requirement locked behind them (such as requiring HM ability)
   * or are different physical areas but connected (such as Pallet Town and Route 1)
   *
   * These are different from Warps in that
   *  1. They are never randomized
   *  2. The ability to use them is sometimes restricted
   *  3. They are sometimes one-way (which is only reflected in the fact that there is no opposite warp)
   */
  constructor(
    public fromWarp: string,
    public toWarp: string,
    public region: string,
    public flags: () => WarpAccessibility,
    public oneWay: boolean = true
  ) {
    super(fromWarp, toWarp, region);
  }

  updateAccessibility(): void {
    if (Regions.has(this.region)) {
      const canTraverse = this.flags();
      this.accessibility = canTraverse;
      if (canTraverse) {
        Regions.add(this.toWarp);
      }
    } else {
      this.accessibility = WarpAccessibility.Inaccessible;
    }
  }
}

let map = new Map();
map.set("1", 1);

function generateWarps(): Array<Warp> {
  const warps: Array<Warp> = [];
  for (const region of Object.keys(warpData)) {
    const regionData = warpData[region as keyof typeof warpData];
    for (const sides of regionData) {
      warps.push(new Warp(sides["from"], sides["to"], region));
    }
  }
  return warps;
}

export const Warps: Array<Warp> = generateWarps();

// Must bind a function to all of these
const all_flags = [
  "seafoam_exit_boulder",
  "lift_key",
  "good_rod",
  "!extra_strength_boulders",
  "buy_poke_doll",
  "hideout_key",
  "can_surf",
  "super_rod",
  "poke_flute",
  "fuji_saved",
  "has_bicycle",
  "rock_tunnel",
  "old_man",
  "help_bill",
  "victory_road_boulder",
  "plant_key",
  "!all_elevators_locked",
  "cerulean_cave",
  "can_strength",
  "safari_pass",
  "card_key",
  "mansion_key",
  "enter_elite_four",
  "!extra_key_items",
  "route_3",
  "secret_key",
  "old_rod",
  "can_pass_guards",
  "oak's_parcel",
  "poke_doll_skip",
  "can_cut",
  "ss_ticket",
  "silph_scope",
  "bicycle_skip",
  "defeat_viridian_gym_giovanni",
  "silph_co_liberated",
  "fossil_checks",
  "viridian_gym_badges",
  "victory_road_gate_badges",
  "route_22_gate_badges",
];

const flag_to_func: Map<string, (() => boolean) | ((param: number) => boolean)> = new Map();
flag_to_func.set("seafoam_exit_boulder", seafoamExitBoulder);
flag_to_func.set("lift_key", () => {
  return Items.has("Lift Key");
});
flag_to_func.set("good_rod", () => {
  return Items.has("Good Rod");
});
flag_to_func.set("!extra_strength_boulders", () => {
  return !Settings.ExtraBoulders;
});
flag_to_func.set("buy_poke_doll", pokeDollSkippable);
flag_to_func.set("hideout_key", () => {
  return Items.has("Hideout Key");
});
flag_to_func.set("can_surf", canSurf);
flag_to_func.set("super_rod", () => {
  return Items.has("Super Rod");
});
flag_to_func.set("poke_flute", () => {
  return Items.has("Poke Flute");
});
flag_to_func.set("fuji_saved", () => {
  return Items.has("Fuji Saved");
});
flag_to_func.set("has_bicycle", () => {
  return Items.has("Bicycle");
});
flag_to_func.set("rock_tunnel", canRockTunnel);
flag_to_func.set("old_man", () => {
  return Settings.OldMan === OldMan.None;
});
flag_to_func.set("help_bill", () => {
  return Items.has("Help Bill");
});
flag_to_func.set("victory_road_boulder", victoryRoadBoulder);
flag_to_func.set("plant_key", () => {
  return Items.has("Plant Key");
});
flag_to_func.set("!all_elevators_locked", () => {
  return !Settings.AllElevatorsLocked;
});
flag_to_func.set("cerulean_cave", canEnterCeruleanCave);
flag_to_func.set("can_strength", canStrength);
flag_to_func.set("safari_pass", () => {
  return Items.has("Safari Pass");
});
flag_to_func.set("card_key", (param: number) => {
  return cardKeyAccess(param);
});
flag_to_func.set("mansion_key", () => {
  return Items.has("Mansion Key");
});
flag_to_func.set("enter_elite_four", canEnterEliteFour);
flag_to_func.set("!extra_key_items", () => {
  return !Settings.ExtraKeyItems;
});
flag_to_func.set("route_3", canRoute3);
flag_to_func.set("secret_key", () => {
  return Items.has("Secret Key");
});
flag_to_func.set("old_rod", () => {
  return Items.has("Old Rod");
});
flag_to_func.set("can_pass_guards", canPassGuards);
flag_to_func.set("oak's_parcel", () => {
  return Items.has("Oak's Parcel");
});
flag_to_func.set("poke_doll_skip", () => {
  return Settings.PokeDollSkip;
});
flag_to_func.set("can_cut", canCut);
flag_to_func.set("ss_ticket", () => {
  return Items.has("S.S. Ticket");
});
flag_to_func.set("silph_scope", () => {
  return Items.has("Silph Scope");
});
flag_to_func.set("bicycle_skip", () => {
  return Settings.BicycleGateSkip;
});
flag_to_func.set("defeat_viridian_gym_giovanni", () => {
  return Items.has("Defeat Viridian Gym Giovanni");
});
flag_to_func.set("silph_co_liberated", () => {
  return Items.has("Silph Co Liberated");
});
flag_to_func.set("fossil_checks", (param: number) => {
  return enoughFossils(param);
});
flag_to_func.set("victory_road_gate_badges", canPassVictoryRoadGate);
flag_to_func.set("route_22_gate_badges", canPassRoute22Gate);
flag_to_func.set("viridian_gym_badges", canEnterViridianGym);

const takesParam = new Set(["fossil_checks", "card_key"]);

function setFlags(cnf: Array<Array<string>>, params: number): () => WarpAccessibility {
  // Does the CNF to logic magic, and uses flag_to_func
  function helper(): WarpAccessibility {
    for (const clause of cnf) {
      let satisfied = false;
      for (const expr of clause) {
        const func = flag_to_func.get(expr)!;
        if (takesParam.has(expr)) {
          satisfied = func(params);
        } else {
          satisfied = (func as () => boolean)();
        }
        if (satisfied) {
          break;
        }
      }
      if (!satisfied) {
        return WarpAccessibility.Inaccessible;
      }
    }
    return WarpAccessibility.Accessible;
  }
  return helper;
}

function generateConstantWarps(): Array<ConstantWarp> {
  const warps: Array<ConstantWarp> = [];
  for (const region of Object.keys(fakeWarpData)) {
    const regionData = fakeWarpData[region as keyof typeof fakeWarpData];
    for (const fields of regionData) {
      const oneWay = fields.one_way === "True";
      warps.push(
        new ConstantWarp(
          fields["from"],
          fields["to"],
          region,
          setFlags(fields.func, fields.parameter),
          oneWay
        )
      );
    }
  }
  return warps;
}

export const constantWarps: Array<ConstantWarp> = generateConstantWarps();
