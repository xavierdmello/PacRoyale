[![image](https://github.com/user-attachments/assets/f277b63a-75c8-4683-868a-db838788949d)](https://dorahacks.io/buidl/20381)

On-Chain Real-Time Pac-Man Battle Royale, Winner Takes All. Won $3000 at Hack Western 11!

Built on [Starknet](https://www.starknet.io/)

More info: https://dorahacks.io/buidl/20381

# Getting Started
1. Install Rust: https://www.rust-lang.org/tools/install
2. Install Scarb, Starkli, and Starknet Foundry: https://docs.starknet.io/quick-start/environment-setup/
3. Install Starknet Devnet: https://0xspaceshard.github.io/starknet-devnet-rs/
4. Run Starknet Devnet: `starknet-devnet --seed 0`
5. Deploy your account:
   - `starkli signer keystore from-key account0_keystore.json`
      - Use `0x0000000000000000000000000000000071d7bb07b9a64f6f78ac4c816aff4da9` (Starknet default test account) as the private key
      - No need to enter a password (just hit enter)
   - `starkli account fetch 0x064b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691 --rpc http://127.0.0.1:5050 --output account0_account.json`
6. Build contracts:
      - `cd ./cario`
      - `scarb build`
7. Deploy contracts:
      - `starkli declare target/dev/hello_world_PacRoyale.contract_class.json --rpc http://127.0.0.1:5050 --account ./account0_account.json --keystore ./account0_keystore.json`
      - Take note of the outputted class hash and replace CLASS_HASH with it in the next step
      - `starkli deploy CLASS_HASH --rpc http://127.0.0.1:5050 --account ./account0_account.json --keystore ./account0_keystore.json`
8. Enter PACROYALE_ADDRESS into `frontend/src/components/ContractAddresses.tsx`
9. Install packages:
      - `cd` into `frontend/`
      - `pnpm i`
10. Start app: `pnpm dev`
11. Head to the displayed url and play! ex. http://localhost:5173/ 

You can have friends join your game by using [Tailscale](https://tailscale.com/) to VPN into the host computer and setting RPC_URL inside [`frontend/src/components/RPC.tsx`](https://github.com/xavierdmello/PacRoyale/blob/main/frontend/src/components/RPC.tsx) to their IP address.
