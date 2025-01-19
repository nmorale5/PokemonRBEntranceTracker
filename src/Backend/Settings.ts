const MAX_KEY_ITEMS = 100;
const MAX_TRAINERS = 317;
const NUM_POKEMON = 151;

export enum Route3Req {
  "Open",
  "DefeatBrock",
  "DefeatAny",
  "BoulderBadge",
  "AnyBadge",
}

export enum FossilItemTypes {
  "Any",
  "Key",
  "Unique",
  "NoKey",
}

export enum BadgeHMRequirement {
  "None",
  "Default",
  "Extra",
  "ExtraPlus",
}

export enum OldMan {
  "Default",
  "EarlyParcel",
  "None",
}

export enum Pokedex {
  "Default",
  "Random",
  "Start",
}

export enum CardKey {
  "Default",
  "Split",
  "Progressive",
}

export enum RandomizeHidden {
  "No",
  "Yes",
  "Junk",
}

export enum DoorShuffle {
  "Default",
  "Simple",
  "Interiors",
  "Full",
  "Insanity",
  "Decoupled",
}

export enum WarpTileShuffle {
  "Default",
  "Shuffled",
  "Mixed",
}

export enum RandomizePokemon {
  "Default",
  "TypeMatch",
  "BSTMatch",
  "BothMatch",
  "Random",
}

export enum RandomizeLegendaryPokemon {
  "Default",
  "Shuffle",
  "Static",
  "Any",
}

export const defaultSettings = {
  OakWin: false, // Required?
  EliteFourBadges: 8,
  EliteFourKeyItems: 0,
  EliteFourPokedex: 0,
  VictoryRoadBadges: 7,
  Route22Badges: 7,
  ViridianGymBadges: 7,
  CeruleanCaveBadges: 4,
  CeruleanCaveKeyItems: 24,
  Route3Req: Route3Req.BoulderBadge,
  RobbedHouseOfficer: true,
  FossilReviveCount: 0,
  FossilItemTypes: FossilItemTypes.Any,
  BadgeSanity: true,
  BadgeHMRequirement: BadgeHMRequirement.Default,
  OldMan: OldMan.Default,
  Pokedex: Pokedex.Random,
  KeyItemsOnly: false,
  Tea: true,
  ExtraKeyItems: true,
  CardKey: CardKey.Progressive,
  AllElevatorsLocked: false,
  ExtraBoulders: false,
  RequireItemFinder: false,
  RandomizeHidden: RandomizeHidden.Yes,
  PrizeSanity: false,
  TrainerSanity: MAX_TRAINERS,
  RequirePokedex: true,
  DexSanity: 0,
  DoorShuffle: DoorShuffle.Decoupled,
  WarpTileShuffle: WarpTileShuffle.Mixed,
  RandomizeRockTunnel: true,
  RequireFlash: true,
  OaksAidRt2: 10,
  OaksAidRt11: 20,
  OaksAidRt15: 30,
  StoneSanity: true,
  PokeDollSkip: false,
  BicycleGateSkip: false,
  RandomizeWildPokemon: RandomizePokemon.BSTMatch,
  Area1To1Mapping: true,
  RandomizeStarterPokemon: RandomizePokemon.BSTMatch,
  RandomizeStaticPokemon: RandomizePokemon.BSTMatch,
  RandomizeLegendaryPokemon: RandomizeLegendaryPokemon.Shuffle,
};
