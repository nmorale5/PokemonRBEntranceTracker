import { Client, JSONRecord } from "archipelago.js";
import LogicState from "./LogicState";

const PORT = "55459";
const PLAYER = "Halaffa";
const CARDKEYS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => `Card Key ${num}F`);

export function urlFromPort(port: string) {
  return "wss://archipelago.gg:" + port;
}

export class Session {
  private static _instance: Session | undefined;
  public static get instance() {
    if (!this._instance) {
      this._instance = new Session();
    }
    return this._instance;
  }
  public client: Client = new Client();
  public slotData: JSONRecord = {};

  public async login(url: string, playerName: string): Promise<void> {
    if (!this.client.socket.connected) {
      await this.client.socket.connect(url); // Need to connect before logging in
    }
    if (!this.client.authenticated) {
      this.slotData = await this.client.login(url, playerName, "Pokemon Red and Blue", { slotData: true });
    }
  }

  public async logout(): Promise<void> {
    if (this.isConnected) {
      this.client.socket.disconnect();
    }
  }

  public get isConnected(): boolean {
    return this.client.socket.connected;
  }

  async logItems(): Promise<void> {
    // Setup a listener for whenever items are received and log the details.
    this.client.items.on("itemsReceived", items => {
      for (const item of items) {
        console.log(`Received item ${item.name} from player ${item.sender}.`);
        // item.name is all we need, if it's an important item to remember, we add it to the item set (or really all items tbh)
      }
    });

    this.client.room.on("locationsChecked", locations => {
      // These are the CHECKS
      for (const loc of locations) {
        console.log(loc); // is only the id
        console.log(this.client.room.checkedLocations.map(id => this.client.package.lookupLocationName("Pokemon Red and Blue", id))); // names
      }
    });

    console.log(this.client.room.checkedLocations.map(id => this.client.package.lookupLocationName("Pokemon Red and Blue", id))); // All checks, call on join
    console.log(this.client.items.received.map(item => item.name)); // All items, call on join.
  }

  async findNameDiscrepancies(state: LogicState): Promise<void> {
    const checkNames = new Set(this.client.room.allLocations.map(id => this.client.package.lookupLocationName("Pokemon Red and Blue", id)));
    console.log(state.checks.filter(check => !checkNames.has(check.region + " - " + check.name)).map(check => check.region + " - " + check.name));
  }

  async generateLocationIdTable(): Promise<Map<string, number>> {
    const map = new Map();
    for (const elem of this.client.room.allLocations) {
      map.set(this.client.package.lookupLocationName("Pokemon Red and Blue", elem), elem);
    }
    return map;
  }

  async setupArch(): Promise<void> {
    const stateObs = LogicState.currentState;
    stateObs.value.changeSettings(this.slotData);
    this.client.items.on("itemsReceived", items => {
      stateObs.next(items.reduce((prevState, curItem) => prevState.withItemStatus(curItem.name, true), stateObs.value));
    });

    this.client.room.on("locationsChecked", locations => {
      stateObs.next(locations.reduce((prevState, curCheckId) => prevState.withCheckAcquired(curCheckId, true), stateObs.value));
    });

    const newState = stateObs.value.clone();
    const receivedChecks: Set<number> = new Set(this.client.room.checkedLocations);
    newState.checks.forEach(check => (check.acquired = receivedChecks.has(check.id)));
    newState.items.clear();
    this.client.items.received.forEach(item => {
      let toAdd: string | undefined;
      switch (item.name) {
        case "Progressive Card Key":
          toAdd = CARDKEYS.find(key => !newState.items.has(key));
          break;
        default:
          toAdd = item.name;
          break;
      }
      if (toAdd) newState.items.add(toAdd);
    });
    newState.updateRegionAccessibility();
    stateObs.next(newState);
  }
}
