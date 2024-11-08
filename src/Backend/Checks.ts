// What we need to know about each check:
//  1. Is check actually a check (Depends on Settings) -- Results in check not being added
//  2. Can check be physically reached (Depends on Graph) -- Means method of check must take Graph as parameter
//  3. Can check be received (Depends on items like Coin Case or events like Liberated Silph Co.)
//  4. Has check already been received (Depends on external input (player/arch))

import { State, RandomizeHidden, CardKey, defaultState } from "./GenerateGraph";
import checkData from "../PokemonData/CheckData.json";
import checkReq from "../PokemonData/CheckReq.json";
import pokeData from "../PokemonData/Pokemon.json";
import {
  canCut,
  canGetHiddenItems,
  canRockTunnel,
  canStrength,
  canSurf,
  cardKeyAccess,
  oaksAidCheck,
  pokeDollSkippable,
} from "./Requirements";

export enum CheckAccessibility {
  "Inaccessible",
  "Accessible",
  "Other",
}

export class Check {
  /**
   * A class which represents a receivable check in an archipelago of Pokemon R/B.
   *
   * Credit to https://github.com/ArchipelagoMW/Archipelago/blob/main/worlds/pokemon_rb
   */
  public accessibility: CheckAccessibility = CheckAccessibility.Inaccessible;
  public enabled: boolean = false;
  public acquired: boolean = false;

  public constructor(
    public name: string,
    public region: string | null,
    public type: string,
    public coordinates: { x: number; y: number } | null,
    public state: State,
    public enableTrigger: (state: State) => boolean,
    public reachableTrigger: (state: State) => CheckAccessibility
  ) {
    this.updateCheckStatus();
  }

  public updateCheckStatus(): void {
    /**
     * Given the current items, settings, and accessible regions, update the current accessibility
     */
    this.enabled = this.enableTrigger(this.state);
    if (!this.region || this.state.regions.has(this.region)) {
      this.accessibility = this.reachableTrigger(this.state);
    } else {
      this.accessibility = CheckAccessibility.Inaccessible;
    }
  }
}

const incl_to_func: Map<string, (state: State) => boolean> = new Map(); // 558
incl_to_func.set("", (state: State) => {
  // 161, 162, 479, 483, 544, 546, 549, 558
  return true;
});
incl_to_func.set("tea", (state: State) => {
  // 1
  return state.settings.Tea;
});
incl_to_func.set("trainersanity", (state: State) => {
  // 317
  return state.settings.TrainerSanity > 0;
});
incl_to_func.set("stonesanity", (state: State) => {
  // 0?
  return state.settings.StoneSanity;
});
incl_to_func.set("extra_key_items", (state: State) => {
  // 4
  return state.settings.ExtraKeyItems;
});
incl_to_func.set("hidden_items", (state: State) => {
  // 61
  return state.settings.RandomizeHidden === RandomizeHidden.Yes;
});
incl_to_func.set("hidden_moon_stones", (state: State) => {
  // 2
  return state.settings.RandomizeHidden === RandomizeHidden.Yes || state.settings.StoneSanity;
});
incl_to_func.set("prizesanity", (state: State) => {
  // 3
  return state.settings.PrizeSanity;
});
incl_to_func.set("not_stonesanity", (state: State) => {
  // 0?
  return !state.settings.StoneSanity;
});
incl_to_func.set("split_card_key", (state: State) => {
  // 9
  return state.settings.CardKey !== CardKey.Default;
});
const enabled_to_func: Map<string, (state: State) => boolean> = new Map();
enabled_to_func.set("oak's_parcel", (state: State) => {
  return state.items.has("Oak's Parcel");
});
enabled_to_func.set("can_cut", canCut);
enabled_to_func.set("can_surf", canSurf);
enabled_to_func.set("can_strength", canStrength);
enabled_to_func.set("oak's_aide_route_2", (state: State) => {
  return oaksAidCheck(state.settings.OaksAidRt2, state);
});
enabled_to_func.set("oak's_aide_route_11", (state: State) => {
  return oaksAidCheck(state.settings.OaksAidRt11, state);
});
enabled_to_func.set("oak's_aide_route_15", (state: State) => {
  return oaksAidCheck(state.settings.OaksAidRt15, state);
});
enabled_to_func.set("bike_voucher", (state: State) => {
  return state.items.has("Bike Voucher");
});
enabled_to_func.set("fuji_saved", (state: State) => {
  return state.items.has("Fuji Saved");
});
enabled_to_func.set("gold_teeth", (state: State) => {
  return state.items.has("Gold Teeth");
});
enabled_to_func.set("buy_poke_doll", pokeDollSkippable);
enabled_to_func.set("coin_case", (state: State) => {
  return state.items.has("Coin Case");
});
enabled_to_func.set("get_hidden_items", (state: State) => {
  return canGetHiddenItems(state);
});
enabled_to_func.set("game_corner", (state: State) => {
  return state.regions.has("Game Corner");
}); // Likely wrong
enabled_to_func.set("silph_co_liberated", (state: State) => {
  return state.items.has("Silph Co Liberated");
});
enabled_to_func.set("card_key_5", (state: State) => {
  return cardKeyAccess(5, state);
});
enabled_to_func.set("card_key_7", (state: State) => {
  return cardKeyAccess(7, state);
});
enabled_to_func.set("rock_tunnel", canRockTunnel);

function setAccessible(cnf: Array<Array<string>>): (state: State) => CheckAccessibility {
  function helper(state: State): CheckAccessibility {
    for (const clause of cnf) {
      let satisfied = true;
      for (const expr of clause) {
        const func = enabled_to_func.get(expr)!;
        satisfied = (func as (state: State) => boolean)(state);
        if (satisfied) {
          break;
        }
      }
      if (!satisfied) {
        return CheckAccessibility.Inaccessible;
      }
    }
    return CheckAccessibility.Accessible;
  }
  return helper;
}

export function generateChecks(state: State): Array<Check> {
  const checks: Array<Check> = [];
  for (const check of checkData) {
    const checkReqName: string = check["region"] + " - " + check["name"];
    let reqFunc = (state: State) => {
      return CheckAccessibility.Accessible;
    };
    if (checkReq[checkReqName as keyof typeof checkReq]) {
      const cnf = checkReq[checkReqName as keyof typeof checkReq];
      reqFunc = setAccessible(cnf);
    }
    checks.push(
      new Check(
        check["name"],
        check["region"],
        check["type"],
        check["coordinates"],
        state,
        incl_to_func.get(check["inclusion"])!,
        reqFunc
      )
    );
  }
  return checks;
}
// export const checks: Array<Check> = generateChecks(defaultState);

export function generatePokemonChecks(state: State): Array<Check> {
  const checks: Array<Check> = [];
  for (const poke of Object.keys(pokeData)) {
    checks.push(
      new Check(
        poke,
        null,
        "Pokemon",
        null,
        state,
        () => {
          return state.settings.DexSanity > 0;
        },
        () => {
          return CheckAccessibility.Accessible;
        }
      )
    );
  }
  return checks;
}

// export const pokeChecks: Array<Check> = generatePokemonChecks(defaultState);
