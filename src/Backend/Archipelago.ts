import { Client, Item, JSONRecord, LoginError } from "archipelago.js";
import LogicState from "./LogicState";

const CARDKEYS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => `Card Key ${num}F`);

export type Credentials = {
  server: string;
  port: number;
  name: string;
  password: string;
};

export enum LoginResult {
  OK,
  InvalidPort,
  InvalidNameOrPassword,
  AlreadyLoggingIn,
}

function getItemName(item: Item, logicState: LogicState): string {
  switch (item.name) {
    case "Progressive Card Key":
      return CARDKEYS.find(key => !logicState.items.has(key))!;
    default:
      return item.name;
  }
}

export class ArchipelagoClient {
  public credentials: Credentials | null = null;
  public slotData: JSONRecord | null = null;

  private client: Client = new Client();
  private loggingIn: boolean = false;

  private constructor() {}

  private static _instance: ArchipelagoClient | undefined;
  public static get instance(): ArchipelagoClient {
    if (!this._instance) {
      this._instance = new ArchipelagoClient();
    }
    return this._instance;
  }

  public async login(credentials: Credentials): Promise<LoginResult> {
    if (this.loggingIn || this.isConnected) {
      return LoginResult.AlreadyLoggingIn; // already logging in from a different call to this function, or is already connected
    }
    this.loggingIn = true;
    const url = `${credentials.server}:${credentials.port}`;

    try {
      await this.client.socket.connect(url); // Need to connect before logging in
    } catch (e) {
      if (e instanceof TypeError) {
        return LoginResult.InvalidPort;
      } else {
        throw e;
      }
    }

    try {
      this.slotData = await this.client.login(url, credentials.name, "Pokemon Red and Blue", { password: credentials.password });
    } catch (e) {
      if (e instanceof LoginError) {
        return LoginResult.InvalidNameOrPassword;
      } else {
        throw e;
      }
    }

    this.credentials = credentials;
    this.loggingIn = false;
    return LoginResult.OK;
  }

  public logout() {
    // todo: do we need to unsubscribe from check and item events?
    if (this.isConnected) {
      this.client.socket.disconnect();
    }
    this.credentials = null;
    this.slotData = null;
  }

  public get isConnected(): boolean {
    return this.client.socket.connected;
  }

  public syncLogicState(logicState: LogicState) {
    // populate with all current checks and items
    logicState.addChecks(this.client.room.checkedLocations);
    this.client.items.received.forEach(item => logicState.addItem(getItemName(item, logicState)));

    // subscribe to future checks and items
    this.client.room.on("locationsChecked", locations => logicState.addChecks(locations));
    this.client.items.on("itemsReceived", items => items.forEach(item => logicState.addItem(getItemName(item, logicState))));
  }

  // async logItems(): Promise<void> {
  //   // Setup a listener for whenever items are received and log the details.
  //   this.client.items.on("itemsReceived", items => {
  //     for (const item of items) {
  //       console.log(`Received item ${item.name} from player ${item.sender}.`);
  //       // item.name is all we need, if it's an important item to remember, we add it to the item set (or really all items tbh)
  //     }
  //   });
  //
  //   this.client.room.on("locationsChecked", locations => {
  //     // These are the CHECKS
  //     for (const loc of locations) {
  //       console.log(loc); // is only the id
  //       console.log(this.client.room.checkedLocations.map(id => this.client.package.lookupLocationName("Pokemon Red and Blue", id))); // names
  //     }
  //   });
  //
  //   console.log(this.client.room.checkedLocations.map(id => this.client.package.lookupLocationName("Pokemon Red and Blue", id))); // All checks, call on join
  //   console.log(this.client.items.received.map(item => item.name)); // All items, call on join.
  // }
  //
  // async findNameDiscrepancies(state: LogicState): Promise<void> {
  //   const checkNames = new Set(this.client.room.allLocations.map(id => this.client.package.lookupLocationName("Pokemon Red and Blue", id)));
  //   console.log(state.checks.filter(check => !checkNames.has(check.region + " - " + check.name)).map(check => check.region + " - " + check.name));
  // }
  //
  // async generateLocationIdTable(): Promise<Map<string, number>> {
  //   const map = new Map();
  //   for (const elem of this.client.room.allLocations) {
  //     map.set(this.client.package.lookupLocationName("Pokemon Red and Blue", elem), elem);
  //   }
  //   return map;
  // }
}
