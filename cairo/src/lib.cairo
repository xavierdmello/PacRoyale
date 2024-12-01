/// Simple contract for managing balance.
#[starknet::contract]
mod PacRoyale {
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Vec, VecTrait, MutableVecTrait, Map, StoragePathEntry,
    };
    use core::starknet::{ContractAddress, get_caller_address};

    const MAP_WIDTH: u64 = 23;
    const MAP_HEIGHT: u64 = 23;

    #[derive(Drop, Serde, starknet::Store)]
    struct Player {
        x: u64,
        y: u64,
    }

    #[storage]
    struct Storage {
        balance: felt252,
        map: Vec<felt252>,
        player_map: Map<ContractAddress, Player>,
        players: Vec<ContractAddress>,
    }

    // Add player to the game
    fn add_player(ref self: ContractState) {
        let player_no = self.players.len();

        // Create new player
        let player = Player { x: x, y: y};
        self.player_map.entry(player_address).write(player);
        self.players.append().write(player);
    }

    // Get player position by address
    fn get_player_position(self: @ContractState, player_address: ContractAddress) -> Option<(u64, u64)> {
        // Get player index from mapping
        let index = self.player_indices.entry(player_address).read();
        
        // Get player from vector using index
        if let Option::Some(storage_ptr) = self.players.get(index) {
            let player = storage_ptr.read();
            return Option::Some((player.x, player.y));
        }
        
        Option::None
    }

    // Update player position
    fn update_player_position(
        ref self: ContractState, 
        player_address: ContractAddress, 
        new_x: u64, 
        new_y: u64
    ) {
        // Get player index
        let index = self.player_indices.entry(player_address).read();
        
        // Get current player data
        let mut player_ptr = self.players.at(index);
        let mut player = player_ptr.read();
        
        // Update position
        player.x = new_x;
        player.y = new_y;
        
        // Write back to storage
        player_ptr.write(player);
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        // Initialize the map with the Pac-Man maze layout
        let initial_map = array![
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1,
            1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1,
            1, 2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1,
            1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
            1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1,
            1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1,
            1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1,
            1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1,
            1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1,
            1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1,
            1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1,
            1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
            1, 2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1,
            1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1,
            1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ];

        // Convert the array to a Vec and store it
        let mut i: usize = 0;
        loop {
            if i >= initial_map.len() {
                break;
            }
            self.map.append().write(*initial_map.at(i));
            i += 1;
        };
    }

    // Get value at x,y coordinates from the 1D array representation
    #[abi(embed_v0)]
    fn get_map_value(self: @ContractState, x: u64, y: u64) -> felt252 {
        // Validate coordinates are within bounds
        assert(x < MAP_WIDTH, 'X coordinate out of bounds');
        assert(y < MAP_HEIGHT, 'Y coordinate out of bounds');
        
        // Calculate 1D index from 2D coordinates
        let index = y * MAP_WIDTH + x;
        
        // Return value at calculated index
        self.map.at(index).read()
    }

    fn set_map_value(ref self: ContractState, x: u64, y: u64, value: felt252) {
        // Validate coordinates are within bounds
        assert(x < MAP_WIDTH, 'X coordinate out of bounds');
        assert(y < MAP_HEIGHT, 'Y coordinate out of bounds');
        self.map.at(y * MAP_WIDTH + x).write(value);
    }
}
