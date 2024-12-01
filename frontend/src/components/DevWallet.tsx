import { useAccount, useConnect, useBalance } from "@starknet-react/core";
import { Connector, ConnectArgs } from "@starknet-react/core";
import { AccountInterface, ProviderInterface } from "starknet";
import { RpcProvider, Account, Contract, CallData, constants } from "starknet";
import { useEffect, useState } from "react";
import SwapModal from "./SwapModal";
import { PACROYALE_ADDRESS, PACTOKEN_ADDRESS, USDC_ADDRESS } from "./ContractAddresses";
import { createPortal } from 'react-dom';

const PREFUNDED_ACCOUNTS = [
  {
    address: "0x04bde6f77c36ecaccf5bfc751715eef76fb057550d3bc3d68578874f71e1030c",
    privateKey: "0x0000000000000000000000000000000051ed85f0e1e3c681a082222b16f75d51",
  },
  {
    address: "0x047f14191fb3edaa94c507d2e016ca1d491104f0cbad0a5c74412df6f2153c00",
    privateKey: "0x000000000000000000000000000000008f56cad93d79c6fd96f433cb6b4bb80b",
  },
  {
    address: "0x0577412f1f4676f16070bf3b9c2b16d34218f32bea0baa7aeb78796c5c6a158d",
    privateKey: "0x000000000000000000000000000000005ced7df5bed476cc804777d507b95fcb",
  },
  {
    address: "0x05014c0b0b7b3018090411c10700d0048885520ba23a97b47b87f11a955dd62d",
    privateKey: "0x00000000000000000000000000000000552066c4d3f3abed99a0b0670f498c9f",
  },
  {
    address: "0x039bd396c4030e56dc98a69f7fed64c33814c7478116c01b865dc6be234d33cb",
    privateKey: "0x0000000000000000000000000000000081df718af81f91c393032505b4080697",
  },
  {
    address: "0x01b7a7a9ea41cf732ed17db68a11d9b2f5d03a779934a024e9fd1dc1346dc943",
    privateKey: "0x00000000000000000000000000000000748353fb4b43bd70c28aa8cdc7bd2051",
  },
  // ... add more accounts as needed
];

// Mock wallet options
const MOCK_WALLETS = [
  { name: "Wallet 1", address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
  { name: "Wallet 2", address: "0x123f681646d4a755815f9cb19e1acc8565a0c2ac" },
  { name: "Wallet 3", address: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359" },
  { name: "Wallet 4", address: "0x2f318C334780961FB129D2a6c30D0763d9a5C970" },
  { name: "Wallet 5", address: "0x6b175474e89094c44da98b954eedeac495271d0f" }
];

class DevnetConnector extends Connector {
  private accountInstance: Account | null = null;
  private provider: RpcProvider;
  private selectedAccount: typeof PREFUNDED_ACCOUNTS[0];
  
  constructor(account: typeof PREFUNDED_ACCOUNTS[0]) {
    super();
    this.provider = new RpcProvider({
      nodeUrl: "http://100.74.177.49:5050",
      chainId: constants.StarknetChainId.SN_GOERLI
    });
    this.selectedAccount = account;
  }

  available(): boolean {
    return true;
  }

  async ready(): Promise<boolean> {
    return true;
  }

  async connect(args?: ConnectArgs): Promise<{ account: string; chainId: bigint }> {
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
      chainId: BigInt(chainId)
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

export function DevWallet() {
  const { connect } = useConnect();
  const { address, account } = useAccount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Add balance hooks for both tokens
  const { data: ethBalance } = useBalance({
    address,
    watch: true
  });

  const { data: pacBalance } = useBalance({
    address,
    token: PACTOKEN_ADDRESS,
    watch: true
  });

  const { data: usdcBalance } = useBalance({
    address,
    token: USDC_ADDRESS,
    watch: true
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
          }
        ],
        USDC_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      // Convert amount to proper decimals (18 decimals for ERC20)
      // 100 USDC = 100 * 10^18
      const DECIMALS = 18;
      const amountWithDecimals = BigInt(amount / 10) * BigInt(10 ** DECIMALS);

      const calldata = CallData.compile([{ low: amountWithDecimals.toString(), high: "0" }]);
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
          }
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
          }
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
          }
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

      const result = await contract.approve(CallData.compile([PACTOKEN_ADDRESS, amount]));
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
              { name: "amount", type: "u256" }
            ],
            outputs: [],
            stateMutability: "external",
          }
        ],
        PACTOKEN_ADDRESS,
        account,
        { cairoVersion: "2" }
      );

      const result = await contract.approve(CallData.compile([PACROYALE_ADDRESS, amount]));
      console.log("Approved PAC for game:", result);
    } catch (error) {
      console.error("Failed to approve PAC:", error);
    }
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-gray-900 text-white shadow-md">
      <div className="text-xl font-bold">
        PacRoyale
      </div>
      <SwapModal />

      <div className="flex items-center gap-4">
        {address ? (
          <>
            <div className="flex items-center gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-gray-400">
                  {ethBalance?.formatted || '0'} {ethBalance?.symbol || 'ETH'}
                </span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-gray-400">
                  {pacBalance?.formatted || '0'} PAC
                </span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <span className="text-gray-400">
                  {usdcBalance?.formatted || '0'} USDC
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
              <span className="text-white">
                {truncateAddress(address)}
              </span>
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
            
            {isDropdownOpen && createPortal(
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
                    top: '4rem',  // Adjust based on your navbar height
                    right: '2rem' // Adjust based on your desired positioning
                  }}
                >
                  {MOCK_WALLETS.map((wallet, index) => (
                    <div
                      key={wallet.address}
                      onClick={() => connectWallet(index)}
                      className={`p-4 cursor-pointer hover:bg-gray-700 transition-colors
                        ${index !== MOCK_WALLETS.length - 1 ? 'border-b border-gray-700' : ''}`}
                    >
                      <div className="font-medium text-white">{wallet.name}</div>
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
