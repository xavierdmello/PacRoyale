import "./App.css";

import { DevWallet } from "./components/DevWallet";
import { Provider, Contract, RpcProvider, CallData } from "starknet";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Board from "./components/Board";
import { useState, useEffect, useMemo } from "react";
import { PACROYALE_ADDRESS } from "./components/ContractAddresses";
import { useAccount } from "@starknet-react/core";

function App() {
  const [page, setPage] = useState("landing");
  const [boardData, setBoardData] = useState([]);
  const [playerPositions, setPlayerPositions] = useState<[number, number][]>(
    []
  );
  const { address, account } = useAccount();
  const [gameId, setGameId] = useState(1);
  const provider = useMemo(
    () =>
      new RpcProvider({
        nodeUrl: "http://100.74.177.49:5050",
      }),
    []
  );

  // Separate function to fetch player positions
  const fetchPlayerPositions = async () => {
    try {
      console.log("Fetching positions...");
      const positionsResponse = await provider.callContract({
        contractAddress: PACROYALE_ADDRESS,
        entrypoint: "get_positions",
        calldata: CallData.compile([gameId]),
      });

      if (positionsResponse) {
        console.log("Raw response:", positionsResponse);

        // Skip the first element (array length) and process pairs of values
        const positions: [number, number][] = [];
        const positionData = positionsResponse.slice(1);
        
        for (let i = 0; i < positionData.length; i += 2) {
          const x = Number(BigInt(positionData[i]));
          const y = Number(BigInt(positionData[i + 1]));
          positions.push([x, y]);
        }

        console.log("Processed positions:", positions);
        setPlayerPositions(positions);
      }
    } catch (error) {
      console.error("Failed to fetch positions:", error);
    }
  };

  // Set up interval for position updates
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (page === "board") {
      // Initial fetch
      fetchPlayerPositions();

      intervalId = setInterval(fetchPlayerPositions, 1000); // Increased interval to 1 second

      return () => clearInterval(intervalId);
    }
  }, [page, gameId]); // Add fetchPlayerPositions to deps if needed

  // Modify board data fetching useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const boardResponse = await provider.callContract({
          contractAddress: PACROYALE_ADDRESS,
          entrypoint: "get_map",
          calldata: CallData.compile([gameId]),
        });

        console.log("Board response:", boardResponse);
        if (boardResponse) {
          // Skip the first element (array length) and parse the hex values
          const parsedData = boardResponse
            .slice(1)
            .map((hex: string) => Number(BigInt(hex)));
          setBoardData(parsedData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [gameId, provider]);

  const handleAddPlayer = async () => {
    try {
      if (!account) {
        console.error("No account connected");
        return;
      }

      const contract = new Contract(
        [
          {
            name: "add_player",
            type: "function",
            inputs: [{ name: "game_id", type: "u64" }],
            outputs: [{ name: "", type: "felt252" }],
            stateMutability: "external",
          },
        ],
        PACROYALE_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      // Use CallData.compile to properly format the u64 argument
      const calldata = CallData.compile([gameId]);
      const result = await contract.add_player(calldata);
      console.log("Added player:", result);
    } catch (error) {
      console.error("Failed to add player:", error);
    }
  };

  const handleMove = async (direction: number) => {
    try {
      if (!account) {
        console.error("No account connected");
        return;
      }

      const contract = new Contract(
        [
          {
            name: "move",
            type: "function",
            inputs: [
              { name: "game_id", type: "u64" },
              { name: "direction", type: "felt252" }
            ],
            outputs: [],
            state_mutability: "external",
          },
        ],
        PACROYALE_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      // Use CallData.compile to properly format both arguments
      const calldata = CallData.compile([gameId, direction]);
      const result = await contract.move(calldata);
      console.log("Moved:", result);
    } catch (error) {
      console.error("Failed to move:", error);
    }
  };

  return (
    <>
      <DevWallet />{" "}
      <div className="fixed left-4 top-20 flex flex-col gap-2 z-50">
        <div className="text-white">Game ID: {gameId}</div>
        <button 
          onClick={() => setGameId(gameId + 1)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Next Game
        </button>
        <button 
          onClick={() => setGameId(gameId - 1)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Previous Game
        </button>
      </div>
      
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
