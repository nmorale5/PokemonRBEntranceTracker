import { Client, clientStatuses } from "archipelago.js";
import { defaultState, State } from "./GenerateGraph";

const PORT = "55459";
const PLAYER = "Halaffa";

export function urlFromPort(port: string) {
  return "wss://archipelago.gg:" + port;
}

export class Session {
  public client: Client = new Client();
  public logFlag: Promise<void>;

  constructor(url: string, playerName: string) {
    this.logFlag = this.login(url, playerName);
  }

  async login(url: string, playerName: string): Promise<void> {
    if (!this.client.socket.connected) {
      await this.client.socket.connect(url); // Need to connect before logging in
    }
    if (!this.client.authenticated) {
      await this.client.login(url, playerName, "Pokemon Red and Blue").then(() => this.client.messages.say("Hello, multiworld!"));
    }
  }

  async logItems(): Promise<void> {
    await this.logFlag;
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

  async findNameDiscrepancies(state: State): Promise<void> {
    await this.logFlag;
    const checkNames = new Set(this.client.room.allLocations.map(id => this.client.package.lookupLocationName("Pokemon Red and Blue", id)));
    console.log(state.checks.filter(check => !checkNames.has(check.region + " - " + check.name)).map(check => check.region + " - " + check.name));
  }

  async generateLocationIdTable(): Promise<Map<string, number>> {
    await this.logFlag;
    const map = new Map();
    for (const elem of this.client.room.allLocations) {
      map.set(this.client.package.lookupLocationName("Pokemon Red and Blue", elem), elem);
    }
    return map;
  }

  async setupArch(state: State): Promise<void> {
    await this.logFlag; // Wait until the user is fully logged in
    this.client.items.on("itemsReceived", items => {
      for (const item of items) {
        // if (item.progression) {}? tentative on using this
        state.items.add(item.name);
      }
      state.updateAll();
    });

    this.client.room.on("locationsChecked", locations => {
      // These are the CHECKS
      for (const loc of locations) {
        for (const check of state.checks) {
          if (check.id === loc) {
            check.acquired = true;
          }
        }
      }
      state.updateAll();
    });
    const receivedChecks: Set<number> = new Set(this.client.room.checkedLocations);
    // not mapping, just filling the state appropriately
    state.checks.map(check => {
      check.acquired = receivedChecks.has(check.id);
    });
    this.client.items.received.map(item => state.items.add(item.name));
    state.updateAll();
  }
}
