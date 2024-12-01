#[starknet::contract]
mod PacRoyale {
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, Vec, VecTrait, MutableVecTrait};
    
    // Move constants to a separate section for better organization
    const MAP_WIDTH: u64 = 23;
    const MAP_HEIGHT: u64 = 23;
    const WALL: felt252 = 1;
    const DOT: felt252 = 2;
    const EMPTY: felt252 = 0;

    #[storage]
    struct Storage {
        balance: felt252,
        map: Vec<felt252>,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        // Initialize map with initial layout
        let initial_map = array![
            // ... existing map array ...
        ];

        // More efficient Vec initialization
        let mut map_vec = VecTrait::new();
        map_vec.append_span(initial_map.span());
        
        self.map.write(map_vec);
        self.balance.write(0);
    }

    // Add helper functions for map access
    #[view]
    fn get_tile(self: @ContractState, x: u64, y: u64) -> felt252 {
        assert(x < MAP_WIDTH && y < MAP_HEIGHT, 'Invalid coordinates');
        let index = y * MAP_WIDTH + x;
        *self.map.read().at(index)
    }

    #[external]
    fn set_tile(ref self: ContractState, x: u64, y: u64, value: felt252) {
        assert(x < MAP_WIDTH && y < MAP_HEIGHT, 'Invalid coordinates');
        let index = y * MAP_WIDTH + x;
        let mut map = self.map.read();
        map.set(index, value);
        self.map.write(map);
    }
} 