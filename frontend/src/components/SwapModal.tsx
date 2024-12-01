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
  const USDC_ADDRESS = "0x030a17f542dec4dfa24ca43c23b13aa2c855f4386d6b88ab6ebadeb8e4d3790c";
  const PACTOKEN_ADDRESS = "0x030a17f542dec4dfa24ca43c23b13aa2c855f4386d6b88ab6ebadeb8e4d3790c";

  const handleUsdcToPac = async () => {
    if (!account || !amount) return;

    try {
      setIsSwapping(true);

      // First approve USDC spending
      const usdcContract = new Contract(
        [
          {
            name: "approve",
            type: "function",
            inputs: [
              { name: "spender", type: "ContractAddress" },
              { name: "amount", type: "u256" }
            ],
            outputs: [],
            stateMutability: "external",
          }
        ],
        USDC_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      // Approve USDC spending
      const approveResponse = await usdcContract.approve(
        CallData.compile([PACTOKEN_ADDRESS, amount])
      );
      console.log("USDC approval response:", approveResponse);

      // Then mint PAC tokens
      const pacContract = new Contract(
        [
          {
            name: "mint",
            type: "function",
            inputs: [{ name: "amount", type: "u256" }],
            outputs: [],
            stateMutability: "external",
          }
        ],
        PACTOKEN_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      // Note: The contract will mint 10x this amount in PAC tokens
      const mintResponse = await pacContract.mint(CallData.compile([amount]));
      console.log("PAC mint response:", mintResponse);
    } catch (error) {
      console.error("Error minting PAC:", error);
    } finally {
      setIsSwapping(false);
      setShowModal(false);
    }
  };

  const handlePacToUsdc = async () => {
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
          }
        ],
        PACTOKEN_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      // Note: The contract will return amount/10 in USDC
      const response = await contract.burn(CallData.compile([amount]));
      console.log("PAC burn response:", response);
    } catch (error) {
      console.error("Error burning PAC:", error);
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
              onClick={mode === "mint" ? handleUsdcToPac : handlePacToUsdc}
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