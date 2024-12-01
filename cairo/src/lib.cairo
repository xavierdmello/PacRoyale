#[starknet::interface]
trait IPacRoyale<TContractState> {
    fn add_player(ref self: TContractState);
    fn get_position(self: @TContractState) -> (u64, u64);
    fn get_positions(self: @TContractState) -> Array<(u64, u64)>;
    fn move(ref self: TContractState, direction: felt252);
    fn get_map_value(self: @TContractState, x: u64, y: u64) -> felt252;
    fn set_map_value(ref self: TContractState, x: u64, y: u64, value: felt252);
}

#[starknet::contract]
mod PacRoyale {
    use starknet::storage::{
        StoragePointerReadAccess, StoragePointerWriteAccess,
        Vec, VecTrait, MutableVecTrait, Map, StoragePathEntry,
    };
    use core::starknet::{ContractAddress, get_caller_address};
    use core::array::ArrayTrait;

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

    #[abi(embed_v0)]
    impl PacRoyaleImpl of super::IPacRoyale<ContractState> {
        fn add_player(ref self: ContractState) {
            let player_no = self.players.len();
            let spawn_point = self.spawn_points.at(player_no).read();
            let (x, y) = spawn_point;

            // Create new player
            let player = Player { x, y };
            self.player_map.entry(get_caller_address()).write(player);
            self.players.append().write(get_caller_address());
        }

        fn get_position(self: @ContractState) -> (u64, u64) {
            let caller = get_caller_address();
            let player = self.player_map.entry(caller).read();
            (player.x, player.y)
        }

        fn get_positions(self: @ContractState) -> Array<(u64, u64)> {
            let mut positions = ArrayTrait::new();
            let mut i: u64 = 0;
            
            loop {
                if i >= self.players.len().into() {
                    break;
                }
                
                let player_address = self.players.at(i.try_into().unwrap()).read();
                let player = self.player_map.entry(player_address).read();
                positions.append((player.x, player.y));
                
                i += 1;
            };
            
            positions
        }

        fn move(ref self: ContractState, direction: felt252) {
            let caller = get_caller_address();
            let mut player = self.player_map.entry(caller).read();
            
            // Calculate new position based on direction
            let mut new_x = player.x;
            let mut new_y = player.y;
            
            if direction == 0 {
                assert(new_y > 0, 'Cannot move up');
                new_y -= 1;
            } else if direction == 1 {
                assert(new_y < MAP_HEIGHT - 1, 'Cannot move down');
                new_y += 1;
            } else if direction == 2 {
                assert(new_x > 0, 'Cannot move left');
                new_x -= 1;
            } else if direction == 3 {
                assert(new_x < MAP_WIDTH - 1, 'Cannot move right');
                new_x += 1;
            }

            // Check if the new position is a wall
            let map_value = self.get_map_value(new_x, new_y);
            assert(map_value != 1, 'Cannot move into wall');

            // Update player position
            let new_player = Player { x: new_x, y: new_y };
            self.player_map.entry(caller).write(new_player);
        }

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
}
