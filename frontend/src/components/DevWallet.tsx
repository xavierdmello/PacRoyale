import { useAccount, useConnect, useBalance } from "@starknet-react/core";
import { Connector, ConnectArgs } from "@starknet-react/core";
import { AccountInterface, ProviderInterface } from "starknet";
import { RpcProvider, Account, Contract, CallData, constants } from "starknet";
import { useEffect, useState } from "react";
import SwapModal from "./SwapModal";
import { RPC_URL } from "./RPC";
import {
  PACROYALE_ADDRESS,
  PACTOKEN_ADDRESS,
  USDC_ADDRESS,
} from "./ContractAddresses";
import { createPortal } from "react-dom";

const normalizeAddress = (address: string | undefined): string => {
  if (!address) return "";
  return address.replace("0x0", "0x").toLowerCase();
};

const PREFUNDED_ACCOUNTS = [
  {
    address:
      "0x064b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
    privateKey:
      "0x0000000000000000000000000000000071d7bb07b9a64f6f78ac4c816aff4da9",
    publicKey:
      "0x039d9e6ce352ad4530a0ef5d5a18fd3303c3606a7fa6ac5b620020ad681cc33b",
  },
  {
    address:
      "0x078662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1",
    privateKey:
      "0x000000000000000000000000000000000e1406455b7d66b1690803be066cbe5e",
    publicKey:
      "0x007a1bb2744a7dd29bffd44341dbd78008adb4bc11733601e7eddff322ada9cb",
  },
  {
    address:
      "0x049dfb8ce986e21d354ac93ea65e6a11f639c1934ea253e5ff14ca62eca0f38e",
    privateKey:
      "0x00000000000000000000000000000000a20a02f0ac53692d144b20cb371a60d7",
    publicKey:
      "0x00b8fd4ddd415902d96f61b7ad201022d495997c2dff8eb9e0eb86253e30fabc",
  },
  {
    address:
      "0x04f348398f859a55a0c80b1446c5fdc37edb3a8478a32f10764659fc241027d3",
    privateKey:
      "0x00000000000000000000000000000000a641611c17d4d92bd0790074e34beeb7",
    publicKey:
      "0x05e05d2510c6110bde03df9c1c126a1f592207d78cd9e481ac98540d5336d23c",
  },
  {
    address:
      "0x00d513de92c16aa42418cf7e5b60f8022dbee1b4dfd81bcf03ebee079cfb5cb5",
    privateKey:
      "0x000000000000000000000000000000005b4ac23628a5749277bcabbf4726b025",
    publicKey:
      "0x04708e28e2424381659ea6b7dded2b3aff4b99debfcf6080160a9d098ac2214d",
  },
  {
    address:
      "0x01e8c6c17efa3a047506c0b1610bd188aa3e3dd6c5d9227549b65428de24de78",
    privateKey:
      "0x00000000000000000000000000000000836203aceb0e9b0066138c321dda5ae6",
    publicKey:
      "0x0776d33371a98abee91ce60ac04321361565c8623cb612ee9357092da2162f51",
  },
  {
    address:
      "0x0557ba9ef60b52dad611d79b60563901458f2476a5c1002a8b4869fcb6654c7e",
    privateKey:
      "0x0000000000000000000000000000000015b5e3013d752c909988204714f1ff35",
    publicKey:
      "0x004236bd1a08ee4bc3288081dfaf2b71d9a6e6e573d1b31a62719db73a88bb55",
  },
  {
    address:
      "0x003736286f1050d4ba816b4d56d15d80ca74c1752c4e847243f1da726c36e06f",
    privateKey:
      "0x00000000000000000000000000000000a56597ba3378fa9e6440ea9ae0cf2865",
    publicKey:
      "0x020b6aad24b5741eb49ed1b00ea78e3657e4d74af47e329f6f9fe489517474db",
  },
  {
    address:
      "0x04d8bb41636b42d3c69039f3537333581cc19356a0c93904fa3e569498c23ad0",
    privateKey:
      "0x00000000000000000000000000000000b467066159b295a7667b633d6bdaabac",
    publicKey:
      "0x00c6c2f7833f681c8fe001533e99571f6ff8dec59268792a429a14b5b252f1ad",
  },
  {
    address:
      "0x04b3f4ba8c00a02b66142a4b1dd41a4dfab4f92650922a3280977b0f03c75ee1",
    privateKey:
      "0x0000000000000000000000000000000057b2f8431c772e647712ae93cc616638",
    publicKey:
      "0x0374f7fcb50bc2d6b8b7a267f919232e3ac68354ce3eafe88d3df323fc1deb23",
  },
];

// Mock wallet options
const MOCK_WALLETS = [
  { name: "Wallet 1", address: PREFUNDED_ACCOUNTS[0].address },
  { name: "Wallet 2", address: PREFUNDED_ACCOUNTS[1].address },
  { name: "Wallet 3", address: PREFUNDED_ACCOUNTS[2].address },
  { name: "Wallet 4", address: PREFUNDED_ACCOUNTS[3].address },
  { name: "Wallet 5", address: PREFUNDED_ACCOUNTS[4].address },
];

class DevnetConnector extends Connector {
  private accountInstance: Account | null = null;
  private provider: RpcProvider;
  private selectedAccount: (typeof PREFUNDED_ACCOUNTS)[0];

  constructor(account: (typeof PREFUNDED_ACCOUNTS)[0]) {
    super();
    this.provider = new RpcProvider({
      nodeUrl: RPC_URL,
      chainId: constants.StarknetChainId.SN_GOERLI,
    });
    this.selectedAccount = account;
  }

  available(): boolean {
    return true;
  }

  async ready(): Promise<boolean> {
    return true;
  }

  async connect(
    args?: ConnectArgs
  ): Promise<{ account: string; chainId: bigint }> {
    console.log("Connecting to devnet...");
    this.accountInstance = new Account(
      this.provider,
      this.selectedAccount.address,
      this.selectedAccount.privateKey
    );

    const chainId = await this.provider.getChainId();
    console.log("Connected with chainId:", chainId);

    return {
      account: this.accountInstance.address,
      chainId: BigInt(chainId),
    };
  }

  async disconnect(): Promise<void> {
    this.accountInstance = null;
  }

  async account(): Promise<AccountInterface> {
    if (!this.accountInstance) throw new Error("Not connected");
    return this.accountInstance;
  }

  async chainId(): Promise<bigint> {
    if (!this.accountInstance) throw new Error("Not connected");
    const chainId = await this.provider.getChainId();
    return BigInt(chainId);
  }

  async request<T extends any>(call: any): Promise<T> {
    throw new Error("Method not implemented.");
  }

  get id(): string {
    return "devnet";
  }

  get name(): string {
    return "Devnet";
  }

  get icon(): any {
    return {
      dark: "",
      light: "",
    };
  }
}

interface DevWalletProps {
  playerPositions: [number, number, boolean, boolean, number][];
  isInGame: boolean;
}

export function DevWallet({ playerPositions, isInGame }: DevWalletProps) {
  const { connect } = useConnect();
  const { address, account } = useAccount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Add balance hooks for both tokens
  const { data: ethBalance } = useBalance({
    address,
    watch: true,
  });

  const { data: pacBalance } = useBalance({
    address,
    token: PACTOKEN_ADDRESS,
    watch: true,
  });

  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
    watch: true,
  });

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const connectWallet = async (walletIndex: number) => {
    const connector = new DevnetConnector(PREFUNDED_ACCOUNTS[walletIndex]);
    try {
      await connect({ connector });
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const handleDisconnect = async () => {
    window.location.reload();
  };

  // Add new functions for token operations
  const mintUSDC = async (amount: number) => {
    if (!account) return;

    try {
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
        USDC_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      // Convert amount to proper decimals (18 decimals for ERC20)
      // 100 USDC = 100 * 10^18
      const DECIMALS = 18;
      const amountWithDecimals = BigInt(amount / 10) * BigInt(10 ** DECIMALS);

      const calldata = CallData.compile([
        { low: amountWithDecimals.toString(), high: "0" },
      ]);
      const result = await contract.mint(calldata);
      console.log("Minted USDC:", result);
    } catch (error) {
      console.error("Failed to mint USDC:", error);
    }
  };

  const burnUSDC = async (amount: number) => {
    if (!account) return;

    try {
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
        USDC_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      const result = await contract.burn(CallData.compile([amount]));
      console.log("Burned USDC:", result);
    } catch (error) {
      console.error("Failed to burn USDC:", error);
    }
  };

  const mintPAC = async (amount: number) => {
    if (!account) return;

    try {
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
        PACTOKEN_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      const result = await contract.mint(CallData.compile([amount]));
      console.log("Minted PAC:", result);
    } catch (error) {
      console.error("Failed to mint PAC:", error);
    }
  };

  const burnPAC = async (amount: number) => {
    if (!account) return;

    try {
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
        PACTOKEN_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      const result = await contract.burn(CallData.compile([amount]));
      console.log("Burned PAC:", result);
    } catch (error) {
      console.error("Failed to burn PAC:", error);
    }
  };

  const approveUSDCForPAC = async (amount: number) => {
    if (!account) return;

    try {
      const contract = new Contract(
        [
          {
            name: "approve",
            type: "function",
            inputs: [
              { name: "spender", type: "ContractAddress" },
              { name: "amount", type: "u256" },
            ],
            outputs: [],
            stateMutability: "external",
          },
        ],
        USDC_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      const result = await contract.approve(
        CallData.compile([PACTOKEN_ADDRESS, amount])
      );
      console.log("Approved USDC for PAC:", result);
    } catch (error) {
      console.error("Failed to approve USDC:", error);
    }
  };

  const approvePACForGame = async (amount: number) => {
    if (!account) return;

    try {
      const contract = new Contract(
        [
          {
            name: "approve",
            type: "function",
            inputs: [
              { name: "spender", type: "ContractAddress" },
              { name: "amount", type: "u256" },
            ],
            outputs: [],
            stateMutability: "external",
          },
        ],
        PACTOKEN_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      const result = await contract.approve(
        CallData.compile([PACROYALE_ADDRESS, amount])
      );
      console.log("Approved PAC for game:", result);
    } catch (error) {
      console.error("Failed to approve PAC:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gray-900 text-white shadow-md">
      <div className="text-xl font-bold">PacRoyale</div>
      <SwapModal />

      <div className="flex items-center gap-4">
        {address ? (
          <>
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-gray-400">
                  {ethBalance?.formatted || "0"} {ethBalance?.symbol || "ETH"}
                </span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-gray-400">
                  {(() => {
                    if (!isInGame) {
                      return "50";
                    }
                    const playerIndex = playerPositions.findIndex(
                      (_, index) =>
                        normalizeAddress(address) ===
                        normalizeAddress(PREFUNDED_ACCOUNTS[index]?.address)
                    );
                    return playerIndex !== -1
                      ? playerPositions[playerIndex][4]
                      : "0";
                  })()}{" "}
                  PAC
                </span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-gray-400">
                  {usdcBalance?.formatted || "0"} USDC
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => mintUSDC(1000)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg text-sm"
                >
                  Mint USDC
                </button>
                <button
                  onClick={() => approveUSDCForPAC(1000)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg text-sm"
                >
                  Approve USDC
                </button>
                <button
                  onClick={() => mintPAC(1000)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg text-sm"
                >
                  Mint PAC
                </button>
                <button
                  onClick={() => approvePACForGame(1000)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg text-sm"
                >
                  Approve PAC
                </button>
              </div>
              <span className="text-white">{truncateAddress(address)}</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>

            {isDropdownOpen &&
              createPortal(
                <div className="fixed inset-0 z-[100]">
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/20"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* Dropdown positioned relative to button */}
                  <div
                    className="absolute bg-gray-800 rounded-lg shadow-lg w-64 text-white"
                    style={{
                      top: "4rem", // Adjust based on your navbar height
                      right: "2rem", // Adjust based on your desired positioning
                    }}
                  >
                    {MOCK_WALLETS.map((wallet, index) => (
                      <div
                        key={wallet.address}
                        onClick={() => connectWallet(index)}
                        className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors
                        ${
                          index !== MOCK_WALLETS.length - 1
                            ? "border-b border-gray-700"
                            : ""
                        }`}
                      >
                        <div className="font-medium text-white">
                          {wallet.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {truncateAddress(wallet.address)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>,
                document.body
              )}
          </div>
        )}
      </div>
    </nav>
  );
}
