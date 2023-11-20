# Game of Life

## Table of contents
1. [Overview](#overview)
2. [Game modes](#game_modes)
    - [Infinite](#infinite)
    - [Creator](#creator)
3. [Interface](#interface)
4. [Architecture](#architecture)
    - [Variables and events](#variables_and_events)
        - [Constant variables](#constants)
        - [Events](#events)
        - [Storage variables](#storage)
    - [Packing](#packing)
        - [Packing game](#packing_game)
        - [Unpacking game](#unpacking_game)
5. [Development](#development)
    - [Requirements](#requirements)
    - [Development summary](#dev_summary)

## Overview <a name="overview"></a>
An implementation of Conway's Game of Life as a contract on StarkNet, written
in Cairo, with an interactive element.

Players can alter the state of the game, affecting the future of the simulation.
People may create interesting states or coordinate with others to achieve some
outcome of interest.

This implementation is novel in that the game state is shared (agreed by all) and permissionless
(anyone may participate). The game rules are enforced by a validity proof, which means that
no one can evolve the game using different rules.

The main rules of the game are:

- The normal rules of Conways' Game of Life (3 to revive, 2 or 3 to stay alive).
- The boundaries wrap - a glider may travel infinitely within the confines of the grid.

<table>
<tr><th> Acorn Generation 1 </th><th> Acorn Generation 2 </th></tr>
<tr><td>

| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | ■ | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | ■ | • | • | • |
| • | • | • | • | • | • | • | • | ■ | ■ | • | • | ■ | ■ | ■ |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |

</td><td>

| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | ■ | ■ | ■ | • | ■ | ■ | • |
| • | • | • | • | • | • | • | • | • | • | • | • | ■ | ■ | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | ■ | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |
| • | • | • | • | • | • | • | • | • | • | • | • | • | • | • |

</td></tr>
</table>


## Game modes <a name="game_modes"></a>

There are two modes: Inifinite and Creator

### Infinite <a name="infinite"></a>

A single game with an ability for participants to evolve the game to its next state.
By doing so they also gain one credit token that can be used to either revive a chosen cell
or create a new creator game.

The game may flourish and produce a myriad of diverse game states, or it may fall to ruin and
become a barren wasteland. It will be up to the participants to decide if and when to use
their life-giving power.

The purpose of this game mode is to encourage collaboration.

### Creator <a name="creator"></a>

An open-ended collection of starting states that anyone can create. A player
can specify the alive/dead state for all the cells in the game they spawn. The
game can be evolved from that point, but individual cells cannot be altered.

Anyone can progress a game, and in return they get one credit token. Ten
credits can be used to create a new game. Each game has to be unique.

The purpose of this game is to allow players to explore interesting starting
patterns in the the game. E.g., inventing new starting positions that last 
many generations before dying out or create a unique pattern.

## Interface <a name="interface"></a>
The contract has following external functions:

1. Initializer - ***can only be called once, right after contract deploy, by the contract owner/admin***

It initializes the contract and creates the infinite game.

```
func initializer(
        proxy_admin (felt): Sets the game admin
        token_name (felt): Name for the credit token
        token_symbol (felt): Token symbol for credit token
        token_decimals (felt): Number of decimals for credit token
    ):
```

2. Upgrade - ***can only be called by the contract owner/admin***

Upgrades the contract.

```
func upgrade(
        implementation_hash (felt): Hash of new contract class implementation
    ):
```

3. Evolve

Evolves the game and rewards user with 1 credit token.

```
func evolve(
        game_id (felt) - Id of the game to be evolved
    ):
```

Example:
```
$ # Evolve infinite game by one generation
$ starknet --account user1 invoke --address 0x04278414023e82811607def9537ccc13729a72936e6648e0134622175992dbf4 --abi build/gol_abi.json --function evolve --inputs 39132555273291485155644251043342963441664
```

4. Create - ***only creator mode***

Creates a new game, reduces user credit balance by 10 credit tokens.

```
func create(
        game_state (felt) - Genesis state for a new game
    ):
```

Example:
```
$ # Create a new game with single cell alive at index 15 - first column, second row
$ # Such game is encoded in value 32768
$ starknet --account user1 invoke --address 0x04278414023e82811607def9537ccc13729a72936e6648e0134622175992dbf4 --abi build/gol_abi.json --function create --inputs 32768
```

5. Give life to cell - ***only infinite mode***

Gives life to cell under chosen index, reduces user credit balance by 1 credit token.
```
func give_life_to_cell(
        cell_index (felt) -  - An index of the cell user wants to revive (by default a value between 0-224)
    ):
```

Example:
```
$ # Give life to a single cell at index 100 - tenth column, seventh row
$ starknet --account user1 invoke --address 0x04278414023e82811607def9537ccc13729a72936e6648e0134622175992dbf4 --abi build/gol_abi.json --function give_life_to_cell --inputs 100
```

And following view functions:

1. View game

Views the game board encoded to single felt.

```
func view_game(
        game_id (felt) - Id of the game to be viewed
        generation (felt) - Id of generation to be viewed
    ) -> (
        game_state (felt) - A felt containing encoded game state for given game_id and generation
    ):
```

Example:
```
$ # Show inifinite game at first generation. The game state is the same as game_id.
$ starknet --account user1 call --address 0x04278414023e82811607def9537ccc13729a72936e6648e0134622175992dbf4 --abi build/gol_abi.json --function view_game --inputs 39132555273291485155644251043342963441664 1

0x7300100008000000000000000000000000

$ # 0x7300100008000000000000000000000000 converted from hex to decimal representation is 39132555273291485155644251043342963441664

$ # Now show infinite game at second generation - after user evolved
$ starknet --account user1 call --address 0x04278414023e82811607def9537ccc13729a72936e6648e0134622175992dbf4 --abi build/gol_abi.json --function view_game --inputs 39132555273291485155644251043342963441664 2

0x100030006e0000000000000000000000000000
```

2. Get current generation

Gets the current generation of a given game.

```
func get_current_generation(
        game_id (felt) - Id of game to retrieve last generation
    ) -> (
        generation (felt) - Id of current generation of given game
    ):
```

Example:
```
$ # get current generation of infinite game
$ starknet --account user1 call --address 0x04278414023e82811607def9537ccc13729a72936e6648e0134622175992dbf4 --abi build/gol_abi.json --function get_current_generation --inputs 39132555273291485155644251043342963441664

2
```

Additional interface for credit tokens can be found in `contracts/ERC20.cairo`.

## Architecture <a name="architecture"></a>

Summary:

- Both game modes are defined in a single contract (`contracts/gol.cairo`)
- The game board is a square with side length `dim`, (`by default dim = 15`) 
containing `dim**2` cells
- Cells wrap around the edges
- Every cell state is being described as alive (1) or dead (0)
    - Each cell can be referenced by its index, starting from index 0
        (left-upper corner of the board) ending with index `dim**2-1` 
        (by default 224) (right-lower corner of the board)
- Whole board can fit into one felt
    - Consult [Packing](#packing) for more
- Users can earn credit tokens by evolving games, and spend them by creating 
new games/reviving cells in infinite mode
- Genesis state of the game is its game_id
- No two games can have identical genesis states

### Variables and events <a name="variables_and_events"></a>

#### Constant variables used in the contract (defined in `utils/constants.cairo`). <a name="constants"></a>

- `INFINITE_GAME_GENESIS` - The genesis state for the game in infinite mode; 
This state is also used as game_id for infinite game
- `DIM` - The game grid dimensions
- `CREATE_CREDIT_REQUIREMENT` - Credit token count required for new game creation in creator mode
- `GIVE_LIFE_CREDIT_REQUIREMENT` - Credit token count required for giving life in infinite mode
- `FIRST_ROW_INDEX` - Index of the first row of the game grid; Is 0 and should stay 0 
even when `DIM` change
- `LAST_ROW_INDEX` - Index of the last row of the game grid; `DIM - 1`
- `LAST_ROW_CELL_INDEX` - Index of the first cell in the last row of the game grid; 
Should be `DIM - DIM * DIM`
- `FIRST_COL_INDEX` - Index of the first column of the game grid; 
Is 0 and should stay 0 even when `DIM` change
- `LAST_COL_INDEX` - Index of the last column of the game grid; `DIM - 1`
- `LAST_COL_CELL_INDEX` - Index of the last cell of the last column of the game grid; `DIM - 1`
- `SHIFT` - Shift number used to pack game into one felt
- `LOW_ARRAY_LEN` - Length of an array that represents the "low" value of the game board; 
Max value is `128`, added to `HIGH_ARRAY_LEN` has to be equal to `DIM**2`
- `HIGH_ARRAY_LEN` - Length of an array that represents the "high" value of the game board; 
Max value is `128`, added to `LOW_ARRAY_LEN` has to be equal to `DIM**2`

#### Events that are emitted by the contract. These are later parsed by the [indexer](indexer/README.md). (defined in `utils/events.cairo`). <a name="events"></a>

- `game_created` - Indicates a new game was created
    - values:
        - user_id - ID of an owner of created game
        - game_id - ID of newly created game
        - state - Genesis state of the game

- `game_evolved` - Indicates a game was progressed
    - values:
        - user_id - ID of a user that evolved the game
        - game_id - ID of evolved game
        - generation - New generation id of the game
        - state - New state of the game

- `cell_revived` - Indicated a cell in infinite game was revived
    - values:
        - user_id - ID of a user that gave life to cell
        - generation - Generation id of the game user gave life to
        - cell_index - Index of revived cell
        - state - New state of the game

#### Storage variables used by the contract. (defined in `utils/state.cairo`). <a name="storage"></a>

- `stored_game` - Holds the game information on chain
    - parameters:
        - game_id - ID of the game
        - generation - Generation id of the game
    - values:
        - state - The state of given give at given generation

- `current_generation` - Holds the latest generation id of given game id
    - parameters:
        - game_id - ID of the game
    - values:
        - game_generation - Latest generation id of given game

### Packing <a name="packing"></a>
#### Packing game <a name="packing_game"></a>

To pack the game into one felt we use `utils/helpers.cairo::pack_game` function.

It takes an array with cells (in binary representation) and splits it into two, smaller arrays of lengths `LOW_ARRAY_LEN` and `HIGH_ARRAY_LEN`.
For example, from input game array (acorn):

```
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000100000
000000000001000
000000001100111
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
000000000000000
```

(or in different representation, without marking where the rows and columns start/end):

```
000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000001000000000001100111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```

for default values `LOW_ARRAY_LEN`=128 and `HIGH_ARRAY_LEN`=97 we obtain following arrays
(Names "low" and "high" correspond to the part of felt they will represent after packing):

"low" array (first 128 cells of game board):
```
00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000100000000000
```

"high" array (next 97 cells of game board):
```
1100111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```

Each array is then passed to `utils/helpers.cairo::pack_cells` function, that converts the binary representation 
of the array into its decimal representation. In order to calculate it, we need to **reverse** the order of cells 
inside the arrays first, so the "low" array representation becomes:
```
00000000000100000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```
and the "high" array representation becomes:
```
0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001110011
```
In decimal representation they are `83077383561857356171188689619124224` and `115` respectively.
Last step is to pack the values into one felt using formula:

```
high_array_value * 2**128 + low_array_value
```
Substituting with values calculated above we get `39132555273291485155644251043342963441664` which is our game board 
packed into single felt.

#### Unpacking game <a name="unpacking_game"></a>

To unpack the game from single felt to an array with cell states we use `utils/helpers.cairo::unpack_game` function.

It takes a felt with packed game and splits it into two values describing "high" array part of the board and "low" 
array part of the board (this is done using built in function [`split_felt`](https://github.com/starkware-libs/cairo-lang/blob/167b28bcd940fd25ea3816204fa882a0b0a49603/src/starkware/cairo/common/math.cairo#L122)).

Next, both values are converted to binary representation (this is done using built in function [`split_int`](https://github.com/starkware-libs/cairo-lang/blob/167b28bcd940fd25ea3816204fa882a0b0a49603/src/starkware/cairo/common/math.cairo#L328)) and written into single array of cells.

## Development <a name="development"></a>

### Requirements <a name="requirements"></a>
- [cairo-lang](https://www.cairo-lang.org/docs/quickstart.html#quickstart)
- [protostar](https://docs.swmansion.com/protostar/docs/tutorials/installation)

### Development summary <a name="dev_summary"></a>

Contract was developed using `protostar`. 

To build contract run:
```bash
protostar build
```

To deploy contract run:
```bash
starknet declare --contract ./build/gol.json
protostar deploy ./build/proxy.json --network <network_name> -i <hash_of_declared_gol_contract>
```

To run tests run:
```bash
protostar test ./tests
```

To learn more about protostar usage please consult [the docs](https://docs.swmansion.com/protostar/docs/tutorials/introduction)



