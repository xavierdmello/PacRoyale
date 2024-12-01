#[starknet::contract]
mod PacToken {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl, interface::IERC20Dispatcher, interface::IERC20DispatcherTrait};
    use starknet::{ContractAddress, get_caller_address};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};   

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    // ERC20 Mixin
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        usdc_address: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        usdc_address: ContractAddress
    ) {
       let name = "Pac Royale";
        let symbol = "PAC";

        self.erc20.initializer(name, symbol);
        self.usdc_address.write(usdc_address);
     
    }

    #[external(v0)]
    fn mint(ref self: ContractState, amount: u256) {        
        // Get USDC contract address
        let usdc_address = self.usdc_address.read();
        
        // Transfer USDC from caller to this contract
        // Note: Caller must approve this contract to spend their USDC first
        let this_contract = starknet::get_contract_address();
        IERC20Dispatcher { contract_address: usdc_address }.transfer_from(
            get_caller_address(), 
            this_contract,
            amount
        );

        // Mint 10x the amount of Tuah tokens to caller (1 USDC = 10 PAC)
        self.erc20.mint(get_caller_address(), amount * 10);
    }

    #[external(v0)]
    fn burn(ref self: ContractState, amount: u256) {        
        // Burn the Tuah tokens first
        self.erc20.burn(get_caller_address(), amount);
        
        // Transfer USDC back to caller (divide by 10 since 10 PAC = 1 USDC)
        let usdc_address = self.usdc_address.read();
        IERC20Dispatcher { contract_address: usdc_address }.transfer(
            get_caller_address(),
            amount / 10
        );
    }

    #[external(v0)]
    fn change_usdc_address(ref self: ContractState, new_address: ContractAddress) {
        self.usdc_address.write(new_address);
    }
}