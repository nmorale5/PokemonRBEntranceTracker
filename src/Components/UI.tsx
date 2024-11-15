import "./Map.css";
import { defaultState } from "../Backend/GenerateGraph";
import { Session, urlFromPort } from "../Backend/Archipelago";

// const PORT = "55459";
// const PLAYER = "Halaffa";

let ongoingSession: Session;

const UI = () => {
  return (
    <>
      <button
        onClick={() => {
          const portText: HTMLTextAreaElement = document.getElementById("port") as HTMLTextAreaElement;
          const playerText: HTMLTextAreaElement = document.getElementById("player") as HTMLTextAreaElement;
          if (ongoingSession && ongoingSession.isConnected()) {
            ongoingSession.logout();
          }
          const session = new Session(urlFromPort(portText.value), playerText.value);
          void session
            .setupArch(defaultState)
            .then()
            .catch(() => {
              console.log("Couldn't log you in. Check your credentials");
            });
        }}
        color="gray"
      >
        Connect
      </button>
      <label>PORT</label>
      <textarea id="port" />
      <label>PLAYER</label>
      <textarea id="player" />
    </>
  );
};

export default UI;
