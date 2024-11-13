import { Client, clientStatuses } from "archipelago.js";

const PORT = "57558";
const PLAYER = "Halaffa";

// Create a new instance of the Client class.
export const client = new Client();

async function login(): Promise<void> {
  if (!client.socket.connected) {
    await client.socket.connect("wss://archipelago.gg:" + PORT); // Need to connect before logging in
  }
  if (!client.authenticated) {
    await client.login("wss://archipelago.gg:" + PORT, PLAYER, "Pokemon Red and Blue").then(() => client.messages.say("Hello, multiworld!"));
  }
}

export const logFlag: Promise<void> = login(); // only attempt to login once.

export async function logItems(): Promise<void> {
  await logFlag;
  // Setup a listener for whenever items are received and log the details.
  client.items.on("itemsReceived", items => {
    for (const item of items) {
      console.log(`Received item ${item.name} from player ${item.sender}.`);
      // item.name is all we need, if it's an important item to remember, we add it to the item set (or really all items tbh)
    }
  });

  client.room.on("locationsChecked", locations => {
    // These are the CHECKS
    for (const loc of locations) {
      console.log(loc); // is only the id
      console.log(client.room.checkedLocations.map(id => client.package.lookupLocationName("Pokemon Red and Blue", id))); // names
    }
  });

  console.log(client.room.checkedLocations.map(id => client.package.lookupLocationName("Pokemon Red and Blue", id))); // All checks, call on join
  console.log(client.items.received.map(item => item.name)); // All items, call on join.
}
