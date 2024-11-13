import { BadgeHMRequirement, State, Route3Req } from "./GenerateGraph";

// TODO: Implement workaround for Extra and Extra Plus HM Badge settings to allow user to manually indicate
// The ability to use an HM move

export function canSurf(state: State): boolean {
  return state.items.has("HM 03 Surf") && (state.items.has("Soul Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canCut(state: State): boolean {
  return state.items.has("HM 01 Cut") && (state.items.has("Cascade Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canFly(state: State): boolean {
  return (state.items.has("HM 02 Fly") || state.items.has("Flute")) && (state.items.has("Thunder Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canStrength(state: State): boolean {
  return (state.items.has("HM 04 Strength") || state.items.has("Titan's Mitt")) && (state.items.has("Rainbow Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

function canFlash(state: State): boolean {
  return (state.items.has("HM 05 Flash") || state.items.has("Lamp")) && (state.items.has("Boulder Badge") || state.settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canLearnHM(state: State): boolean {
  // TODO (Maybe): Implement a way to check and indicate if any Pokemon available can actually learn an HM move
  // That way, the player won't think they can surf/strength/cut/fly/flash when they really couldn't
  throw new Error("Not Implemented");
}

export function canGetHiddenItems(state: State): boolean {
  return state.items.has("Item Finder") || !state.settings.RequireItemFinder;
}

function countCheck(array: Array<string>, count: number, state: State): boolean {
  return array.filter(item => state.items.has(item)).length >= count;
}

export function enoughKeyItems(count: number, state: State): boolean {
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

export function canPassGuards(state: State): boolean {
  return (state.settings.Tea && state.items.has("Tea")) || (!state.settings.Tea && state.items.has("Vending Machine Drinks"));
}

export function enoughBadges(count: number, state: State): boolean {
  return countCheck(["Boulder Badge", "Cascade Badge", "Thunder Badge", "Rainbow Badge", "Marsh Badge", "Soul Badge", "Volcano Badge", "Earth Badge"], count, state);
}

export function enoughPokemon(count: number, state: State): boolean {
  // TODO: Keep track of the number of Pokemon registered in the Pokedex
  if (count === 0) {
    return true;
  }
  throw new Error("Not Implemented");
}

export function oaksAidCheck(count: number, state: State): boolean {
  return enoughPokemon(count, state) && (state.items.has("Pokedex") || !state.settings.RequirePokedex);
}

export function enoughFossils(count: number, state: State): boolean {
  return (
    countCheck(["Dome Fossil", "Helix Fossil", "Old Amber"], count, state) &&
    state.items.has("Mt Moon Fossils") &&
    state.regions.has("Cinnabar Island") && // I'm not sure why these matter? Unless you need to enter the lab first, and the island?
    state.regions.has("Cinnabar Lab")
  );
}

export function cardKeyAccess(floor: number, state: State): boolean {
  return state.items.has("Card Key") || state.items.has("Card Key " + floor.toString() + "F");
}

export function canRockTunnel(state: State): boolean {
  return canFlash(state) || !state.settings.RequireFlash;
}

export function canRoute3(state: State): boolean {
  return (
    (state.items.has("Defeat Brock") && state.settings.Route3Req === Route3Req.DefeatBrock) ||
    (state.items.has("Boulder Badge") && state.settings.Route3Req === Route3Req.BoulderBadge) ||
    (countCheck(["Defeat Brock", "Defeat Misty", "Defeat Lt. Surge", "Defeat Erika", "Defeat Koga", "Defeat Blaine", "Defeat Sabrina", "Defeat Viridian Gym Giovanni"], 1, state) &&
      state.settings.Route3Req === Route3Req.DefeatAny) ||
    (enoughBadges(1, state) && state.settings.Route3Req === Route3Req.AnyBadge)
  );
}

export function evolveLevel(level: number, state: State): boolean {
  // This is a function to know if the evolution of pokemon should be considered in logic
  // Every gym defeated gives +7 levels to the evolution levels considered in logic for pokemon checks
  return (
    ["Defeat Brock", "Defeat Misty", "Defeat Lt. Surge", "Defeat Erika", "Defeat Koga", "Defeat Blaine", "Defeat Sabrina", "Defeat Viridian Gym Giovanni"].filter(gym => state.items.has(gym)).length >
    level / 7
  );
}

// Custom functions I'm making to handle certain checks
export function seafoamExitBoulder(state: State): boolean {
  // TODO: Regions
  // connect(multiworld, player, "Seafoam Islands B3F", "Seafoam Islands B3F-SE", lambda state: logic.can_surf(state, world, player) and logic.can_strength(state, world, player) and state.has("Seafoam Exit Boulder", player, 6))
  return canStrength(state); // && Regions.has(i) for (i of "regions with strength boulders to push down")
}

export function victoryRoadBoulder(state: State): boolean {
  // TODO: Region
  return canStrength(state); // && Regions.has("area in Victory Road you need to push boulder in")
}

export function canEnterCeruleanCave(state: State): boolean {
  // connect(multiworld, player, "Cerulean City-Water", "Cerulean City-Cave", lambda state:
  // logic.has_badges(state, world.options.cerulean_cave_badges_condition.value, player) and
  // logic.has_key_items(state, world.options.cerulean_cave_key_items_condition.total, player) and logic.can_surf(state, world, player))
  return enoughBadges(state.settings.CeruleanCaveBadges, state) && enoughKeyItems(state.settings.CeruleanCaveKeyItems, state) && canSurf(state);
}

export function canEnterEliteFour(state: State): boolean {
  // connect(multiworld, player, "Indigo Plateau Lobby", "Indigo Plateau Lobby-N", lambda state: logic.has_badges(state, world.options.elite_four_badges_condition.value, player) and logic.has_pokemon(state, world.options.elite_four_pokedex_condition.total, player) and logic.has_key_items(state, world.options.elite_four_key_items_condition.total, player) and (state.has("Pokedex", player, int(world.options.elite_four_pokedex_condition.total > 1) * world.options.require_pokedex.value)))
  return (
    enoughBadges(state.settings.EliteFourBadges, state) &&
    enoughPokemon(state.settings.EliteFourPokedex, state) &&
    enoughKeyItems(state.settings.EliteFourKeyItems, state) &&
    (state.items.has("Pokedex") || !state.settings.RequirePokedex || state.settings.EliteFourPokedex === 0)
  );
}

export function pokeDollSkippable(state: State): boolean {
  // TODO: Region
  return state.items.has("Poke Doll") || state.regions.has("Celadon Department Store 3F"); // likely incorrect
}

export function canPassVictoryRoadGate(state: State): boolean {
  return enoughBadges(state.settings.VictoryRoadBadges, state);
}

export function canPassRoute22Gate(state: State): boolean {
  return enoughBadges(state.settings.Route22Badges, state);
}

export function canEnterViridianGym(state: State): boolean {
  return enoughBadges(state.settings.ViridianGymBadges, state);
}
