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
  return (
    <div className="overflow-x-hidden w-full">
      <LandingPage/>
    </div>
  )
}

export default App;
