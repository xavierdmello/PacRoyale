import "./App.css";

import { DevWallet } from "./components/DevWallet";
import { Provider, Contract, RpcProvider } from "starknet";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Board from "./components/Board";
import { useState, useEffect } from "react";
import { PACROYALE_ADDRESS } from "./components/ContractAddresses";

function App() {
  const [page, setPage] = useState("landing");
  const [boardData, setBoardData] = useState([]);
  const [playerPositions, setPlayerPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = new RpcProvider({
          nodeUrl: "http://100.74.177.49:5050",
        });

        // Fetch board data
        const boardResponse = await provider.callContract({
          contractAddress: PACROYALE_ADDRESS,
          entrypoint: "get_map",
        });

        // Fetch player positions
        const positionsResponse = await provider.callContract({
          contractAddress: PACROYALE_ADDRESS,
          entrypoint: "get_positions",
        });

        if (boardResponse) {
          const parsedData = boardResponse.slice(1).map((hex: string) =>
            parseInt(hex, 16)
          );
          setBoardData(parsedData);
        }

        if (positionsResponse) {
          const positions = positionsResponse.slice(1).map((arr: any) => [
            parseInt(arr[0], 16),
            parseInt(arr[1], 16)
          ]);
          setPlayerPositions(positions);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <DevWallet />
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "board" && <Board board={boardData} playerPositions={playerPositions} />}
    </>
  );
}

export default App;
