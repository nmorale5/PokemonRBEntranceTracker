import LogicState from "../Backend/LogicState";
import { defaultSettings } from "../Backend/Settings";
import { setToArray } from "../util";

type SaveEntry = {
  name: string;
  settings: typeof defaultSettings;
  items: string[];
  checks: boolean[];
  warps: ({ toWarp: string; fromWarp: string } | null)[];
  freeFly: string;
};

const SAVE_KEY = "save";

export default class SaveHandler {
  private static _instance: SaveHandler;
  public static get instance(): SaveHandler {
    if (!SaveHandler._instance) {
      this._instance = new SaveHandler();
    }
    return this._instance;
  }

  public saveEntries: SaveEntry[] = [];

  private constructor() {
    const localStorage = window.localStorage.getItem(SAVE_KEY);
    this.saveEntries = localStorage ? JSON.parse(localStorage) : [this.toSaveEntry(new LogicState(defaultSettings), this.getAvailableName())];
  }

  private writeSave() {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(this.saveEntries));
  }

  public getState(saveName: string): LogicState {
    const saveEntry = this.saveEntries.find(entry => entry.name === saveName);
    if (!saveEntry) {
      throw new Error(`save name ${saveName} not found`);
    }
    const newState = new LogicState(saveEntry.settings);
    newState.items = new Set(saveEntry.items);
    newState.checks.forEach((check, i) => (check.acquired = saveEntry.checks[i]));
    newState.warps.forEach(
      (warp, i) => (warp.linkedWarp = saveEntry.warps[i] === null ? null : newState.warps.find(w => w.toWarp === saveEntry.warps[i]!.toWarp && w.fromWarp === saveEntry.warps[i]!.fromWarp)!)
    );
    newState.freeFly = saveEntry.freeFly;
    newState.updateRegionAccessibility();
    return newState;
  }

  private toSaveEntry(state: LogicState, saveName: string): SaveEntry {
    return {
      name: saveName,
      settings: state.settings,
      items: setToArray(state.items),
      checks: state.checks.map(check => check.acquired),
      warps: state.warps.map(warp =>
        warp.linkedWarp === null
          ? null
          : {
              toWarp: warp.linkedWarp.toWarp,
              fromWarp: warp.linkedWarp.fromWarp,
            }
      ),
      freeFly: state.freeFly,
    };
  }

  public setState(state: LogicState, saveName: string) {
    this.saveEntries = this.saveEntries.filter(entry => entry.name !== saveName);
    this.saveEntries.push(this.toSaveEntry(state, saveName));
    this.writeSave();
  }

  public renameSave(oldName: string, newName: string) {
    if (this.saveEntries.some(entry => entry.name === newName)) {
      throw new Error(`new name ${newName} already exists as a save!`);
    }
    this.saveEntries.find(entry => entry.name === oldName)!.name = newName;
    this.writeSave();
  }

  public getAvailableName(): string {
    let i = 1;
    let candidateName = `Rando${i}`;
    while (this.saveEntries.map(entry => entry.name).includes(candidateName)) {
      candidateName = `Rando${++i}`;
    }
    return candidateName;
  }
}
