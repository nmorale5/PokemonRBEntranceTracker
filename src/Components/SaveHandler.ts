import LogicState, { UpdateType } from "../Backend/LogicState";
import { Credentials } from "../Backend/Archipelago";
import { filter, startWith, Subscription } from "rxjs";

export type SaveEntry = {
  timeCreated: number;
  credentials: Credentials;
  savedWarps: ({
    toWarp: string;
    fromWarp: string;
  } | null)[];
};

const SAVE_KEY = "save";

export class SaveHandler {
  private static _instance: SaveHandler;
  public static get instance(): SaveHandler {
    if (!SaveHandler._instance) {
      this._instance = new SaveHandler();
    }
    return this._instance;
  }

  public saveEntries: SaveEntry[] = [];
  private _sub: Subscription = new Subscription();

  private constructor() {
    const localStorage = window.localStorage.getItem(SAVE_KEY);
    this.saveEntries = localStorage ? JSON.parse(localStorage) : [];
  }

  public save(state: LogicState, credentials: Credentials) {
    const oldIdx = this.saveEntries.findIndex(entry => entry.credentials.port === credentials.port && entry.credentials.name === credentials.name);
    if (oldIdx !== -1) {
      this.saveEntries.splice(oldIdx, 1); // remove old entry before adding new one
    }
    this.saveEntries.push({
      timeCreated: Date.now(),
      credentials: credentials,
      savedWarps: state.warps.map(warp =>
        warp.linkedWarp === null
          ? null
          : {
              toWarp: warp.linkedWarp.toWarp,
              fromWarp: warp.linkedWarp.fromWarp,
            }
      ),
    });
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(this.saveEntries));
  }

  public autosave(state: LogicState, credentials: Credentials) {
    this._sub.unsubscribe();
    this._sub = state.updates.pipe(filter(updateType => updateType === UpdateType.Any || updateType === UpdateType.Warps), startWith(UpdateType.Any)).subscribe(_ => this.save(state, credentials));
  }
}
