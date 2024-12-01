import { useAccount, useConnect, useBalance } from "@starknet-react/core";
import { Connector, ConnectorData } from "@starknet-react/core";
import { AccountInterface, ProviderInterface } from "starknet";
import { RpcProvider, Account } from "starknet";
import { useEffect, useState } from "react";

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

class DevnetConnector extends Connector {
  private accountInstance: Account | null = null;
  private provider: RpcProvider;
  private selectedAccount: typeof PREFUNDED_ACCOUNTS[0];
  
  constructor(account: typeof PREFUNDED_ACCOUNTS[0]) {
    super();
    this.provider = new RpcProvider({
      nodeUrl: "http://localhost:5050",
      chainId: "0x534e5f474f45524c49"
    });
    this.selectedAccount = account;
  }

  available(): boolean {
    return true;
  }

  async ready(): Promise<boolean> {
    return true;
  }

  async connect(): Promise<ConnectorData> {
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
      chainId: chainId
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
    return await this.provider.getChainId();
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
  const { address } = useAccount();
  const [rawBalance, setRawBalance] = useState<string>('');
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const { data: balance } = useBalance({
    address,
    watch: true
  });

  const connectDevnet = async (accountIndex: number) => {
    const connector = new DevnetConnector(PREFUNDED_ACCOUNTS[accountIndex]);
    try {
      await connect({ connector });
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  useEffect(() => {
    if (!address) {
      connectDevnet(selectedAccountIndex);
    }
  }, [connect, address, selectedAccountIndex]);

  useEffect(() => {
    const checkBalance = async () => {
      if (address) {
        try {
          const provider = new RpcProvider({
            nodeUrl: "http://localhost:5050",
          });
          const response = await provider.callContract({
            contractAddress: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
            entrypoint: "balanceOf",
            calldata: [address]
          });
          console.log("Raw balance response:", response);
          setRawBalance(response.result[0]);
        } catch (error) {
          console.error("Failed to get balance:", error);
        }
      }
    };

    checkBalance();
  }, [address]);

  const handleAccountChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newIndex = parseInt(event.target.value);
    setSelectedAccountIndex(newIndex);
    await connectDevnet(newIndex);
  };

  return (
    <div>
      <select 
        value={selectedAccountIndex} 
        onChange={handleAccountChange}
        style={{ marginBottom: '1rem', padding: '0.5rem' }}
      >
        {PREFUNDED_ACCOUNTS.map((account, index) => (
          <option key={account.address} value={index}>
            Account {index + 1}: {account.address.substring(0, 10)}...
          </option>
        ))}
      </select>

      {address ? (
        <div>
          <p>Connected: {address}</p>
          <p>Balance from hook: {balance?.formatted} {balance?.symbol}</p>
          <p>Raw balance: {rawBalance} WEI</p>
        </div>
      ) : (
        <p>Connecting to devnet...</p>
      )}
    </div>
  );
}
