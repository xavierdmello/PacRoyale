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
  const [playerPositions, setPlayerPositions] = useState<[number, number][]>([]);
  const { address, account } = useAccount();
  const provider = useMemo(() => new RpcProvider({
    nodeUrl: "http://100.74.177.49:5050",
  }), []);

  // Separate function to fetch player positions
  const fetchPlayerPositions = async () => {
    try {
      console.log("Fetching positions..."); // Debug log
      const positionsResponse = await provider.callContract({
        contractAddress: PACROYALE_ADDRESS,
        entrypoint: "get_positions",
      });

      if (positionsResponse) {
        const positions = positionsResponse.slice(1).map((arr: any) => [
          parseInt(arr[0], 16),
          parseInt(arr[1], 16)
        ]) as [number, number][];
        setPlayerPositions(positions);
        
        // Log positions with formatted output
        if (positions.length > 0) {
          console.log('Current Players:');
          positions.forEach((pos, index) => {
            console.log(`Player ${index + 1}: (${pos[0]}, ${pos[1]})`);
          });
          console.log('------------------------');
        } else {
          console.log('No players currently in game');
          console.log('------------------------');
        }
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
  }, [page]); // Add fetchPlayerPositions to deps if needed

  // Modify board data fetching useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Remove provider creation from here since we're using the memoized one
        const boardResponse = await provider.callContract({
          contractAddress: PACROYALE_ADDRESS,
          entrypoint: "get_map",
        });

        if (boardResponse) {
          const parsedData = boardResponse.slice(1).map((hex: string) =>
            parseInt(hex, 16)
          );
          setBoardData(parsedData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []); // Add provider to deps if not memoized

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
            inputs: [],
            outputs: [{ name: "", type: "felt252" }],
            stateMutability: "external",
          },
        ],  
        PACROYALE_ADDRESS,
        account,
        // @ts-ignore
        { cairoVersion: "2" }
      );

      const result = await contract.add_player();
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
            inputs: [{ name: "direction", type: "felt252" }],
            outputs: [],
            state_mutability: "external",
          },
        ],
        PACROYALE_ADDRESS,
        account,
        { cairoVersion: "1" }
      );

      const calldata = CallData.compile({ direction: direction });
      const result = await contract.move(calldata);
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
