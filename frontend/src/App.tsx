import "./App.css";

import { DevWallet } from "./components/DevWallet";
import { Provider, Contract, RpcProvider, CallData } from "starknet";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Board from "./components/Board";
import { useState, useEffect, useMemo } from "react";
import { PACROYALE_ADDRESS } from "./components/ContractAddresses";
import { useAccount } from "@starknet-react/core";
import GameEndModal from "./components/GameEndModal";

function App() {
  const [page, setPage] = useState("landing");
  const [boardData, setBoardData] = useState([]);
  const [playerPositions, setPlayerPositions] = useState<[number, number, boolean, boolean, number][]>([]);
  const { address, account } = useAccount();
  const [gameId, setGameId] = useState(1);
  const provider = useMemo(
    () =>
      new RpcProvider({
        nodeUrl: "http://100.74.177.49:5050",
      }),
    []
  );
  const [topGameId, setTopGameId] = useState(1);
  const [winner, setWinner] = useState<string | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [winningPlayerNumber, setWinningPlayerNumber] = useState<number | null>(null);
  const [winningBalance, setWinningBalance] = useState(0);

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

        // Skip the first element (array length) and process groups of 5 values
        const positions: [number, number, boolean, boolean, number][] = [];
        const positionData = positionsResponse.slice(1);

        for (let i = 0; i < positionData.length; i += 5) {
          const x = Number(BigInt(positionData[i]));
          const y = Number(BigInt(positionData[i + 1]));
          const isPoweredUp = Number(BigInt(positionData[i + 2])) === 1;
          const isDead = Number(BigInt(positionData[i + 3])) === 1;
          const balance = Number(BigInt(positionData[i + 4]));
          positions.push([x, y, isPoweredUp, isDead, balance]);
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

    // Initial fetch
    fetchData();

    // Set up interval for map updates
    const intervalId = setInterval(fetchData, 1000);

    // Cleanup
    return () => clearInterval(intervalId);
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
        account
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
              { name: "direction", type: "felt252" },
            ],
            outputs: [],
            state_mutability: "external",
          },
        ],
        PACROYALE_ADDRESS,
        account
      );

      // Use CallData.compile to properly format both arguments
      const calldata = CallData.compile([gameId, direction]);
      const result = await contract.move(calldata);
      console.log("Moved:", result);
    } catch (error) {
      console.error("Failed to move:", error);
    }
  };

  // Add new function to fetch top game ID
  const fetchTopGameId = async () => {
    try {
      const response = await provider.callContract({
        contractAddress: PACROYALE_ADDRESS,
        entrypoint: "get_top_game_id",
        calldata: CallData.compile([]),
      });

      if (response && response.length > 0) {
        const id = Number(BigInt(response[0]));
        setTopGameId(id);
      }
    } catch (error) {
      console.error("Failed to fetch top game ID:", error);
    }
  };

  // Add new useEffect for polling top game ID
  useEffect(() => {
    // Initial fetch
    fetchTopGameId();

    // Set up interval
    const intervalId = setInterval(fetchTopGameId, 1000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [provider]); // Depend on provider

  // Add new function to initialize game
  const handleInitGame = async () => {
    try {
      if (!account) {
        console.error("No account connected");
        return;
      }

      const result = await account.execute({
        contractAddress: PACROYALE_ADDRESS,
        entrypoint: "init_game",
        calldata: CallData.compile([])
      });
      
      console.log("Initialized game:", result);
    } catch (error) {
      console.error("Failed to initialize game:", error);
    }
  };

  // Add new function to fetch winner
  const fetchWinner = async () => {
    try {
      const winnerResponse = await provider.callContract({
        contractAddress: PACROYALE_ADDRESS,
        entrypoint: "get_winner",
        calldata: CallData.compile([gameId]),
      });

      if (winnerResponse && winnerResponse[0] !== '0x0') {
        const winnerAddress = winnerResponse[0];
        setWinner(winnerAddress);
        console.log("Game over! Winner:", winnerAddress);

        // Find the player number by matching the winner address with positions
        const playerIndex = playerPositions.findIndex((_, index) => {
          const playerAddress = playerPositions[index * 5 + 4]; // Get the address from position data
          return playerAddress === winnerAddress;
        });

        if (playerIndex !== -1) {
          setWinningPlayerNumber(playerIndex + 1); // Add 1 to make it 1-based
          setWinningBalance(playerPositions[playerIndex * 5 + 4]); // Get the balance
        }

        setShowGameOverModal(true);
      }
    } catch (error) {
      console.error("Failed to fetch winner:", error);
    }
  };

  // Add new useEffect for polling winner
  useEffect(() => {
    if (page === "board") {
      // Initial fetch
      fetchWinner();

      // Set up interval
      const intervalId = setInterval(fetchWinner, 1000);

      // Cleanup
      return () => clearInterval(intervalId);
    }
  }, [page, gameId]); // Depend on page and gameId

  return (
    <>
      <DevWallet />{" "}
      {page == "board" && (
        <div className="fixed left-4 top-20 flex flex-col gap-2 z-50">
          <div className="text-white">Game ID: {gameId}</div>
          <div className="text-white">Top Game ID: {topGameId}</div>
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
          {gameId === topGameId + 1 && (
            <button
              onClick={handleInitGame}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              disabled={!address}
            >
              Init Game
            </button>
          )}
        </div>
      )}
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "board" && (
        <div>
          <Board
            board={boardData}
            playerPositions={playerPositions}
            handleMove={handleMove}
          />

          <div className="fixed right-4 top-20 flex flex-col gap-2">
            <button
              onClick={handleAddPlayer}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!address}
            >
              Add Player
            </button>
          </div>
        </div>
      )}
      {showGameOverModal && (
        <GameEndModal
          isOpen={showGameOverModal}
          isWinner={address === winner}
          tokenAmount={winningBalance}
          onClose={() => setShowGameOverModal(false)}
          winnerText={`Player ${winningPlayerNumber} Won!`}
        />
      )}
    </>
  );
}

export default App;
