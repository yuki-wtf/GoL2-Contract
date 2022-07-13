%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from starkware.cairo.common.math import (assert_not_zero,
    assert_le_felt, assert_not_equal, unsigned_div_rem, split_felt)
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.uint256 import Uint256

from contracts.utils.life_rules import evaluate_rounds
from contracts.utils.packing import (unpack_game, pack_game, revive_cell)
from contracts.utils.constants import (DIM, INFINITE_GAME_GENESIS)
from contracts.utils.state import stored_game, current_generation
from contracts.utils.events import game_created, game_evolved, cell_revived

from openzeppelin.token.erc20.library import ERC20

##### Common functions #####

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

func evolve_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt,
        user : felt
    ) -> (
        new_generation : felt, 
        packed_game : felt
    ):
    alloc_locals
    const generations = 1

    let (local prev_generation) = current_generation.read(
        game_id)
    assert_game_exists(game_id, prev_generation)
    local new_generation = prev_generation + generations

    # Unpack the stored game.
    let (game_state) = stored_game.read(
        game_id=game_id,
        generation=prev_generation
    )
    let (cells_len, cells) = unpack_game(
        game=game_state
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

    game_evolved.emit(
        user_id=user,
        game_id=game_id,
        generation=new_generation,
        state=packed_game
    )

    return (new_generation, packed_game)
end

func save_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt,
        generation : felt,
        packed_game : felt
    ):
    stored_game.write(
        game_id=game_id,
        generation=generation,
        value=packed_game
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
        game : felt,
        generation : felt
    ):
    with_attr error_message(
        "Game {game} does not exist"
    ):
        let (current_gen) = current_generation.read(game)
        assert_not_zero(current_gen)
        assert_le_felt(generation, current_gen)
    end
    return ()
end

func assert_game_does_not_exist{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game : felt
    ):
    alloc_locals
    let (local game_id) = stored_game.read(
        game_id=game, generation=1)

    with_attr error_message(
        "Game with genesis state {game} already exists"
    ):
        assert game_id = 0
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
        game_state : felt
    ):
    alloc_locals
    assert_game_exists(game_id, generation)
    let (game_state) = stored_game.read(game_id, generation)
    return (game_state)
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

#### Creator mode functions #####

func assert_valid_new_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game : felt
    ):
    alloc_locals
    assert_game_does_not_exist(game)
    # We are splitting game to high and low value
    # Since low value is always fully packed, 
    # we only need to check the high value
    let (high, _) = split_felt(game)
    # An array behind the high value len is 97, if we
    # get more after division, that means we have excessive bits
    # and the game is not valid
    let (invalid_bits, _) = unsigned_div_rem(high, 2**97)
    with_attr error_message(
        "Game {game} is not a valid game"
    ):
        assert invalid_bits = 0
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
        generation=1,
        packed_game=game_state
    )
    save_generation(
        game_id=game_state,
        generation=1
    )
    game_created.emit(
        owner_id=user_id,
        game_id=game_state,
        state=game_state
    )
    return ()
end

##### Infinite mode functions #####

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
    let (game_id) = stored_game.read(
        game_id=INFINITE_GAME_GENESIS,
        generation=generation
    )
    return(generation, game_id)
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
    let (packed_game) = revive_cell(
        cell_index=cell_index,
        current_state=current_state
    )

    with_attr error_message(
        "No changes made to the game"
    ):
        assert_not_equal(current_state, packed_game)
    end

    save_game(
        game_id=INFINITE_GAME_GENESIS,
        generation=generation,
        packed_game=packed_game
    )

    cell_revived.emit(
        user_id=caller,
        generation=generation,
        cell_index=cell_index,
        state=packed_game
    )

    return ()
end
