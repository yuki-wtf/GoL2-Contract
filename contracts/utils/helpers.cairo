%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from starkware.cairo.common.math import (assert_not_zero,
    assert_le_felt, assert_not_equal, unsigned_div_rem, split_felt)
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.uint256 import Uint256

from contracts.utils.life_rules import evaluate_rounds
from contracts.utils.packing import (unpack_game, pack_game)
from contracts.utils.constants import (DIM, INFINITE_GAME_GENESIS)

from openzeppelin.token.erc20.library import ERC20

##### Storage #####
# Records game history on chain.
# Game id is to ensure game uniqueness.
@storage_var
func stored_game(
        game_id : felt,
        generation : felt,
    ) -> (
        owner_and_state : (felt, felt)
    ):
end

# Lets you find the latest state of a given game.
@storage_var
func current_generation(
        game_id : felt
    ) -> (
        game_generation : felt
    ):
end

##### Events #####
@event
func game_created(
    owner_id: felt,
    game_id : felt,
    state : felt
):
end

@event
func game_evolved(
    user_id : felt,
    game_id : felt,
    generation : felt,
    state : felt
):
end

@event
func cell_revived(
    user_id : felt,
    generation : felt,
    cell_index : felt,
    state : felt
):
end

##########

func pay{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        user : felt, 
        credit_requirement : felt
    ):
    ERC20._burn(user, Uint256(credit_requirement, 0))
    return ()
end

func reward_user{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        user : felt
    ):
    ERC20._mint(user, Uint256(1, 0))
    return ()
end

func ensure_user{
        syscall_ptr : felt*
    }(
    ) -> (
        caller : felt
    ):
    let (caller) = get_caller_address()
    with_attr error_message(
        "User not authenticated"
    ):
        assert_not_zero(caller)
    end
    return (caller)
end

func assert_valid_new_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game : felt
    ):
    alloc_locals
    let (local game_info) = stored_game.read(
        game_id=game, generation=0)
    let game_id = game_info[1]

    with_attr error_message(
        "Game with genesis state {game} already exists"
    ):
        assert_not_equal(game_id, game)
    end

    let (high, _) = split_felt(game)
    let (invalid_bits, _) = unsigned_div_rem(high, 2**97)
    with_attr error_message(
        "Game {game} is not a valid game"
    ):
        assert invalid_bits = 0
    end
    return ()
end

func get_last_state{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }() -> (
        current_generation : felt,
        current_state : felt
    ):
    let (generation) = current_generation.read(
        game_id=INFINITE_GAME_GENESIS
    )
    let (game_info) = stored_game.read(
        game_id=INFINITE_GAME_GENESIS,
        generation=generation
    )
    return(generation, game_info[1])
end

func assert_valid_cell_index{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        cell_index : felt
    ):
    with_attr error_message(
        "Cell index {cell_index} out of range"
    ):
        assert_le_felt(cell_index, DIM*DIM-1)
    end

    return ()
end

func create_new_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_state : felt,
        user_id : felt
    ):
    save_game(
        game_id=game_state,
        generation=0,
        user_id=user_id,
        packed_game=game_state
    )
    save_generation(
        game_id=game_state,
        generation=0
    )
    game_created.emit(
        owner_id=user_id,
        game_id=game_state,
        state=game_state
    )
    return ()
end

# User input may override state to make a cell alive.
func activate_cell{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        generation : felt,
        caller : felt,
        cell_index : felt,
        current_state : felt
    ):
    alloc_locals

    assert_valid_cell_index(cell_index)
    let (local updated_cells : felt*) = alloc()

    local upper_len = DIM*DIM - 1 - cell_index
    local offset = cell_index + 1

    let (cells_len, cells) = unpack_game(
        game=current_state
    )

    memcpy(updated_cells, cells, cell_index)
    assert updated_cells[cell_index] = 1
    memcpy(updated_cells + offset, cells + offset, upper_len)    

    let (updated) = pack_game(
        cells_len=DIM*DIM,
        cells=updated_cells
    )

    with_attr error_message(
        "No changes made to the game"
    ):
        assert_not_equal(current_state, updated)
    end

    save_game(
        game_id=INFINITE_GAME_GENESIS,
        generation=generation,
        user_id=caller,
        packed_game=updated
    )

    cell_revived.emit(
        user_id=caller,
        generation=generation,
        cell_index=cell_index,
        state=updated
    )

    return ()
end

func evolve_and_save{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt,
        user : felt
    ):
    alloc_locals
    const generations = 1

    let (local prev_generation) = current_generation.read(
        game_id)
    local new_generation = prev_generation + generations

    # Unpack the stored game.
    let (game_info) = stored_game.read(
        game_id=game_id,
        generation=prev_generation
    )
    assert_game_exists(game_info[1])
    let (cells_len, cells) = unpack_game(
        game=game_info[1]
    )
    # Evolve the game by specifided number of generations.
    let (local new_cell_states : felt*) = evaluate_rounds(
        rounds=generations,
        cell_states=cells
    )

    # Pack the game for compact storage.
    let (packed_game) = pack_game(
        cells_len=DIM*DIM,
        cells=new_cell_states
    )

    save_game(
        game_id=game_id,
        generation=new_generation,
        user_id=user,
        packed_game=packed_game
    )
    save_generation(
        game_id=game_id,
        generation=new_generation
    )
    game_evolved.emit(
        user_id=user,
        game_id=game_id,
        generation=new_generation,
        state=packed_game
    )

    return ()
end

func save_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt,
        generation : felt,
        user_id : felt, 
        packed_game : felt
    ):
    stored_game.write(
        game_id=game_id,
        generation=generation,
        value=(user_id, packed_game)
    )
    return ()
end

func save_generation{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt,
        generation : felt
    ):
    current_generation.write(
        game_id=game_id,
        value=generation
    )

    return ()
end

func assert_game_exists{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game : felt
    ):
    with_attr error_message(
        "Game does not exist"
    ):
        assert_not_zero(game)
    end
    return ()
end

func get_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt,
        generation : felt
    ) -> (
        generation_owner : felt,
        game_state : felt
    ):

    let (game_info) = stored_game.read(game_id, generation)
    assert_game_exists(game_info[1])
    return (game_info[0], game_info[1])
end

func get_generation{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt
    ) -> (
        generation : felt
    ):
    let (generation) = current_generation.read(game_id)
    return (generation)
end
