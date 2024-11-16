import "./Map.css";
import { defaultState } from "../Backend/GenerateGraph";
import { Session, urlFromPort } from "../Backend/Archipelago";
import "./Login.css";

// const PORT = "55459";
// const PLAYER = "Halaffa";

let ongoingSession: Session;

const Login = () => {
  return (
    <div className="Login">
      <button
        onClick={() => {
          const portText = document.getElementById("port") as HTMLInputElement;
          const playerText = document.getElementById("player") as HTMLInputElement;
          if (ongoingSession && ongoingSession.isConnected()) {
            void ongoingSession.logout();
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
      <input type="text" id="port" />
      <label>PLAYER</label>
      <input type="text" id="player" />
    </div>
  );
};

export default Login;
