import { BadgeHMRequirement, Items, Settings, Regions, Route3Req } from "./GenerateGraph";

// TODO: Implement workaround for Extra and Extra Plus HM Badge settings to allow user to manually indicate
// The ability to use an HM move

export function canSurf() : boolean {
    return Items.has("HM 03 Surf") && (Items.has("Soul Badge") || Settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canCut() : boolean {
    return Items.has("HM 01 Cut") && (Items.has("Cascade Badge") || Settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canFly() : boolean {
    return (Items.has("HM 02 Fly") ||  Items.has("Flute")) && (Items.has("Thunder Badge") || Settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canStrength() : boolean {
    return (Items.has("HM 04 Strength") ||  Items.has("Titan's Mitt")) && (Items.has("Rainbow Badge") || Settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canFlash() : boolean {
    return (Items.has("HM 05 Flash") ||  Items.has("Lamp")) && (Items.has("Boulder Badge") || Settings.BadgeHMRequirement === BadgeHMRequirement.None);
}

export function canLearnHM() : boolean {
    // TODO (Maybe): Implement a way to check and indicate if any Pokemon availible can actually learn an HM move
    // That way, the player won't think they can surf/strength/cut/fly/flash when they really couldn't
    throw new Error("Not Implemented");
}

export function canGetHiddenItems() : boolean {
    return Items.has("Item Finder") || !Settings.RequireItemFinder;
}

function countCheck(array: Array<string>, count: number) : boolean {
    return array.filter((item) => Items.has(item)).length >= count;
}

export function enoughKeyItems(count: number) : boolean {
    // This function is for gates locked by number of key items
    return countCheck(["Bicycle", "Silph Scope", "Item Finder", "Super Rod", "Good Rod",
        "Old Rod", "Lift Key", "Card Key", "Town Map", "Coin Case", "S.S. Ticket",
        "Secret Key", "Poke Flute", "Mansion Key", "Safari Pass", "Plant Key",
        "Hideout Key", "Card Key 2F", "Card Key 3F", "Card Key 4F", "Card Key 5F",
        "Card Key 6F", "Card Key 7F", "Card Key 8F", "Card Key 9F", "Card Key 10F",
        "Card Key 11F", "Exp. All", "Fire Stone", "Thunder Stone", "Water Stone",
        "Leaf Stone", "Moon Stone", "Oak's Parcel", "Helix Fossil", "Dome Fossil",
        "Old Amber", "Tea", "Gold Teeth", "Bike Voucher"], count);
    
}

export function canPassGuards() : boolean {
    return (Settings.Tea && Items.has("Tea")) || (!Settings.Tea && Items.has("Vending Machine Drinks"));
}

export function enoughBadges(count: number) : boolean {
    return countCheck(["Boulder Badge", "Cascade Badge", "Thunder Badge", "Rainbow Badge", "Marsh Badge",
        "Soul Badge", "Volcano Badge", "Earth Badge"], count);
}

export function enoughPokemon(count: number) : boolean {
    // TODO: Keep track of the number of Pokemon registered in the Pokedex
    if (count === 0) {
        return true;
    }
    throw new Error("Not Implemented");
}

export function oaksAidCheck(count: number) : boolean {
    return enoughPokemon(count) && (Items.has("Pokedex") || !Settings.RequirePokedex);
}

export function enoughFossils(count: number) : boolean {
    return countCheck(["Dome Fossil", "Helix Fossil", "Old Amber"], count) 
    && Items.has("Mt Moon Fossils") 
    && Regions.has("Cinnabar Island") // I'm not sure why these matter? Unless you need to enter the lab first, and the island?
    && Regions.has("Cinnabar Lab");
}

export function cardKeyAccess(floor: number) : boolean {
    return Items.has("Card Key") || Items.has("Card Key " + floor.toString() + "F");
}

export function canRockTunnel() : boolean {
    return canFlash() || !Settings.RequireFlash;
}

export function canRoute3() : boolean {
    return (Items.has("Defeat Brock") && Settings.Route3Req === Route3Req.DefeatBrock) ||
        (Items.has("Boulder Badge") && Settings.Route3Req === Route3Req.BoulderBadge) ||
        (countCheck(["Defeat Brock", "Defeat Misty", "Defeat Lt. Surge", "Defeat Erika", "Defeat Koga",
            "Defeat Blaine", "Defeat Sabrina", "Defeat Viridian Gym Giovanni"], 1) && Settings.Route3Req === Route3Req.DefeatAny) ||
        (enoughBadges(1) && Settings.Route3Req === Route3Req.AnyBadge);
}

export function evolveLevel(level: number) : boolean {
    // This is a function to know if the evolution of pokemon should be considered in logic
    // Every gym defeated gives +7 levels to the evolution levels considered in logic for pokemon checks
    return ["Defeat Brock", "Defeat Misty", "Defeat Lt. Surge", "Defeat Erika", "Defeat Koga", "Defeat Blaine",
        "Defeat Sabrina", "Defeat Viridian Gym Giovanni"].filter((gym) => Items.has(gym)).length > level / 7;
}


// Custom functions I'm making to handle certain checks
export function seafoamExitBoulder() : boolean {
    // TODO: Regions
    // connect(multiworld, player, "Seafoam Islands B3F", "Seafoam Islands B3F-SE", lambda state: logic.can_surf(state, world, player) and logic.can_strength(state, world, player) and state.has("Seafoam Exit Boulder", player, 6))
    return canStrength() // && Regions.has(i) for (i of "regions with strength boulders to push down")
}

export function victoryRoadBoulder() : boolean {
    // TODO: Region
    return canStrength() // && Regions.has("area in Victory Road you need to push boulder in")
}

export function canEnterCeruleanCave() : boolean {
    // connect(multiworld, player, "Cerulean City-Water", "Cerulean City-Cave", lambda state:
    // logic.has_badges(state, world.options.cerulean_cave_badges_condition.value, player) and
    // logic.has_key_items(state, world.options.cerulean_cave_key_items_condition.total, player) and logic.can_surf(state, world, player))
    return enoughBadges(Settings.CeruleanCaveBadges) && enoughKeyItems(Settings.CeruleanCaveKeyItems) && canSurf();
}

export function canEnterEliteFour() : boolean {
    // connect(multiworld, player, "Indigo Plateau Lobby", "Indigo Plateau Lobby-N", lambda state: logic.has_badges(state, world.options.elite_four_badges_condition.value, player) and logic.has_pokemon(state, world.options.elite_four_pokedex_condition.total, player) and logic.has_key_items(state, world.options.elite_four_key_items_condition.total, player) and (state.has("Pokedex", player, int(world.options.elite_four_pokedex_condition.total > 1) * world.options.require_pokedex.value)))
    return enoughBadges(Settings.EliteFourBadges) && 
        enoughPokemon(Settings.EliteFourPokedex) && 
        enoughKeyItems(Settings.EliteFourKeyItems) && 
        (Items.has("Pokedex") || !Settings.RequirePokedex || Settings.EliteFourPokedex === 0);
}

export function pokeDollSkippable() : boolean {
    // TODO: Region
    return Items.has("Poke Doll") || Regions.has("Celdon Department Store 3F"); // likely incorrect
}

export function canPassVictoryRoadGate() : boolean {
    return enoughBadges(Settings.VictoryRoadBadges);
}

export function canPassRoute22Gate() : boolean {
    return enoughBadges(Settings.Route22Badges);
}

export function canEnterViridianGym() : boolean {
    return enoughBadges(Settings.ViridianGymBadges)
}
