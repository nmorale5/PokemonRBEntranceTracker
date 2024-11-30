import { BadgeHMRequirement, Route3Req } from "./Settings";
import LogicState from "./LogicState";

// TODO: Implement workaround for Extra and Extra Plus HM Badge settings to allow user to manually indicate
// The ability to use an HM move

export const CITIES: Array<string> = [
  "Pallet Town",
  "Viridian City",
  "Pewter City",
  "Cerulean City",
  "Vermillion City",
  "Celadon City",
  "Lavender Town",
  "Fuchsia City",
  "Saffron City",
  "Cinnabar Island",
  "Indigo Plateau",
];

export function canFlyTo(city: number, state: LogicState) {
  return canFly(state) && (CITIES[city] === "Pallet Town" || state.freeFly === CITIES[city] || !!state.shortestPath("Pallet Town", CITIES[city]));
}

export function canSurf(state: LogicState): boolean {
  return state.items.has("HM03 Surf") && (state.items.has("Soul Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canCut(state: LogicState): boolean {
  return state.items.has("HM01 Cut") && (state.items.has("Cascade Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canFly(state: LogicState): boolean {
  return (state.items.has("HM02 Fly") || state.items.has("Flute")) && (state.items.has("Thunder Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canStrength(state: LogicState): boolean {
  return (state.items.has("HM04 Strength") || state.items.has("Titan's Mitt")) && (state.items.has("Rainbow Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

function canFlash(state: LogicState): boolean {
  return (state.items.has("HM05 Flash") || state.items.has("Lamp")) && (state.items.has("Boulder Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canLearnHM(state: LogicState): boolean {
  // TODO (Maybe): Implement a way to check and indicate if any Pokemon available can actually learn an HM move
  // That way, the player won't think they can surf/strength/cut/fly/flash when they really couldn't
  throw new Error("Not Implemented");
}

export function canGetHiddenItems(state: LogicState): boolean {
  return state.items.has("Item Finder") || !state.settings.RequireItemFinder;
}

function countCheck(array: Array<string>, count: number, state: LogicState): boolean {
  return array.filter(item => state.items.has(item)).length >= count;
}

export function enoughKeyItems(count: number, state: LogicState): boolean {
  // This function is for gates locked by number of key items
  return countCheck(
    [
      "Bicycle",
      "Silph Scope",
      "Item Finder",
      "Super Rod",
      "Good Rod",
      "Old Rod",
      "Lift Key",
      "Card Key",
      "Town Map",
      "Coin Case",
      "S.S. Ticket",
      "Secret Key",
      "Poke Flute",
      "Mansion Key",
      "Safari Pass",
      "Plant Key",
      "Hideout Key",
      "Card Key 2F",
      "Card Key 3F",
      "Card Key 4F",
      "Card Key 5F",
      "Card Key 6F",
      "Card Key 7F",
      "Card Key 8F",
      "Card Key 9F",
      "Card Key 10F",
      "Card Key 11F",
      "Exp. All",
      "Fire Stone",
      "Thunder Stone",
      "Water Stone",
      "Leaf Stone",
      "Moon Stone",
      "Oak's Parcel",
      "Helix Fossil",
      "Dome Fossil",
      "Old Amber",
      "Tea",
      "Gold Teeth",
      "Bike Voucher",
    ],
    count,
    state
  );
}

export function canPassGuards(state: LogicState): boolean {
  return (state.settings.Tea && state.items.has("Tea")) || (!state.settings.Tea && state.items.has("Vending Machine Drinks"));
}

export function enoughBadges(count: number, state: LogicState): boolean {
  return countCheck(["Boulder Badge", "Cascade Badge", "Thunder Badge", "Rainbow Badge", "Marsh Badge", "Soul Badge", "Volcano Badge", "Earth Badge"], count, state);
}

export function enoughPokemon(count: number, state: LogicState): boolean {
  // TODO: Keep track of the number of Pokemon registered in the Pokedex
  if (count === 0) {
    return true;
  }
  return count <= state.checks.filter(check => check.type === "Pokemon" && check.acquired).length;
}

export function oaksAidCheck(count: number, state: LogicState): boolean {
  return enoughPokemon(count, state) && (state.items.has("Pokedex") || !state.settings.RequirePokedex);
}

export function enoughFossils(count: number, state: LogicState): boolean {
  return (
    countCheck(["Dome Fossil", "Helix Fossil", "Old Amber"], count, state) &&
    state.items.has("Mt Moon Fossils") &&
    state.regions.has("Cinnabar Island") && // I'm not sure why these matter? Unless you need to enter the lab first, and the island?
    state.regions.has("Cinnabar Lab")
  );
}

export function cardKeyAccess(floor: number, state: LogicState): boolean {
  return state.items.has("Card Key") || state.items.has("Card Key " + floor.toString() + "F");
}

export function canRockTunnel(state: LogicState): boolean {
  return canFlash(state) || !state.settings.RequireFlash;
}

export function canRoute3(state: LogicState): boolean {
  return (
    (state.items.has("Defeat Brock") && state.settings.Route3Req === Route3Req.DefeatBrock) ||
    (state.items.has("Boulder Badge") && state.settings.Route3Req === Route3Req.BoulderBadge) ||
    (countCheck(["Defeat Brock", "Defeat Misty", "Defeat Lt. Surge", "Defeat Erika", "Defeat Koga", "Defeat Blaine", "Defeat Sabrina", "Defeat Viridian Gym Giovanni"], 1, state) &&
      state.settings.Route3Req === Route3Req.DefeatAny) ||
    (enoughBadges(1, state) && state.settings.Route3Req === Route3Req.AnyBadge)
  );
}

export function evolveLevel(level: number, state: LogicState): boolean {
  // This is a function to know if the evolution of pokemon should be considered in logic
  // Every gym defeated gives +7 levels to the evolution levels considered in logic for pokemon checks
  return (
    ["Defeat Brock", "Defeat Misty", "Defeat Lt. Surge", "Defeat Erika", "Defeat Koga", "Defeat Blaine", "Defeat Sabrina", "Defeat Viridian Gym Giovanni"].filter(gym => state.items.has(gym)).length >
    level / 7
  );
}

// Custom functions I'm making to handle certain checks
export function seafoamExitBoulder(state: LogicState): boolean {
  return (
    canStrength(state) &&
    state.regions.has("Seafoam Islands 1F") &&
    state.regions.has("Seafoam Islands B1F-NE") &&
    state.regions.has("Seafoam Islands B1F") &&
    state.regions.has("Seafoam Islands B2F-NE") &&
    state.regions.has("Seafoam Islands B2F-NW")
  );
}

export function victoryRoadBoulder(state: LogicState): boolean {
  return canStrength(state) && state.regions.has("Victory Road 3F-S");
}

export function canEnterCeruleanCave(state: LogicState): boolean {
  // connect(multiworld, player, "Cerulean City-Water", "Cerulean City-Cave", lambda state:
  // logic.has_badges(state, world.options.cerulean_cave_badges_condition.value, player) and
  // logic.has_key_items(state, world.options.cerulean_cave_key_items_condition.total, player) and logic.can_surf(state, world, player))
  return enoughBadges(state.settings.CeruleanCaveBadges, state) && enoughKeyItems(state.settings.CeruleanCaveKeyItems, state) && canSurf(state);
}

export function canEnterEliteFour(state: LogicState): boolean {
  // connect(multiworld, player, "Indigo Plateau Lobby", "Indigo Plateau Lobby-N", lambda state: logic.has_badges(state, world.options.elite_four_badges_condition.value, player) and logic.has_pokemon(state, world.options.elite_four_pokedex_condition.total, player) and logic.has_key_items(state, world.options.elite_four_key_items_condition.total, player) and (state.has("Pokedex", player, int(world.options.elite_four_pokedex_condition.total > 1) * world.options.require_pokedex.value)))
  return (
    enoughBadges(state.settings.EliteFourBadges, state) &&
    enoughPokemon(state.settings.EliteFourPokedex, state) &&
    enoughKeyItems(state.settings.EliteFourKeyItems, state) &&
    (state.items.has("Pokedex") || !state.settings.RequirePokedex || state.settings.EliteFourPokedex === 0)
  );
}

export function pokeDollSkippable(state: LogicState): boolean {
  // TODO: Region
  return state.items.has("Poke Doll") || state.regions.has("Celadon Department Store 3F"); // likely incorrect
}

export function canPassVictoryRoadGate(state: LogicState): boolean {
  return enoughBadges(state.settings.VictoryRoadBadges, state);
}

export function canPassRoute22Gate(state: LogicState): boolean {
  return enoughBadges(state.settings.Route22Badges, state);
}

export function canEnterViridianGym(state: LogicState): boolean {
  return enoughBadges(state.settings.ViridianGymBadges, state);
}
