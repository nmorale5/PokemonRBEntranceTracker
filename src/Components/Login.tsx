import "./Map.css";
import { Session, urlFromPort } from "../Backend/Archipelago";
import "./Login.css";

// const PORT = "55459";
// const PLAYER = "Halaffa";

let ongoingSession: Session;

const Login = () => {
  return (
    <div className="Login">
      <button
        onClick={async () => {
          const portText = document.getElementById("port") as HTMLInputElement;
          const playerText = document.getElementById("player") as HTMLInputElement;
          if (ongoingSession && ongoingSession.isConnected) {
            await ongoingSession.logout();
          }
          const session = new Session();
          await session.login(urlFromPort(portText.value), playerText.value);
          await session.setupArch().catch(() => {
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
