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
        spawn_points: Vec<(u64, u64)>,
    }

    // Add player to the game
    #[external(v0)]
    fn add_player(ref self: ContractState) {
        let player_no = self.players.len();
        let spawn_point = self.spawn_points.at(player_no).read();
        let (x, y) = spawn_point;

        // Create new player
        let player = Player { x, y};
        self.player_map.entry(get_caller_address()).write(player);
        self.players.append().write(get_caller_address());
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

        self.spawn_points.append().write((1, 1));
        self.spawn_points.append().write((21, 1));
        self.spawn_points.append().write((1, 21));
        self.spawn_points.append().write((21, 21));
    }

    // Get value at x,y coordinates from the 1D array representation
    #[external(v0)]
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
