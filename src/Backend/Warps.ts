import { OldMan } from "./Settings";
import {
  canCut,
  canSurf,
  canStrength,
  canRockTunnel,
  cardKeyAccess,
  canRoute3,
  canPassGuards,
  enoughFossils,
  pokeDollSkippable,
  canEnterCeruleanCave,
  canEnterEliteFour,
  victoryRoadBoulder,
  seafoamExitBoulder,
  canPassVictoryRoadGate,
  canPassRoute22Gate,
  canEnterViridianGym,
  canFlyTo,
} from "./Requirements";

import warpData from "../PokemonData/WarpData.json";
import fakeWarpData from "../PokemonData/FakeWarps.json";
import LogicState from "./LogicState";

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
  public linkedWarp: Warp | null = null;
  constructor(
    public fromWarp: string,
    public toWarp: string,
    public region: string,
    public coordinates: { x: number; y: number } | null,
    public state: LogicState
  ) {}

  equals(other: Warp) {
    return other.fromWarp === this.fromWarp && other.toWarp === this.toWarp;
  }

  updateAccessibility(): void {
    if (this.state.regions.has(this.region)) {
      this.accessibility = WarpAccessibility.Accessible;
    } else {
      this.accessibility = WarpAccessibility.Inaccessible;
    }
  }

  toString(): string {
    return this.fromWarp + " to " + this.toWarp;
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
    public state: LogicState,
    public flags: (state: LogicState) => WarpAccessibility
  ) {
    super(fromWarp, toWarp, region, null, state);
  }

  updateAccessibility(): void {
    if (this.state.regions.has(this.region)) {
      this.accessibility = this.flags(this.state);
    } else {
      this.accessibility = WarpAccessibility.Inaccessible;
    }
  }
}

let map = new Map();
map.set("1", 1);

export function generateWarps(state: LogicState): Array<Warp> {
  const warps: Array<Warp> = [];
  for (const region of Object.keys(warpData)) {
    const regionData = warpData[region as keyof typeof warpData];
    for (const sides of regionData) {
      warps.push(new Warp(sides["from"], sides["to"], region, sides.coordinates, state));
    }
  }
  return warps;
}

// export const warps: Array<Warp> = generateWarps(defaultState);

const flag_to_func: Map<string, ((state: LogicState) => boolean) | ((state: LogicState, param: number) => boolean)> = new Map();
flag_to_func.set("seafoam_exit_boulder", seafoamExitBoulder);
flag_to_func.set("lift_key", (state: LogicState) => {
  return state.items.has("Lift Key");
});
flag_to_func.set("good_rod", (state: LogicState) => {
  return state.items.has("Good Rod");
});
flag_to_func.set("!extra_strength_boulders", (state: LogicState) => {
  return !state.settings.ExtraBoulders;
});
flag_to_func.set("buy_poke_doll", pokeDollSkippable);
flag_to_func.set("hideout_key", (state: LogicState) => {
  return state.items.has("Hideout Key");
});
flag_to_func.set("can_surf", canSurf);
flag_to_func.set("super_rod", (state: LogicState) => {
  return state.items.has("Super Rod");
});
flag_to_func.set("poke_flute", (state: LogicState) => {
  return state.items.has("Poke Flute");
});
flag_to_func.set("fuji_saved", (state: LogicState) => {
  return state.items.has("Fuji Saved");
});
flag_to_func.set("has_bicycle", (state: LogicState) => {
  return state.items.has("Bicycle");
});
flag_to_func.set("rock_tunnel", canRockTunnel);
flag_to_func.set("old_man", (state: LogicState) => {
  return state.settings.OldMan === OldMan.None;
});
flag_to_func.set("help_bill", (state: LogicState) => {
  return state.items.has("Help Bill");
});
flag_to_func.set("victory_road_boulder", victoryRoadBoulder);
flag_to_func.set("plant_key", (state: LogicState) => {
  return state.items.has("Plant Key");
});
flag_to_func.set("!all_elevators_locked", (state: LogicState) => {
  return !state.settings.AllElevatorsLocked;
});
flag_to_func.set("cerulean_cave", canEnterCeruleanCave);
flag_to_func.set("can_strength", canStrength);
flag_to_func.set("safari_pass", (state: LogicState) => {
  return state.items.has("Safari Pass");
});
flag_to_func.set("card_key", (state: LogicState, param: number) => {
  return cardKeyAccess(param, state);
});
flag_to_func.set("can_fly_to", (state: LogicState, param: number) => {
  return canFlyTo(param, state);
});
flag_to_func.set("mansion_key", (state: LogicState) => {
  return state.items.has("Mansion Key");
});
flag_to_func.set("enter_elite_four", canEnterEliteFour);
flag_to_func.set("!extra_key_items", (state: LogicState) => {
  return !state.settings.ExtraKeyItems;
});
flag_to_func.set("route_3", canRoute3);
flag_to_func.set("secret_key", (state: LogicState) => {
  return state.items.has("Secret Key");
});
flag_to_func.set("old_rod", (state: LogicState) => {
  return state.items.has("Old Rod");
});
flag_to_func.set("can_pass_guards", canPassGuards);
flag_to_func.set("oak's_parcel", (state: LogicState) => {
  return state.items.has("Oak's Parcel");
});
flag_to_func.set("poke_doll_skip", (state: LogicState) => {
  return state.settings.PokeDollSkip;
});
flag_to_func.set("can_cut", (state: LogicState) => canCut(state));
flag_to_func.set("ss_ticket", (state: LogicState) => {
  return state.items.has("S.S. Ticket");
});
flag_to_func.set("silph_scope", (state: LogicState) => {
  return state.items.has("Silph Scope");
});
flag_to_func.set("bicycle_skip", (state: LogicState) => {
  return state.settings.BicycleGateSkip;
});
flag_to_func.set("defeat_viridian_gym_giovanni", (state: LogicState) => {
  return state.items.has("Defeat Viridian Gym Giovanni");
});
flag_to_func.set("silph_co_liberated", (state: LogicState) => {
  return state.items.has("Silph Co Liberated");
});
flag_to_func.set("fossil_checks", (state: LogicState, param: number) => {
  return enoughFossils(param, state);
});
flag_to_func.set("victory_road_gate_badges", canPassVictoryRoadGate);
flag_to_func.set("route_22_gate_badges", canPassRoute22Gate);
flag_to_func.set("viridian_gym_badges", canEnterViridianGym);

const takesParam = new Set(["fossil_checks", "card_key"]);

function setFlags(cnf: Array<Array<string>>, state: LogicState, params: number): (state: LogicState) => WarpAccessibility {
  // Does the CNF to logic magic, and uses flag_to_func
  function helper(): WarpAccessibility {
    for (const clause of cnf) {
      let satisfied = true;
      for (const expr of clause) {
        const func = flag_to_func.get(expr)!;
        if (takesParam.has(expr)) {
          satisfied = func(state, params);
        } else {
          satisfied = (func as (state: LogicState) => boolean)(state);
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

export function generateConstantWarps(state: LogicState): Array<ConstantWarp> {
  const warps: Array<ConstantWarp> = [];
  for (const region of Object.keys(fakeWarpData)) {
    const regionData = fakeWarpData[region as keyof typeof fakeWarpData];
    for (const fields of regionData) {
      const oneWay = fields.one_way === "True";
      warps.push(new ConstantWarp(fields["from"], fields["to"], region, state, setFlags(fields.func, state, fields.parameter)));
      if (!oneWay) {
        warps.push(
          new ConstantWarp(
            fields["to"],
            fields["from"],
            fields["to"], // could be wrong...
            state,
            setFlags(fields.func, state, fields.parameter)
          )
        );
      }
    }
  }
  return warps;
}

// export const constantWarps: Array<ConstantWarp> = generateConstantWarps(defaultState);
