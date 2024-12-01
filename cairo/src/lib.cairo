/// Interface representing `HelloContract`.
/// This interface allows modification and retrieval of the contract balance.
#[starknet::interface]
pub trait IPacRoyale<TContractState> {
    /// Increase contract balance.
    fn increase_balance(ref self: TContractState, amount: felt252);
    /// Retrieve contract balance.
    fn get_balance(self: @TContractState) -> felt252;
}

/// Simple contract for managing balance.
#[starknet::contract]
mod PacRoyale {
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Vec, VecTrait, MutableVecTrait
    };
    const MAP_WIDTH: u64 = 23;
    const MAP_HEIGHT: u64 = 23;

    #[storage]
    struct Storage {
        balance: felt252,
        map: Vec<felt252>, // Changed from Array to Vec
    }

    #[generate_trait]
    impl InternalFunctions of InternalFunctionsTrait {
        // Get value at x,y coordinates from the 1D array representation
        fn get_map_value(self: @ContractState, x: u64, y: u64) -> felt252 {
            // Validate coordinates are within bounds
            assert(x < MAP_WIDTH, 'X coordinate out of bounds');
            assert(y < MAP_HEIGHT, 'Y coordinate out of bounds');
            
            // Calculate 1D index from 2D coordinates
            let index = y * MAP_WIDTH + x;
            
            // Return value at calculated index
            self.map.at(index).read()
        }
    }

    #[abi(embed_v0)]
    impl PacRoyaleImpl of super::IPacRoyale<ContractState> {
        fn increase_balance(ref self: ContractState, amount: felt252) {
            assert(amount != 0, 'Amount cannot be 0');
            self.balance.write(self.balance.read() + amount);
        }

        fn get_balance(self: @ContractState) -> felt252 {
            self.balance.read()
        }
    }
}
