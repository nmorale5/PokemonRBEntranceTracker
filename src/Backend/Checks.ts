// What we need to know about each check:
//  1. Is check actually a check (Depends on Settings) -- Results in check not being added
//  2. Can check be physically reached (Depends on Graph) -- Means method of check must take Graph as parameter
//  3. Can check be received (Depends on items like Coin Case or events like Liberated Silph Co.)
//  4. Has check already been received (Depends on external input (player/arch))

import {Graph, Settings, Items, RandomizeHidden, Regions, CardKey} from "./GenerateGraph"
import checkData from "./CheckData.json";
import checkReq from "./CheckReq.json";
import pokeData from "./Pokemon.json";
import { canCut, canGetHiddenItems, canRockTunnel, canStrength, canSurf, cardKeyAccess, oaksAidCheck, pokeDollSkippable } from "./Requirements";

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
    public accessibility : CheckAccessibility = CheckAccessibility.Inaccessible;
    public enabled : boolean = false;
    public acquired : boolean = false;

    public constructor (public name: string, public region: string | null, public type: string, 
        public coordinates: {x: number, y: number} | null, public enableTrigger: () => boolean,
        public reachableTrigger: () => CheckAccessibility,
    ) {
        this.updateCheckStatus();
    }

    public updateCheckStatus() : void {
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

const incl_to_func : Map<string, () => boolean> = new Map();
incl_to_func.set("", () => {return true});
incl_to_func.set("tea", () => {return Settings.Tea});
incl_to_func.set("trainersanity", () => {return Settings.TrainerSanity > 0});
incl_to_func.set("stonesanity", () => {return Settings.StoneSanity});
incl_to_func.set("extra_key_items", () => {return Settings.ExtraKeyItems});
incl_to_func.set("hidden_items", () => {return Settings.RandomizeHidden === RandomizeHidden.Yes});
incl_to_func.set("hidden_moon_stones", () => {return Settings.RandomizeHidden === RandomizeHidden.Yes || Settings.StoneSanity});
incl_to_func.set("prizesanity", () => {return Settings.PrizeSanity});
incl_to_func.set("not_stonesanity", () => {return !Settings.StoneSanity});
incl_to_func.set("split_card_key", () => {return Settings.CardKey !== CardKey.Default});

const enabled_to_func : Map<string, () => boolean> = new Map();
enabled_to_func.set("oak's_parcel", () => {return Items.has("Oak's Parcel")});
enabled_to_func.set("can_cut", canCut);
enabled_to_func.set("can_surf", canSurf);
enabled_to_func.set("can_strength", canStrength);
enabled_to_func.set("oak's_aide_route_2", () => {return oaksAidCheck(Settings.OaksAidRt2)});
enabled_to_func.set("oak's_aide_route_11", () => {return oaksAidCheck(Settings.OaksAidRt11)});
enabled_to_func.set("oak's_aide_route_15", () => {return oaksAidCheck(Settings.OaksAidRt15)});
enabled_to_func.set("bike_voucher", () => {return Items.has("Bike Voucher")});
enabled_to_func.set("fuji_saved", () => {return Items.has("Fuji Saved")});
enabled_to_func.set("gold_teeth", () => {return Items.has("Gold Teeth")});
enabled_to_func.set("buy_poke_doll", pokeDollSkippable);
enabled_to_func.set("coin_case", () => {return Items.has("Coin Case")});
enabled_to_func.set("get_hidden_items", () => {return canGetHiddenItems()});
enabled_to_func.set("game_corner", () => {return Regions.has("Game Corner")}); // Likely wrong
enabled_to_func.set("silph_co_liberated", () => {return Items.has("Silph Co Liberated")});
enabled_to_func.set("card_key_5", () => {return cardKeyAccess(5)});
enabled_to_func.set("card_key_7", () => {return cardKeyAccess(7)});
enabled_to_func.set("rock_tunnel", canRockTunnel);

function setAccessible(cnf: Array<Array<string>>): () => CheckAccessibility {
    function helper() : CheckAccessibility {
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

function generateChecks() : Array<Check> {
    const checks : Array<Check> = [];
    for (const check of checkData) {
        const checkReqName : string = check["region"] + " - " + check["name"];
        let reqFunc = () => {return CheckAccessibility.Accessible};
        if (checkReq[checkReqName as keyof typeof checkReq]) {
            const cnf = checkReq[checkReqName as keyof typeof checkReq];
            reqFunc = setAccessible(cnf);
        }
        // TODO: change the location to the actual coordinates once the data is there
        checks.push(new Check(check["name"], check["region"], check["type"], {x: 0, y: 0},
             incl_to_func.get(check["inclusion"])!, reqFunc));
    }
    return checks;
}
export const checks : Array<Check> = generateChecks();

function generatePokemonChecks() : Array<Check> {
    const checks : Array<Check> = [];
    for (const poke of Object.keys(pokeData)) {
        checks.push(new Check(poke, null, "Pokemon", null, 
            () => {return Settings.DexSanity > 0}, 
            () => {return CheckAccessibility.Accessible}
        ));
    }
    return checks;
}

export const pokeChecks : Array<Check> = generatePokemonChecks();






// // TODO: Mapping of string names of checks to Check objects
// export const checks : Map<string, Check> = new Map();

// // Checks that are in every game
// checks.set("Fishing Guru", new Check("Vermillion Old Rod House", CheckType.Basic));
// checks.set("Fishing Guru's Brother", new Check("Fushsia Good Rod House", CheckType.Basic));
// checks.set("Fishing Guru's Brother 2", new Check("Route 12 Super Rod House", CheckType.Basic));
// checks.set("Player's PC", new Check("Player's House 2F", CheckType.Basic));
// checks.set("Rival's Sister", new Check("Rival's House", CheckType.Basic));
// checks.set("Oak's Post-Route-22-Rival Gift", new Check("Oak's Lab", CheckType.Basic));
// checks.set("Free Sample Man", new Check("Route 1", CheckType.Basic));
// checks.set("Sleepy Guy", new Check("Viridian City", CheckType.Basic));
// checks.set("Item for Oak", new Check("Viridian Pokemart", CheckType.Basic));
// checks.set("Giovanni's TM", new Check("Viridian Gym", CheckType.Basic));
// checks.set("Oak's Aide", new Check("Route 2 Gate", CheckType.Basic));
// checks.set("Pewter Museum Scientist", new Check("Pewter Museum 1F-E", CheckType.Basic));
// checks.set("Brock TM", new Check("Pewter Gym", CheckType.Basic));
// checks.set("Bicycle", new Check("Cerulean Bicycle Shop", CheckType.Basic));
// checks.set("Misty TM", new Check("Cerulean Gym", CheckType.Basic));
// checks.set("Nugget Bridge", new Check("Route 24", CheckType.Basic));
// checks.set("Bill", new Check("Bill's House", CheckType.Basic));
// checks.set("Mr. Fuji", new Check("Lavender Mr. Fuji's House", CheckType.Basic));
// checks.set("Mourning Girl", new Check("Route 12 Gate 2F", CheckType.Basic));
// checks.set("Fan Club President", new Check("Vermillion Pokemon Fan Club", CheckType.Basic));
// checks.set("Lt. Surge TM", new Check("Vermillion Gym", CheckType.Basic));
// checks.set("Captain", new Check("S.S. Anne Captain's Room", CheckType.Basic));
// checks.set("Oak's Aide 2", new Check("Route 11 Gate 2F", CheckType.Basic));
// checks.set("Stranded Man", new Check("Celadon City", CheckType.Basic));
// checks.set("Thirsty Girl Gets Water", new Check("Celadon Department Store Roof", CheckType.Basic));
// checks.set("Thirsty Girl Gets Soda", new Check("Celadon Department Store Roof", CheckType.Basic));
// checks.set("Thirsty Girl Gets Lemonade", new Check("Celadon Department Store Roof", CheckType.Basic));
// checks.set("Counter Man", new Check("Celadon Department Store 3F", CheckType.Basic));
// checks.set("Gambling Addict", new Check("Celadon Diner", CheckType.Basic));
// checks.set("Erika TM", new Check("Celadon Gym-C", CheckType.Basic));
// checks.set("Silph Co President", new Check("Silph Co 11F-C", CheckType.Basic));
// checks.set("Silph 2F Woman", new Check("Silph Co 2F-NW", CheckType.Basic));
// checks.set("Fly House Woman", new Check("Route 16 Fly House", CheckType.Basic));
// checks.set("Oak's Aide 3", new Check("Route 15 Gate 2F", CheckType.Basic));
// checks.set("Safari Zone Warden", new Check("Fuchsia Warden's House", CheckType.Basic));
// checks.set("Koga TM", new Check("Fuchsia Gym", CheckType.Basic));
// checks.set("Secret House Reward", new Check("Safari Zone Secret House", CheckType.Basic));
// checks.set("Cinnabar Lab Scientist", new Check("Cinnabar Lab R&D Room", CheckType.Basic));
// checks.set("Blaine TM", new Check("Cinnabar Gym", CheckType.Basic));
// checks.set("Copycat", new Check("Saffron Copycat's House 2F", CheckType.Basic));
// checks.set("Mr. Psychic", new Check("Saffron Mr. Psychic's House", CheckType.Basic));
// checks.set("Sabrina TM", new Check("Saffron Gym-C", CheckType.Basic));
// checks.set("Fossil A", new Check("Fossil", CheckType.Basic)); // THIS MIGHT BREAK
// checks.set("Fossil B", new Check("Fossil", CheckType.Basic)); // THIS ONE TOO
// checks.set("Rocket Thief", new Check("Cerulean City-Outskirts", CheckType.Basic));
// checks.set("Route 2-SE South Item", new Check("Route 2-SE", CheckType.Basic));
// checks.set("Route 2-SE North Item", new Check("Route 2-SE", CheckType.Basic));
// checks.set("Route 4-C Item", new Check("Route 4-C", CheckType.Basic));
// checks.set("Route 9 Item", new Check("Route 9", CheckType.Basic));
// checks.set("Route 12 Island Item", new Check("Route 12-N", CheckType.Basic));
// checks.set("Item Behind Cuttable Tree", new Check("Route 12-Grass", CheckType.Basic));
// checks.set("Route 15-N Item", new Check("Route 15-N", CheckType.Basic));
// checks.set("Route 24 Item", new Check("Route 24", CheckType.Basic));
// checks.set("Route 25 Item", new Check("Route 25", CheckType.Basic));
// checks.set("Viridian Gym Item", new Check("Viridian Gym", CheckType.Basic));
// checks.set("Cerulean Cave 1F SW Item", new Check("Cerulean Cave 1F-Water", CheckType.Basic));
// checks.set("Cerulean Cave 1F NE Item", new Check("Cerulean Cave 1F-Water", CheckType.Basic));
// checks.set("Cerulean Cave 1F NW Item", new Check("Cerulean Cave 1F-N", CheckType.Basic));
// checks.set("Pokemon Tower 3F North Item", new Check("Pokemon Tower 3F", CheckType.Basic));
// checks.set("Pokemon Tower 4F East Item", new Check("Pokemon Tower 4F", CheckType.Basic));
// checks.set("Pokemon Tower 4F West Item", new Check("Pokemon Tower 4F", CheckType.Basic));
// checks.set("Pokemon Tower 4F South Item", new Check("Pokemon Tower 4F", CheckType.Basic));
// checks.set("Pokemon Tower 5F SW Item", new Check("Pokemon Tower 5F", CheckType.Basic));
// checks.set("Pokemon Tower 6F West Item", new Check("Pokemon Tower 6F", CheckType.Basic));
// checks.set("Pokemon Tower 6F SE Item", new Check("Pokemon Tower 6F", CheckType.Basic));
// checks.set("Behind Boulder Item", new Check("Fuchsia Warden's House", CheckType.Basic)); // Does not require strength???
// checks.set("Pokemon Mansion 1F North Item", new Check("Pokemon Mansion 1F", CheckType.Basic));
// checks.set("Pokemon Mansion 1F South Item", new Check("Pokemon Mansion 1F-SE", CheckType.Basic));
// checks.set("Power Plant SW Item", new Check("Power Plant", CheckType.Basic));
// checks.set("Power Plant North Item", new Check("Power Plant", CheckType.Basic));
// checks.set("Power Plant NE Item", new Check("Power Plant", CheckType.Basic));
// checks.set("Power Plant SE Item", new Check("Power Plant", CheckType.Basic));
// checks.set("Power Plant South Item", new Check("Power Plant", CheckType.Basic));
// checks.set("Victory Road 2F NE Item", new Check("Victory Road 2F-C", CheckType.Basic));
// checks.set("Victory Road 2F East Item", new Check("Victory Road 2F-C", CheckType.Basic));
// checks.set("Victory Road 2F West Item", new Check("Victory Road 2F-W", CheckType.Basic));
// checks.set("Victory Road 2F North Item", new Check("Victory Road 2F-NW", CheckType.Basic));
// checks.set("Viridian Forest East Item", new Check("Viridian Forest", CheckType.Basic));
// checks.set("Viridian Forest NW Item", new Check("Viridian Forest", CheckType.Basic));
// checks.set("Viridian Forest SW Item", new Check("Viridian Forest", CheckType.Basic));
// checks.set("Mt Moon 1F West Item", new Check("Mt Moon 1F", CheckType.Basic));
// checks.set("Mt Moon 1F NW Item", new Check("Mt Moon 1F", CheckType.Basic));
// checks.set("Mt Moon 1F SE Item", new Check("Mt Moon 1F", CheckType.Basic));
// checks.set("Mt Moon 1F East Item", new Check("Mt Moon 1F", CheckType.Basic));
// checks.set("Mt Moon 1F South Item", new Check("Mt Moon 1F", CheckType.Basic));
// checks.set("Mt Moon 1F SW Item", new Check("Mt Moon 1F", CheckType.Basic));
// checks.set("Mt Moon B2F South Item", new Check("Mt Moon B2F-C", CheckType.Basic));
// checks.set("Mt Moon B2F North Item", new Check("Mt Moon B2F-NE", CheckType.Basic));
// checks.set("S.S. Anne 1F Rooms-Youngster and Lass Room Item", new Check("S.S. Anne 1F Rooms-Youngster and Lass Room", CheckType.Basic));
// checks.set("S.S. Anne 2F Rooms-Fisherman and Gentleman Room Item", new Check("S.S. Anne 2F Rooms-Fisherman and Gentleman Room", CheckType.Basic));
// checks.set("S.S. Anne 2F Rooms-Gentleman and Lass Room Item", new Check("S.S. Anne 2F Rooms-Gentleman and Lass Room", CheckType.Basic));
// checks.set("S.S. Anne B1F Rooms-East Single Sailor Room Item", new Check("S.S. Anne B1F Rooms-East Single Sailor Room", CheckType.Basic));
// checks.set("S.S. Anne B1F Rooms-West Single Sailor Room Item", new Check("S.S. Anne B1F Rooms-West Single Sailor Room", CheckType.Basic));
// checks.set("Machoke Room Item", new Check("S.S. Anne B1F Rooms-Machoke Room", CheckType.Basic));
// checks.set("Victory Road 3F NE Item", new Check("Victory Road 3F", CheckType.Basic));
// checks.set("Victory Road 3F NW Item", new Check("Victory Road 3F", CheckType.Basic));
// checks.set("Rocket Hideout B1F West Item", new Check("Rocket Hideout B1F", CheckType.Basic));
// checks.set("Rocket Hideout B1F SW Item", new Check("Rocket Hideout B1F-S", CheckType.Basic));
// checks.set("Rocket Hideout B2F NW Left Item", new Check("Rocket Hideout B2F", CheckType.Basic));
// checks.set("Rocket Hideout B2F NE Item", new Check("Rocket Hideout B2F", CheckType.Basic));
// checks.set("Rocket Hideout B2F NW Right Item", new Check("Rocket Hideout B2F", CheckType.Basic));
// checks.set("Rocket Hideout B2F SW Item", new Check("Rocket Hideout B2F", CheckType.Basic));
// checks.set("Rocket Hideout B3F East Item", new Check("Rocket Hideout B3F", CheckType.Basic));
// checks.set("Rocket Hideout B3F Center Item", new Check("Rocket Hideout B3F", CheckType.Basic));
// checks.set("Rocket Hideout B4F West Item", new Check("Rocket Hideout B4F-NW", CheckType.Basic));
// checks.set("Rocket Hideout B4F NW Item", new Check("Rocket Hideout B4F-NW", CheckType.Basic));
// checks.set("Rocket Hideout B4F SW Item", new Check("Rocket Hideout B4F", CheckType.Basic));
// checks.set("Rocket Hideout B4F Giovanni", new Check("Rocket Hideout B4F", CheckType.Basic));
// checks.set("Rocket Hideout B4F Rocket Grunt", new Check("Rocket Hideout B4F-NW", CheckType.Basic));
// checks.set("Silph Co 3F Item", new Check("Silph Co 3F-W", CheckType.Basic));
// checks.set("Silph Co 4F Left Item", new Check("Silph Co 4F-W", CheckType.Basic));
// checks.set("Silph Co 4F Middle Item", new Check("Silph Co 4F-W", CheckType.Basic));
// checks.set("Silph Co 4F Right Item", new Check("Silph Co 4F-W", CheckType.Basic));
// checks.set("Silph Co 5F SW Item", new Check("Silph Co 5F-SW", CheckType.Basic));
// checks.set("Silph Co 5F NW Item", new Check("Silph Co 5F-NW", CheckType.Basic));
// checks.set("Silph Co 5F SE Item", new Check("Silph Co 5F", CheckType.Basic));
// checks.set("Silph Co 6F SW Top Item", new Check("Silph Co 6F-SW", CheckType.Basic));
// checks.set("Silph Co 6F SW Bottom Item", new Check("Silph Co 6F-SW", CheckType.Basic));
// checks.set("Silph Co 7F West Item", new Check("Silph Co 7F", CheckType.Basic));
// checks.set("Silph Co 7F East Item", new Check("Silph Co 7F-E", CheckType.Basic));
// checks.set("Silph Co 10F Left Item", new Check("Silph Co 10F", CheckType.Basic));
// checks.set("Silph Co 10F Bottom Item", new Check("Silph Co 10F", CheckType.Basic));
// checks.set("Silph Co 10F Right Item", new Check("Silph Co 10F", CheckType.Basic));
// checks.set("Pokemon Mansion 2F NE Item", new Check("Pokemon Mansion 2F", CheckType.Basic));
// checks.set("Pokemon Mansion 3F SW Item", new Check("Pokemon Mansion 3F-SW", CheckType.Basic));
// checks.set("Pokemon Mansion 3F NE Item", new Check("Pokemon Mansion 3F", CheckType.Basic));
// checks.set("Pokemon Mansion BF1 North Item", new Check("Pokemon Mansion B1F", CheckType.Basic));
// checks.set("Pokemon Mansion BF1 SW Item", new Check("Pokemon Mansion B1F", CheckType.Basic));
// checks.set("Pokemon Mansion BF1 South Item", new Check("Pokemon Mansion B1F", CheckType.Basic));
// checks.set("Pokemon Mansion BF1 NW Item", new Check("Pokemon Mansion B1F", CheckType.Basic));
// checks.set("Pokemon Mansion BF1 West Item", new Check("Pokemon Mansion B1F", CheckType.Basic));
// checks.set("Pokemon Mansion BF1 North Item", new Check("Pokemon Mansion B1F", CheckType.Basic));
// checks.set("Safari Zone East West Item", new Check("Safari Zone East", CheckType.Basic));
// checks.set("Safari Zone East Center Item", new Check("Safari Zone East", CheckType.Basic));
// checks.set("Safari Zone East East Item", new Check("Safari Zone East", CheckType.Basic));
// checks.set("Safari Zone East NE Item", new Check("Safari Zone East", CheckType.Basic));
// checks.set("Safari Zone North NE Item", new Check("Safari Zone North", CheckType.Basic));
// checks.set("Safari Zone North North Item", new Check("Safari Zone North", CheckType.Basic));
// checks.set("Safari Zone West SW Item", new Check("Safari Zone West", CheckType.Basic));
// checks.set("Safari Zone West SE Item", new Check("Safari Zone West", CheckType.Basic));
// checks.set("Safari Zone West NW Item", new Check("Safari Zone West-NW", CheckType.Basic));
// checks.set("Safari Zone West NE Item", new Check("Safari Zone West-NW", CheckType.Basic));
// checks.set("Safari Zone Center Island Item", new Check("Safari Zone Center-C", CheckType.Basic));
// checks.set("Cerulean Cave 2F East Item", new Check("Cerulean Cave 2F-E", CheckType.Basic));
// checks.set("Cerulean Cave 2F SW Item", new Check("Cerulean Cave 2F-W", CheckType.Basic));
// checks.set("Cerulean Cave 2F North Item", new Check("Cerulean Cave 2F-N", CheckType.Basic));
// checks.set("Cerulean Cave B1F Center Item", new Check("Cerulean Cave B1F", CheckType.Basic));
// checks.set("Cerulean Cave B1F North Item", new Check("Cerulean Cave B1F", CheckType.Basic));
// checks.set("Victory Road 1F Top Item", new Check("Victory Road 1F", CheckType.Basic));
// checks.set("Victory Road 1F Left Item", new Check("Victory Road 1F", CheckType.Basic));
// checks.set("Brock Prize", new Check("Pewter Gym", CheckType.Basic));
// checks.set("Misty Prize", new Check("Cerulean Gym", CheckType.Basic));
// checks.set("Lt. Surge Prize", new Check("Vermillion Gym", CheckType.Basic));
// checks.set("Erika Prize", new Check("Celadon Gym", CheckType.Basic));
// checks.set("Koga Prize", new Check("Fuchsia Gym", CheckType.Basic));
// checks.set("Sabrina Prize", new Check("Saffron Gym", CheckType.Basic));
// checks.set("Blaine Prize", new Check("Cinnabar Gym", CheckType.Basic));
// checks.set("Giovanni Prize", new Check("Viridian Gym", CheckType.Basic));
// checks.set("Oak's Parcel Reward", new Check("Oak's Lab", CheckType.Basic));

// if (Settings.RandomizeHidden === RandomizeHidden.Yes || Settings.StoneSanity) {
//     checks.set("Mt Moon B2F Hidden Item Dead End Before Fossils", new Check("Mt Moon B2F", CheckType.Hidden));
//     checks.set("Pokemon Mansion 1F Hidden Item Block Near Entrance Carpet", new Check("Pokemon Mansion 1F", CheckType.Hidden));
// }

// if (Settings.RandomizeHidden === RandomizeHidden.Yes) {
//     checks.set("Viridian Forest Hidden Item NW by Trainer", new Check("Viridian Forest", CheckType.Hidden));
//     checks.set("Viridian Forest Hidden Item Entrance Tree", new Check("Viridian Forest", CheckType.Hidden));
//     checks.set("Route 25 Hidden Item Fence Outside Bill's House", new Check("Route 25", CheckType.Hidden));
//     checks.set("Route 9 Hidden Item Bush By Grass", new Check("Route 9", CheckType.Hidden));
//     checks.set("S.S. Anne Kitchen Hidden Item Trash", new Check("S.S. Anne Kitchen", CheckType.Hidden));
//     checks.set("S.S. Anne B1F Rooms-Fisherman Room Hidden Item Under Pillow", new Check("S.S. Anne B1F Rooms-Fisherman Room", CheckType.Hidden));
//     checks.set("S.S. Anne Kitchen Hidden Item Trash", new Check("S.S. Anne Kitchen", CheckType.Hidden));
//     checks.set("Route 10 Hidden Item Behind Rock Tunnel Entrance Cuttable Tree", new Check("Route 10-N", CheckType.Hidden));
//     checks.set("Route 10 Hidden Item Bush", new Check("Route 10-S", CheckType.Hidden));
//     checks.set("Rocket Hideout B1F Hidden Item Pot Plant", new Check("Rocket Hideout B1F", CheckType.Hidden));
//     checks.set("Rocket Hideout B3F Hidden Item Near East Item", new Check("Rocket Hideout B3F", CheckType.Hidden));
//     checks.set("Rocket Hideout B4F Hidden Item Behind Giovanni", new Check("Rocket Hideout B4F", CheckType.Hidden));
//     checks.set("Pokemon Tower 5F Hidden Item Near West Staircase", new Check("Pokemon Tower 5F", CheckType.Hidden));
//     checks.set("Route 13 Hidden Item Dead End Bush", new Check("Route 13", CheckType.Hidden));
//     checks.set("Route 13 Hidden Item Dead End By Water Corner", new Check("Route 13", CheckType.Hidden));
//     checks.set("Pokemon Mansion B1F Hidden Item Secret Key Room Corner", new Check("Pokemon Mansion B1F", CheckType.Hidden));
//     checks.set("Safari Zone West Hidden Item Secret House Statue", new Check("Safari Zone West-NW", CheckType.Hidden));
//     checks.set("Silph Co 5F Hidden Item Pot Plant", new Check("Silph Co 5F", CheckType.Hidden));
//     checks.set("Silph Co 9F Hidden Item Nurse Bed", new Check("Silph Co 9F-SW", CheckType.Hidden));
//     checks.set("Saffron Copycat's House 2F Hidden Item Desk", new Check("Saffron Copycat's House 2F", CheckType.Hidden));
//     checks.set("Cerulean Cave 1F Hidden Item Center Rocks", new Check("Cerulean Cave 1F-SW", CheckType.Hidden));
//     checks.set("Cerulean Cave B1F Hidden Item NE Rocks", new Check("Cerulean Cave B1F-E", CheckType.Hidden));
//     checks.set("Power Plant Hidden Item Center Dead End", new Check("Power Plant", CheckType.Hidden));
//     checks.set("Power Plant Hidden Item Before Zapdos", new Check("Power Plant", CheckType.Hidden));
//     checks.set("Seafoam Islands B2F Hidden Item Rock", new Check("Seafoam Islands B2F-NW", CheckType.Hidden));
//     checks.set("Seafoam Islands B4F Hidden Item Corner Island", new Check("Seafoam Islands B4F-W", CheckType.Hidden));
//     checks.set("Pokemon Mansion 3F Hidden Item Behind Burglar", new Check("Pokemon Mansion 3F-SW", CheckType.Hidden));
//     checks.set("Route 23 Hidden Item Rocks Before Victory Road", new Check("Route 23-Grass", CheckType.Hidden));
//     checks.set("Route 23 Hidden Item East Bush After Water", new Check("Route 23-Grass", CheckType.Hidden));
//     checks.set("Route 23 Hidden Item On Island", new Check("Route 23-S", CheckType.Hidden));
//     checks.set("Victory Road 2F Hidden Item Rock Before Moltres", new Check("Victory Road 2F-NW", CheckType.Hidden));
//     checks.set("Victory Road 2F Hidden Item Rock In Final Room", new Check("Victory Road 2F-E", CheckType.Hidden));
//     checks.set("Viridian City Hidden Item Cuttable Tree", new Check("Viridian City", CheckType.Hidden));
//     checks.set("Route 11 Hidden Item Isolated Bush Near Gate", new Check("Route 11", CheckType.Hidden));
//     checks.set("Route 12 Hidden Item Bush Near Gate", new Check("Route 12-W", CheckType.Hidden));
//     checks.set("Route 17 Hidden Item In Grass", new Check("Route 17", CheckType.Hidden));
//     checks.set("Route 17 Hidden Item Near Northernmost Sign", new Check("Route 17", CheckType.Hidden));
//     checks.set("Route 17 Hidden Item East Center", new Check("Route 17", CheckType.Hidden));
//     checks.set("Route 17 Hidden Item West Center", new Check("Route 17", CheckType.Hidden));
//     checks.set("Route 17 Hidden Item Before Final Bridge", new Check("Route 17", CheckType.Hidden));
//     checks.set("Underground Path North South Hidden Item Near Northern Stairs", new Check("Underground Path North South", CheckType.Hidden));
//     checks.set("Underground Path North South Hidden Item Near Southern Stairs", new Check("Underground Path North South", CheckType.Hidden));
//     checks.set("Underground Path West East Hidden Item West", new Check("Underground Path West East", CheckType.Hidden));
//     checks.set("Underground Path West East Hidden Item East", new Check("Underground Path West East", CheckType.Hidden));
//     checks.set("Celadon City Hidden Item Dead End Near Cuttable Tree", new Check("Celadon City", CheckType.Hidden));
//     checks.set("Route 25 Hidden Item NE Of Grass", new Check("Route 25", CheckType.Hidden));
//     checks.set("Mt Moon B2F Hidden Item Lone Rock", new Check("Mt Moon B2F-NE", CheckType.Hidden));
//     checks.set("Seafoam Islands B3F Hidden Item Rock", new Check("Seafoam Islands B3F", CheckType.Hidden));
//     checks.set("Vermillion City Hidden Item In Water Near Fan Club", new Check("Vermillion City", CheckType.Hidden));
//     checks.set("Cerulean City Hidden Item Gym Badge Guy's Backyard", new Check("Cerulean City-Badge House Backyard", CheckType.Hidden));
//     checks.set("Route 4 Hidden Item Plateau East Of My Moon", new Check("Route 4-C", CheckType.Hidden));
// }   

// if (Settings.ExtraKeyItems) {
//     checks.set("Rock Tunnel B1F SW Item", new Check("Rock Tunnel B1F-E", CheckType.Basic));
//     checks.set("Rock Tunnel B1F West Item", new Check("Rock Tunnel B1F-W", CheckType.Basic));
//     checks.set("Rock Tunnel B1F NW Item", new Check("Rock Tunnel B1F-W", CheckType.Basic));
//     checks.set("Rock Tunnel B1F North Item", new Check("Rock Tunnel B1F-W", CheckType.Basic));
// }

// if (Settings.Tea) {
//     checks.set("Mansion Lady", new Check("Celadon Mansion 1F", CheckType.Basic));
// }


