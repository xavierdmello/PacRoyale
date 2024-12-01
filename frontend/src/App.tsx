import "./App.css";

import { DevWallet } from "./components/DevWallet";
import { Provider, Contract, RpcProvider } from "starknet";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Board from "./components/Board";
import { useState, useEffect, useCallback } from "react";
import { PACROYALE_ADDRESS } from "./components/ContractAddresses";

function App() {
  const [page, setPage] = useState("landing");
  const [boardData, setBoardData] = useState([]);
  const [playerPositions, setPlayerPositions] = useState<[number, number][]>([]);
  const [provider] = useState(() => new RpcProvider({ nodeUrl: "http://100.74.177.49:5050" }));
  const [account, setAccount] = useState<any>(null);

  // Effect to handle account connection
  useEffect(() => {
    const connectWallet = async () => {
      try {
        // @ts-ignore
        const starknet = window.starknet;
        if (starknet?.isConnected) {
          setAccount(starknet.account);
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      }
    };
    connectWallet();
  }, []);

  // Effect to fetch game data periodically
  useEffect(() => {
    const fetchGameData = async () => {
      try {
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

    fetchGameData();
    const interval = setInterval(fetchGameData, 2000);
    return () => clearInterval(interval);
  }, [provider]);

  // Effect for handling player actions
  useEffect(() => {
    const handleAddPlayer = async () => {
      if (!account) return;
      try {
        const tx = await account.execute({
          contractAddress: PACROYALE_ADDRESS,
          entrypoint: "add_player",
          calldata: []
        });
        await provider.waitForTransaction(tx.transaction_hash);
      } catch (error) {
        console.error("Failed to add player:", error);
      }
    };

    const handleMove = async (direction: number) => {
      if (!account) return;
      try {
        const tx = await account.execute({
          contractAddress: PACROYALE_ADDRESS,
          entrypoint: "move",
          calldata: [direction]
        });
        await provider.waitForTransaction(tx.transaction_hash);
      } catch (error) {
        console.error("Failed to move:", error);
      }
    };

    // Attach these handlers to window for button clicks
    // @ts-ignore
    window.handleAddPlayer = handleAddPlayer;
    // @ts-ignore
    window.handleMove = handleMove;

    return () => {
      // @ts-ignore
      delete window.handleAddPlayer;
      // @ts-ignore
      delete window.handleMove;
    };
  }, [account, provider]);

  return (
    <>
      <DevWallet />
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "board" && (
        <div>
          <Board board={boardData} playerPositions={playerPositions} />
          
          <div className="fixed right-4 top-20 flex flex-col gap-2">
            <button
              // @ts-ignore
              onClick={() => window.handleAddPlayer()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!account}
            >
              Add Player
            </button>
            
            <div className="grid grid-cols-3 gap-2 w-32">
              {/* Movement buttons */}
              {/* ... existing button layout ... */}
              <button
                // @ts-ignore
                onClick={() => window.handleMove(0)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                disabled={!account}
              >
                ↑
              </button>
              {/* Add similar updates for other direction buttons */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
