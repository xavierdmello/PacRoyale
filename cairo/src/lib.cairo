#[starknet::interface]
trait IPacRoyale<TContractState> {
    fn add_player(ref self: TContractState, game_id: u64);
    fn get_position(self: @TContractState, game_id: u64) -> Array<u64>;
    fn get_positions(self: @TContractState, game_id: u64) -> Array<u64>;
    fn move(ref self: TContractState, game_id: u64, direction: felt252);
    fn get_map_value(self: @TContractState, game_id: u64, x: u64, y: u64) -> felt252;
    fn get_map(self: @TContractState, game_id: u64) -> Array<felt252>;
    fn init_game(ref self: TContractState);
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
        map: Vec<Vec<felt252>>,
        player_map: Vec<Map<ContractAddress, Player>>,
        players: Vec<Vec<ContractAddress>>,
        spawn_points: Vec<Vec<(u64, u64)>>,
        top_game_id: u64,
    }

    #[abi(embed_v0)]
    impl PacRoyaleImpl of super::IPacRoyale<ContractState> {
        fn add_player(ref self: ContractState, game_id: u64) {
            let caller = get_caller_address();
            
            // Check if player already exists
            let mut i: u64 = 0;
            loop {
                if i >= self.players.len() {
                    break;
                }
                let player_address = self.players.at(game_id).at(i).read();
                assert(player_address != caller, 'Player already exists');
                i += 1;
            };

            let player_no = self.players.len();
            assert(player_no < 4, 'Game is full');
            let spawn_point = self.spawn_points.at(game_id).at(player_no).read();
            let (x, y) = spawn_point;

            // Create new player
            let player = Player { x, y };
            self.player_map.at(game_id).entry(caller).write(player);
            self.players.at(game_id).append().write(caller);
        }

        fn get_position(self: @ContractState, game_id: u64) -> Array<u64> {
            let mut positions = ArrayTrait::new();
            let caller = get_caller_address();
            let player = self.player_map.at(game_id).entry(caller).read();
            positions.append(player.x);
            positions.append(player.y);
            positions
        }

        fn get_map(self: @ContractState, game_id: u64) -> Array<felt252> {
            let mut map_array = ArrayTrait::new();
            let mut i: u64 = 0;
            
            loop {
                if i >= self.map.len() {
                    break;
                }
                
                let value = self.map.at(game_id).at(i).read();
                map_array.append(value);
                
                i += 1;
            };
            
            map_array
        }

        // Get all players positions
        fn get_positions(self: @ContractState, game_id: u64) -> Array<u64> {
            let mut positions = ArrayTrait::new();
            let mut i: u64 = 0;
            
            loop {
                if i >= self.players.len().into() {
                    break;
                }
                
                let player_address = self.players.at(game_id).at(i).read();
                let player = self.player_map.at(game_id).entry(player_address).read();
                positions.append(player.x);
                positions.append(player.y);
                
                i += 1;
            };
            
            positions
        }

        fn move(ref self: ContractState, game_id: u64, direction: felt252) {
            let caller = get_caller_address();
            let mut player = self.player_map.at(game_id).entry(caller).read();
            
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
            let map_value = self.get_map_value(game_id, new_x, new_y);
            assert(map_value != 1, 'Cannot move into wall');

            // Update player position
            let new_player = Player { x: new_x, y: new_y };
            self.player_map.at(game_id).entry(caller).write(new_player);
        }

        fn get_map_value(self: @ContractState, game_id: u64, x: u64, y: u64) -> felt252 {
            // Validate coordinates are within bounds
            assert(x < MAP_WIDTH, 'X coordinate out of bounds');
            assert(y < MAP_HEIGHT, 'Y coordinate out of bounds');
            
            // Calculate 1D index from 2D coordinates
            let index = y * MAP_WIDTH + x;
            
            // Return value at calculated index
            self.map.at(game_id).at(index).read()
        }

         fn init_game(ref self: ContractState) {
        let game_id = self.top_game_id.read() + 1;
        self.top_game_id.write(game_id);

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

        let mut i: usize = 0;
        loop {
            if i >= initial_map.len() {
                break;
            }
            self.map.at(game_id).append().write(*initial_map.at(i));
            i += 1;
        };
    
        self.spawn_points.at(game_id).append().write((1, 1));
        self.spawn_points.at(game_id).append().write((21, 1));
        self.spawn_points.at(game_id).append().write((1, 21));
        self.spawn_points.at(game_id).append().write((21, 21));
    }
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.init_game();
    }

   
}
