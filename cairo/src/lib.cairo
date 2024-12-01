#[starknet::interface]
trait IPacRoyale<TContractState> {
    fn add_player(ref self: TContractState, game_id: u64);
    fn get_position(self: @TContractState, game_id: u64) -> Array<u64>;
    fn get_positions(self: @TContractState, game_id: u64) -> Array<u64>;
    fn move(ref self: TContractState, game_id: u64, direction: felt252);
    fn get_map_value(self: @TContractState, game_id: u64, x: u64, y: u64) -> felt252;
    fn get_map(self: @TContractState, game_id: u64) -> Array<felt252>;
    fn init_game(ref self: TContractState);
    fn get_top_game_id(self: @TContractState) -> u64;
    fn get_winner(self: @TContractState, game_id: u64) -> starknet::ContractAddress;
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
        poweredUp: bool,
        powerup_end: u64,  // Timestamp when powerup ends
        isDead: bool,  // New field
        balance: u64  // New field
    }

    #[storage]
    struct Storage {
        map: Map<u64, Vec<felt252>>,
        player_map: Map<u64, Map<ContractAddress, Player>>,
        players: Map<u64, Vec<ContractAddress>>,
        spawn_points: Map<u64, Vec<(u64, u64)>>,
        top_game_id: u64,
        winner: Map<u64, ContractAddress>  // New field to track winner per game
    }

    #[abi(embed_v0)]
    impl PacRoyaleImpl of super::IPacRoyale<ContractState> {
        fn add_player(ref self: ContractState, game_id: u64) {
            let caller = get_caller_address();
            
            // Check if player already exists
            let mut i: u64 = 0;
            loop {
                if i >= self.players.entry(game_id).len() {
                    break;
                }
                let player_address = self.players.entry(game_id).at(i).read();
                assert(player_address != caller, 'Player already exists');
                i += 1;
            };

            let player_no = self.players.entry(game_id).len();
            assert(player_no < 4, 'Game is full');
            let spawn_point = self.spawn_points.entry(game_id).at(player_no).read();
            let (x, y) = spawn_point;

            // Create new player with default values including balance
            let player = Player { 
                x, 
                y, 
                poweredUp: false, 
                powerup_end: 0, 
                isDead: false,
                balance: 0 
            };
            self.player_map.entry(game_id).entry(caller).write(player);
            self.players.entry(game_id).append().write(caller);
        }


        fn get_top_game_id(self: @ContractState) -> u64 {
            self.top_game_id.read()
        }

        fn get_position(self: @ContractState, game_id: u64) -> Array<u64> {
            let mut positions = ArrayTrait::new();
            let caller = get_caller_address();
            let player = self.player_map.entry(game_id).entry(caller).read();
            positions.append(player.x);
            positions.append(player.y);
            positions.append(if player.poweredUp { 1 } else { 0 });
            positions.append(if player.isDead { 1 } else { 0 });
            positions.append(player.balance);
            positions
        }

        fn get_map(self: @ContractState, game_id: u64) -> Array<felt252> {
            let mut map_array = ArrayTrait::new();
            let mut i: u64 = 0;
            
            loop {
                if i >= self.map.entry(game_id).len() {
                    break;
                }
                
                let value = self.map.entry(game_id).at(i).read();
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
                if i >= self.players.entry(game_id).len() {
                    break;
                }
                
                let player_address = self.players.entry(game_id).at(i).read();
                let player = self.player_map.entry(game_id).entry(player_address).read();
                positions.append(player.x);
                positions.append(player.y);
                positions.append(if player.poweredUp { 1 } else { 0 });
                positions.append(if player.isDead { 1 } else { 0 });
                positions.append(player.balance);
                
                i += 1;
            };
            
            positions
        }

        fn move(ref self: ContractState, game_id: u64, direction: felt252) {
            let caller = get_caller_address();
            let mut player = self.player_map.entry(game_id).entry(caller).read();
            
            // Don't allow dead players to move
            assert(!player.isDead, 'Dead players cannot move');

            // Check if powerup expired
            let current_time = starknet::get_block_timestamp();
            if player.poweredUp && current_time > player.powerup_end {
                player.poweredUp = false;
            }

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

            // Check if the new position is a coin or powerup
            let map_value = self.get_map_value(game_id, new_x, new_y);
            if map_value == 3 {
                // Set powerup
                player.poweredUp = true;
                player.powerup_end = current_time + 10; // 10 seconds from now
                
                // Clear powerup from map
                let index = new_y * MAP_WIDTH + new_x;
                self.map.entry(game_id).at(index).write(0);
            } else if map_value == 2 {  // Coin collection
                // Increment balance and clear coin
                player.balance += 1;
                let index = new_y * MAP_WIDTH + new_x;
                self.map.entry(game_id).at(index).write(0);
            } else {
                assert(map_value != 1, 'Cannot move into wall');
            }

            // Track if player should die from collisions
            let mut should_die = false;

            // After updating position, check for collisions with other players
            let mut i: u64 = 0;
            loop {
                if i >= self.players.entry(game_id).len() {
                    break;
                }
                
                let other_address = self.players.entry(game_id).at(i).read();
                if other_address != caller {
                    let other_player = self.player_map.entry(game_id).entry(other_address).read();
                    
                    // Check if players are on the same square
                    if new_x == other_player.x && new_y == other_player.y {
                        // If current player is powered up and other isn't, kill other player
                        if player.poweredUp && !other_player.poweredUp {
                            let mut updated_other = other_player;
                            updated_other.isDead = true;
                            self.player_map.entry(game_id).entry(other_address).write(updated_other);
                        }
                        // If other player is powered up and current isn't, kill current player
                        else if !player.poweredUp && other_player.poweredUp {
                            should_die = true;
                        }
                        // If both are powered up or both are not, nothing happens
                    }
                }
                i += 1;
            };

            // Check win condition
            let mut alive_count = 0;
            let mut last_alive_player = caller;
            let mut i = 0;
            let players_len = self.players.entry(game_id).len();
            
            if players_len > 1 {
                loop {
                    if i >= players_len {
                        break;
                    }
                    let player_address = self.players.entry(game_id).at(i).read();
                    let current_player = self.player_map.entry(game_id).entry(player_address).read();
                    
                    if !current_player.isDead {
                        alive_count += 1;
                        last_alive_player = player_address;
                    }
                    
                    i += 1;
                };

                // If only one player is alive, they're the winner
                if alive_count == 1 {
                    self.winner.entry(game_id).write(last_alive_player);
                }
            }

            // Update player position with new balance
            let new_player = Player { 
                x: new_x, 
                y: new_y, 
                poweredUp: player.poweredUp, 
                powerup_end: player.powerup_end,
                isDead: should_die,
                balance: player.balance 
            };
            self.player_map.entry(game_id).entry(caller).write(new_player);
        }

        fn get_map_value(self: @ContractState, game_id: u64, x: u64, y: u64) -> felt252 {
            // Validate coordinates are within bounds
            assert(x < MAP_WIDTH, 'X coordinate out of bounds');
            assert(y < MAP_HEIGHT, 'Y coordinate out of bounds');
            
            // Calculate 1D index from 2D coordinates
            let index = y * MAP_WIDTH + x;
            
            // Return value at calculated index
            self.map.entry(game_id).at(index).read()
        }

         fn init_game(ref self: ContractState) {
        let game_id = self.top_game_id.read() + 1;
        self.top_game_id.write(game_id);

        // Initialize the map with the Pac-Man maze layout
        let initial_map = array![
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1,
            1, 2, 1, 3, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 3, 1, 2, 1, 1, 1,
            1, 2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1,
            1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
            1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 1,
            1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1,
            1, 2, 2, 2, 3, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1,
            1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1,
            1, 2, 2, 2, 2, 2, 2, 2, 1, 3, 0, 0, 0, 3, 1, 2, 2, 2, 2, 2, 2, 2, 1,
            1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1,
            1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1,
            1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1,
            1, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 3, 1, 2, 2, 2, 1,
            1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1,
            1, 2, 2, 2, 1, 2, 1, 2, 1, 2, 1, 0, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1,
            1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1, 1,
            1, 2, 2, 3, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 3, 2, 2, 2, 1,
            1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1,
            1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
        ];

        let mut i: usize = 0;
        loop {
            if i >= initial_map.len() {
                break;
            }
            self.map.entry(game_id).append().write(*initial_map.at(i));
            i += 1;
        };
    
        self.spawn_points.entry(game_id).append().write((1, 1));
        self.spawn_points.entry(game_id).append().write((21, 1));
        self.spawn_points.entry(game_id).append().write((1, 21));
        self.spawn_points.entry(game_id).append().write((21, 21));
    }

    // Add getter for winner
    fn get_winner(self: @ContractState, game_id: u64) -> ContractAddress {
        self.winner.entry(game_id).read()
    }
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.init_game();
    }

   
}
