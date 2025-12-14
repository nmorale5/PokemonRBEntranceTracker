import "./Home.css";
import { JSONRecord } from "archipelago.js";
import { SaveHandler } from "./SaveHandler";
import { ArchipelagoClient, Credentials, LoginResult } from "../Backend/Archipelago";

const tryLogin = async (credentials: Credentials): Promise<boolean> => {
  const loginResult = await ArchipelagoClient.instance.login(credentials);
  switch (loginResult) {
    case LoginResult.OK:
      return true;
    case LoginResult.InvalidPort:
      // todo: display helpful message
      return false;
    case LoginResult.InvalidNameOrPassword:
      // todo: display helpful message
      return false;
    case LoginResult.AlreadyLoggingIn:
    default:
      // fail gracefully
      return false;
  }
};

const Home = (props: { onLoggedIn: (slotData: JSONRecord, savedWarps: any) => void }) => {
  return (
    <div className="Home">
      <h2>Pokemon Red/Blue Entrance Tracker For Archipelago</h2>
      <h3>Track New Rando</h3>
      <div className="Login">
        <button
          onClick={async () => {
            const portText = (document.getElementById("port") as HTMLInputElement).value;
            const playerText = (document.getElementById("player") as HTMLInputElement).value;
            const passwordText = (document.getElementById("password") as HTMLInputElement).value;
            const success = await tryLogin({
              port: Number(portText),
              name: playerText,
              password: passwordText,
            });
            if (success) {
              props.onLoggedIn(ArchipelagoClient.instance.slotData!, undefined);
            }
          }}
          color="gray"
        >
          Connect
        </button>
        <label>Port</label>
        <input type="text" id="port" />
        <label>Slot Name</label>
        <input type="text" id="player" />
        <label>Password</label>
        <input type="password" id="password" />
      </div>

      <h3>Continue Rando</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {SaveHandler.instance.saveEntries.slice().reverse().map((entry, index) => (
          <div
            key={index}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              alignItems: "center",
              gap: "12px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
            }}
          >
            <span>{entry.credentials.port}</span>
            <span>{entry.credentials.name}</span>
            <span>{new Date(entry.timeCreated).toLocaleDateString()}</span>

            <button
              onClick={async () => {
                const success = await tryLogin({
                  port: entry.credentials.port,
                  name: entry.credentials.name,
                  password: entry.credentials.password,
                });
                if (success) {
                  props.onLoggedIn(ArchipelagoClient.instance.slotData!, entry.savedWarps);
                }
              }}
            >
              Go
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
