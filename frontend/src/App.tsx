import "./App.css";

import { DevWallet } from "./components/DevWallet";
import { useReadContract } from "@starknet-react/core";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Board from "./components/Board";
import { useState } from "react";
import { PACROYALE_ADDRESS } from "./components/ContractAddresses";

// Define the contract ABI for the specific functions we need
const pacRoyaleAbi = [
  {
    inputs: [],
    name: "get_map",
    outputs: [{ type: "core::array::Array::core::felt252" }],
    state_mutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "x", type: "core::integer::u64" },
      { name: "y", type: "core::integer::u64" }
    ],
    name: "get_map_value",
    outputs: [{ type: "core::felt252" }],
    state_mutability: "view",
    type: "function",
  }
] as const;



function App() {
  const [page, setPage] = useState("landing");
  const { data: mapData } = useReadContract({
    address: PACROYALE_ADDRESS,
    abi: pacRoyaleAbi,
    functionName: "get_map",
  });

  const { data: sampleMapValue } = useReadContract({
    address: PACROYALE_ADDRESS,
    abi: pacRoyaleAbi,
    functionName: "get_map_value",
    args: [0, 0]
  });

  console.log("Map data:", mapData);
  console.log("Sample map value at (0,0):", sampleMapValue);

  return (
    <>
      <DevWallet />
      {page === "landing" && <LandingPage />}
      {/* Pass the map data to the Board component */}
      {page === "board" && <Board board={mapData} />}
    </>
  );
}

export default App;
