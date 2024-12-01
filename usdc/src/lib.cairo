#[starknet::contract]
mod USDC {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::{ContractAddress, get_caller_address};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    // ERC20 Mixin
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage
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
    ) {
        let name = "USDC";
        let symbol = "USDC";

        self.erc20.initializer(name, symbol);
    }

    #[external(v0)]
    fn mint(ref self: ContractState,  amount: u256) {
        self.erc20.mint(get_caller_address(), amount);
    }

    #[external(v0)]
    fn burn(ref self: ContractState, amount: u256) {    
        self.erc20.burn(get_caller_address(), amount);
    }
}   