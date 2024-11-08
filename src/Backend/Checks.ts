// What we need to know about each check:
//  1. Is check actually a check (Depends on Settings) -- Results in check not being added
//  2. Can check be physically reached (Depends on Graph) -- Means method of check must take Graph as parameter
//  3. Can check be received (Depends on items like Coin Case or events like Liberated Silph Co.)
//  4. Has check already been received (Depends on external input (player/arch))

import { Graph, Settings, Items, RandomizeHidden, Regions, CardKey } from "./GenerateGraph";
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
    public enableTrigger: () => boolean,
    public reachableTrigger: () => CheckAccessibility
  ) {
    this.updateCheckStatus();
  }

  public updateCheckStatus(): void {
    /**
     * Given the current items, settings, and accessible regions, update the current accessibility
     */
    this.enabled = this.enableTrigger();
    if (!this.region || Regions.has(this.region)) {
      this.accessibility = this.reachableTrigger();
    } else {
      this.accessibility = CheckAccessibility.Inaccessible;
    }
  }
}

// # tea = "tea"
// # trainersanity = "trainsersanity"
// # stonesanity = "stonesanity"
// # extra_key_items = "extra_key_items"
// # hidden_items = "hidden_items"
// # hidden_moon_stones = "hidden_moon_stones"
// # prizesanity = "prizesanity"
// # not_stonesanity = "not_stonesanity"
// # split_card_key = "split_card_key"

const incl_to_func: Map<string, () => boolean> = new Map();
incl_to_func.set("", () => {
  return true;
});
incl_to_func.set("tea", () => {
  return Settings.Tea;
});
incl_to_func.set("trainersanity", () => {
  return Settings.TrainerSanity > 0;
});
incl_to_func.set("stonesanity", () => {
  return Settings.StoneSanity;
});
incl_to_func.set("extra_key_items", () => {
  return Settings.ExtraKeyItems;
});
incl_to_func.set("hidden_items", () => {
  return Settings.RandomizeHidden === RandomizeHidden.Yes;
});
incl_to_func.set("hidden_moon_stones", () => {
  return Settings.RandomizeHidden === RandomizeHidden.Yes || Settings.StoneSanity;
});
incl_to_func.set("prizesanity", () => {
  return Settings.PrizeSanity;
});
incl_to_func.set("not_stonesanity", () => {
  return !Settings.StoneSanity;
});
incl_to_func.set("split_card_key", () => {
  return Settings.CardKey !== CardKey.Default;
});

const enabled_to_func: Map<string, () => boolean> = new Map();
enabled_to_func.set("oak's_parcel", () => {
  return Items.has("Oak's Parcel");
});
enabled_to_func.set("can_cut", canCut);
enabled_to_func.set("can_surf", canSurf);
enabled_to_func.set("can_strength", canStrength);
enabled_to_func.set("oak's_aide_route_2", () => {
  return oaksAidCheck(Settings.OaksAidRt2);
});
enabled_to_func.set("oak's_aide_route_11", () => {
  return oaksAidCheck(Settings.OaksAidRt11);
});
enabled_to_func.set("oak's_aide_route_15", () => {
  return oaksAidCheck(Settings.OaksAidRt15);
});
enabled_to_func.set("bike_voucher", () => {
  return Items.has("Bike Voucher");
});
enabled_to_func.set("fuji_saved", () => {
  return Items.has("Fuji Saved");
});
enabled_to_func.set("gold_teeth", () => {
  return Items.has("Gold Teeth");
});
enabled_to_func.set("buy_poke_doll", pokeDollSkippable);
enabled_to_func.set("coin_case", () => {
  return Items.has("Coin Case");
});
enabled_to_func.set("get_hidden_items", () => {
  return canGetHiddenItems();
});
enabled_to_func.set("game_corner", () => {
  return Regions.has("Game Corner");
}); // Likely wrong
enabled_to_func.set("silph_co_liberated", () => {
  return Items.has("Silph Co Liberated");
});
enabled_to_func.set("card_key_5", () => {
  return cardKeyAccess(5);
});
enabled_to_func.set("card_key_7", () => {
  return cardKeyAccess(7);
});
enabled_to_func.set("rock_tunnel", canRockTunnel);

function setAccessible(cnf: Array<Array<string>>): () => CheckAccessibility {
  function helper(): CheckAccessibility {
    for (const clause of cnf) {
      let satisfied = false;
      for (const expr of clause) {
        const func = enabled_to_func.get(expr)!;
        satisfied = (func as () => boolean)();
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

function generateChecks(): Array<Check> {
  const checks: Array<Check> = [];
  for (const check of checkData) {
    const checkReqName: string = check["region"] + " - " + check["name"];
    let reqFunc = () => {
      return CheckAccessibility.Accessible;
    };
    if (checkReq[checkReqName as keyof typeof checkReq]) {
      const cnf = checkReq[checkReqName as keyof typeof checkReq];
      reqFunc = setAccessible(cnf);
    }
    // TODO: change the location to the actual coordinates once the data is there
    checks.push(
      new Check(
        check["name"],
        check["region"],
        check["type"],
        { x: 0, y: 0 },
        incl_to_func.get(check["inclusion"])!,
        reqFunc
      )
    );
  }
  return checks;
}
export const checks: Array<Check> = generateChecks();

function generatePokemonChecks(): Array<Check> {
  const checks: Array<Check> = [];
  for (const poke of Object.keys(pokeData)) {
    checks.push(
      new Check(
        poke,
        null,
        "Pokemon",
        null,
        () => {
          return Settings.DexSanity > 0;
        },
        () => {
          return CheckAccessibility.Accessible;
        }
      )
    );
  }
  return checks;
}

export const pokeChecks: Array<Check> = generatePokemonChecks();
