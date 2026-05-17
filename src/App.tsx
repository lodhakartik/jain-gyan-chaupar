import { useGame } from "./store/gameStore";
import Welcome from "./components/Welcome";
import PlayerSetup from "./components/PlayerSetup";
import GameBoard from "./components/GameBoard";
import Result from "./components/Result";
import PaapModal from "./components/PaapModal";
import PunyaModal from "./components/PunyaModal";

export default function App() {
  const screen = useGame((s) => s.screen);
  return (
    <div className="min-h-screen w-full font-sans">
      {screen === "welcome" && <Welcome />}
      {screen === "setup" && <PlayerSetup />}
      {screen === "game" && <GameBoard />}
      {screen === "result" && <Result />}
      <PaapModal />
      <PunyaModal />
    </div>
  );
}
