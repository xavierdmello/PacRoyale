import { useState } from "react";
import { useAccount, useContract } from "@starknet-react/core";
import { Contract, CallData } from "starknet";

const SwapModal = () => {
  const [amount, setAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<"mint" | "burn">("mint");
  const { account } = useAccount();

  const PAC_ADDRESS = "0x030a17f542dec4dfa24ca43c23b13aa2c855f4386d6b88ab6ebadeb8e4d3790c";

  const handleMint = async () => {
    if (!account || !amount) return;

    try {
      setIsSwapping(true);
      const contract = new Contract(
        [
          {
            name: "mint",
            type: "function",
            inputs: [{ name: "amount", type: "u256" }],
            outputs: [],
            stateMutability: "external",
          },
        ],
        PAC_ADDRESS,
        account
      );

      const calldata = CallData.compile([amount]);
      const response = await contract.mint(calldata);
      console.log("Mint response:", response);
    } catch (error) {
      console.error("Error minting:", error);
    } finally {
      setIsSwapping(false);
      setShowModal(false);
    }
  };

  const handleBurn = async () => {
    if (!account || !amount) return;

    try {
      setIsSwapping(true);
      const contract = new Contract(
        [
          {
            name: "burn",
            type: "function",
            inputs: [{ name: "amount", type: "u256" }],
            outputs: [],
            stateMutability: "external",
          },
        ],
        PAC_ADDRESS,
        account
      );

      const calldata = CallData.compile([amount]);
      const response = await contract.burn(calldata);
      console.log("Burn response:", response);
    } catch (error) {
      console.error("Error burning:", error);
    } finally {
      setIsSwapping(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Swap Tokens
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Swap Tokens</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("mint")}
                className={`flex-1 py-2 rounded-lg ${
                  mode === "mint"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Mint
              </button>
              <button
                onClick={() => setMode("burn")}
                className={`flex-1 py-2 rounded-lg ${
                  mode === "burn"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                }`}
              >
                Burn
              </button>
            </div>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-4"
            />

            <button
              onClick={mode === "mint" ? handleMint : handleBurn}
              disabled={isSwapping || !amount || !account}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSwapping ? "Processing..." : mode === "mint" ? "Mint PAC" : "Burn PAC"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SwapModal; 