import "./App.css";

import { DevWallet } from "./components/DevWallet";
import { Provider, Contract, RpcProvider } from "starknet";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Board from "./components/Board";
import { useState, useEffect } from "react";
import { PACROYALE_ADDRESS } from "./components/ContractAddresses";
import { useAccount } from "@starknet-react/core";

function App() {
  const [page, setPage] = useState("landing");
  const [boardData, setBoardData] = useState([]);
  const [playerPositions, setPlayerPositions] = useState<[number, number][]>([]);
  const { address } = useAccount();
  const provider = new RpcProvider({
    nodeUrl: "http://100.74.177.49:5050",
  });

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

  const handleAddPlayer = async () => {
    try {
      const contract = new Contract(
        [
          {
            name: "add_player",
            type: "function",
            inputs: [],
            outputs: [],
          },
        ],
        PACROYALE_ADDRESS,
        provider
      );

      const result = await contract.add_player();
      console.log("Added player:", result);
    } catch (error) {
      console.error("Failed to add player:", error);
    }
  };

  const handleMove = async (direction: number) => {
    try {
      const contract = new Contract(
        [
          {
            name: "move",
            type: "function",
            inputs: [{ name: "direction", type: "felt252" }],
            outputs: [],
          },
        ],
        PACROYALE_ADDRESS,
        provider
      );

      const result = await contract.move(direction);
      console.log("Moved:", result);
    } catch (error) {
      console.error("Failed to move:", error);
    }
  };

  return (
    <>
      <DevWallet />
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "board" && (
        <div>
          <Board board={boardData} playerPositions={playerPositions} />
          
          <div className="fixed right-4 top-20 flex flex-col gap-2">
            <button
              onClick={handleAddPlayer}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!address}
            >
              Add Player
            </button>
            
            <div className="grid grid-cols-3 gap-2 w-32">
              <div></div>
              <button
                onClick={() => handleMove(0)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                disabled={!address}
              >
                ↑
              </button>
              <div></div>
              
              <button
                onClick={() => handleMove(2)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                disabled={!address}
              >
                ←
              </button>
              <div></div>
              <button
                onClick={() => handleMove(3)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                disabled={!address}
              >
                →
              </button>
              
              <div></div>
              <button
                onClick={() => handleMove(1)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                disabled={!address}
              >
                ↓
              </button>
              <div></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
