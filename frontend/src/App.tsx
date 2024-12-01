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

  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const provider = new RpcProvider({
          nodeUrl: "http://100.74.177.49:5050",
        });

        const response = await provider.callContract({
          contractAddress:
            "0x028dc8c9105335b2b78b451dc031e6fa0fac3a4ca7b5d2d36ddb63dbb61c0e46",
          entrypoint: "get_map",
        });

        if (response) {
          // Parse hex values to integers
          const parsedData = response.slice(1).map((hex: string) =>
            parseInt(hex, 16)
          );
          console.log("Parsed board data:", parsedData);
          setBoardData(parsedData);
        }
      } catch (error) {
        console.error("Failed to fetch board data:", error);
      }
    };

    fetchBoardData();
  }, []);
  console.log(boardData);
  return (
    <>
      <DevWallet />
      {page === "landing" && <LandingPage setPage={setPage} />}
      {page === "board" && <Board board={boardData} />}
    </>
  );
}

export default App;
