import { RandomizeHidden, CardKey } from "./Settings";
import checkData from "../PokemonData/CheckData.json";
import checkReq from "../PokemonData/CheckReq.json";
import pokeData from "../PokemonData/Pokemon.json";
import { canCut, canGetHiddenItems, canRockTunnel, canStrength, canSurf, cardKeyAccess, oaksAidCheck, pokeDollSkippable } from "./Requirements";
import LogicState from "./LogicState";

const POKEDEX_ID_START = 172000549;
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
    public id: number,
    public coordinates: { x: number; y: number } | null,
    public state: LogicState,
    public enableTrigger: (state: LogicState) => boolean,
    public reachableTrigger: (state: LogicState) => CheckAccessibility
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

const incl_to_func: Map<string, (state: LogicState) => boolean> = new Map(); // 558
incl_to_func.set("", (state: LogicState) => {
  // 161, 162, 479, 483, 544, 546, 549, 558
  return true;
});
incl_to_func.set("tea", (state: LogicState) => {
  // 1
  return state.settings.Tea;
});
incl_to_func.set("trainersanity", (state: LogicState) => {
  // 317
  return state.settings.TrainerSanity > 0;
});
incl_to_func.set("stonesanity", (state: LogicState) => {
  // 0?
  return state.settings.StoneSanity;
});
incl_to_func.set("extra_key_items", (state: LogicState) => {
  // 4
  return state.settings.ExtraKeyItems;
});
incl_to_func.set("hidden_items", (state: LogicState) => {
  // 61
  return state.settings.RandomizeHidden === RandomizeHidden.Yes;
});
incl_to_func.set("can_get_hidden", (state: LogicState) => {
  // 61
  return state.settings.RandomizeHidden === RandomizeHidden.Yes;
});
incl_to_func.set("hidden_moon_stones", (state: LogicState) => {
  // 2
  return state.settings.RandomizeHidden === RandomizeHidden.Yes || state.settings.StoneSanity;
});
incl_to_func.set("prizesanity", (state: LogicState) => {
  // 3
  return state.settings.PrizeSanity;
});
incl_to_func.set("not_stonesanity", (state: LogicState) => {
  // 0?
  return !state.settings.StoneSanity;
});
incl_to_func.set("split_card_key", (state: LogicState) => {
  // 9
  return state.settings.CardKey !== CardKey.Default;
});
const enabled_to_func: Map<string, (state: LogicState) => boolean> = new Map();
enabled_to_func.set("oak's_parcel", (state: LogicState) => {
  return state.items.has("Oak's Parcel");
});
enabled_to_func.set("can_cut", canCut);
enabled_to_func.set("can_surf", canSurf);
enabled_to_func.set("can_strength", canStrength);
enabled_to_func.set("oak's_aid_rt_2", (state: LogicState) => {
  return oaksAidCheck(state.settings.OaksAidRt2, state);
});
enabled_to_func.set("oak's_aid_rt_11", (state: LogicState) => {
  return oaksAidCheck(state.settings.OaksAidRt11, state);
});
enabled_to_func.set("oak's_aid_rt_15", (state: LogicState) => {
  return oaksAidCheck(state.settings.OaksAidRt15, state);
});
enabled_to_func.set("bike_voucher", (state: LogicState) => {
  return state.items.has("Bike Voucher");
});
enabled_to_func.set("fuji_saved", (state: LogicState) => {
  return state.items.has("Fuji Saved");
});
enabled_to_func.set("gold_teeth", (state: LogicState) => {
  return state.items.has("Gold Teeth");
});
enabled_to_func.set("buy_poke_doll", pokeDollSkippable);
enabled_to_func.set("coin_case", (state: LogicState) => {
  return state.items.has("Coin Case");
});
enabled_to_func.set("hidden_items", (state: LogicState) => {
  return canGetHiddenItems(state);
});
enabled_to_func.set("can_get_hidden", (state: LogicState) => {
  return canGetHiddenItems(state);
});
enabled_to_func.set("game_corner", (state: LogicState) => {
  return state.regions.has("Game Corner");
}); // Likely wrong
enabled_to_func.set("silph_co_liberated", (state: LogicState) => {
  return state.items.has("Silph Co Liberated");
});
enabled_to_func.set("card_key_5", (state: LogicState) => {
  return cardKeyAccess(5, state);
});
enabled_to_func.set("card_key_7", (state: LogicState) => {
  return cardKeyAccess(7, state);
});
enabled_to_func.set("rock_tunnel", canRockTunnel);

function setAccessible(cnf: Array<Array<string>>): (state: LogicState) => CheckAccessibility {
  function helper(state: LogicState): CheckAccessibility {
    for (const clause of cnf) {
      let satisfied = true;
      for (const expr of clause) {
        const func: (state: LogicState) => boolean = enabled_to_func.get(expr)!;
        if (!func) {
          console.log(expr);
        }
        satisfied = func(state);
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

export function generateChecks(state: LogicState): Array<Check> {
  const checks: Array<Check> = [];
  for (const check of checkData) {
    const checkReqName: string = check["region"] + " - " + check["name"];
    let reqFunc = (state: LogicState) => {
      return CheckAccessibility.Accessible;
    };
    if (checkReq[checkReqName as keyof typeof checkReq]) {
      const cnf = checkReq[checkReqName as keyof typeof checkReq];
      reqFunc = setAccessible(cnf);
    }
    checks.push(new Check(check["name"], check["region"], check["type"], check["id"], check["coordinates"], state, incl_to_func.get(check["inclusion"])!, reqFunc));
  }
  return checks;
}

export function generatePokemonChecks(state: LogicState): Array<Check> {
  const checks: Array<Check> = [];
  let i = 0;
  for (const poke of Object.keys(pokeData)) {
    checks.push(
      new Check(
        poke,
        null,
        "Pokemon",
        POKEDEX_ID_START + i,
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
    i += 1;
  }
  return checks;
}

// export const pokeChecks: Array<Check> = generatePokemonChecks(defaultState);
