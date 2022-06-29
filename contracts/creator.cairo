%lang starknet
%builtins pedersen range_check bitwise

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from starkware.cairo.common.math import (assert_not_zero,
    assert_le_felt, assert_not_equal)
from starkware.starknet.common.syscalls import get_caller_address

from contracts.utils.life_rules import evaluate_rounds
from contracts.utils.packing import (unpack_game, pack_game)
from contracts.utils.constants import DIM, CREATOR_CREDIT_REQUIREMENT

##### Description #####
#
# Creator is a version of GoL2 where a user may create their own
# starting point for the game. A player may participate only
# once they have contributed to other games to evolve them.
#
#######################

##### Storage #####
# Game id is to ensure uniqueness.
@storage_var
func stored_game(
        game_id : felt,
        generation : felt,
    ) -> (
        val : felt
    ):
end

# Stores the owner of a given game.
@storage_var
func owner_of_game(
        game_id : felt
    ) -> (
        owner_id : felt
    ):
end

# Lets you find the latest state of a given game.
@storage_var
func latest_game_generation(
        game_id : felt
    ) -> (
        game_generation : felt
    ):
end

# Stores the count of credits.
@storage_var
func credits(
        owner_id : felt
    ) -> (
        credits : felt
    ):
end

##### Events #####
@event
func game_created(
    owner_id: felt,
    game_id : felt
):
end

@event
func contribution_made(
    user_id : felt,
    game_id : felt,
    generation : felt
):
end

@event
func credit_earned(
    user_id : felt, 
    balance : felt
):
end

@event
func credit_reduced(
    user_id : felt,
    balance : felt
):
end

##################
@constructor
func constructor{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    const acorn = 215679573337205118357336120696157045389097155380324579848828889530384
    const generation = 0

    let (caller) = get_caller_address()

    save_game(
        generation=generation,
        game_state=acorn,
        user_id=caller
    )
    return ()
end

##### Public functions #####
# Sets the initial state of a game.
@external
func create{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_state : felt
    ):
    alloc_locals
    let credit_requirement = CREATOR_CREDIT_REQUIREMENT

    let (local caller) = get_caller_address()
    with_attr error_message(
        "User not authenticated"
    ):
        assert_not_zero(caller)
    end

    let (credit_count) = credits.read(caller)
    with_attr error_message(
        "Not enough credits to create new game: user {caller} has {credit_count}, needs at least {credit_requirement}"
    ):
        assert_le_felt(CREATOR_CREDIT_REQUIREMENT, credit_count)
    end
    credits.write(caller, credit_count - CREATOR_CREDIT_REQUIREMENT)

    let (local game_id) = stored_game.read(
        game_id=game_state, generation=0)

    with_attr error_message(
        "Game with genesis state {game_state} already exists"
    ):
        assert_not_equal(game_id, game_state)
    end

    verify_game(game_state)
    save_game(
        generation=0,
        game_state=game_state,
        user_id=caller
    )    
    credit_reduced.emit(
        user_id=caller,
        balance=credit_count - CREATOR_CREDIT_REQUIREMENT
    )
    return ()
end

# Progresses the game by one generation
@external
func contribute{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt
    ):
    alloc_locals
    let (caller) = get_caller_address()
    with_attr error_message(
        "User not authenticated"
    ):
        assert_not_zero(caller)
    end

    let (local prev_generation) = latest_game_generation.read(
        game_id)

    # Unpack the stored game.
    let (game) = stored_game.read(game_id, prev_generation)
    let (cells_len, cells) = unpack_game(
        game=game
    )
    # Evolve the game by one generation.
    let (local new_cell_states : felt*) = evaluate_rounds(1, cells)

    # Pack the game for compact storage.
    let (packed_game) = pack_game(
        cells_len=DIM*DIM,
        cells=new_cell_states
    )

    stored_game.write(
        game_id=game_id,
        generation=prev_generation + 1,
        value=packed_game
    )

    # Give a credit for advancing this particular game.
    let (credit_count) = credits.read(caller)
    credits.write(caller, credit_count + 1)

    # Save the current generation for easy retrieval.
    latest_game_generation.write(game_id, prev_generation + 1)
    contribution_made.emit(
        user_id=caller,
        game_id=game_id,
        generation=prev_generation + 1
    )
    credit_earned.emit(
        user_id=caller,
        balance=credit_count + 1
    )
    return ()
end

# Returns the latest generation of a given game.
@view
func generation_of_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt
    ) -> (
        generation : felt
    ):
    let (generation) = latest_game_generation.read(game_id)
    return (generation)
end


# Returns a felt of encoded cells for the specified generation.
@view
func view_game{
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

    let (game_state) = stored_game.read(game_id, generation)
    return (game_state)
end

func save_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        generation : felt,
        game_state : felt,
        user_id : felt
    ):
    stored_game.write(
        game_id=game_state,
        generation=generation,
        value=game_state
    )
    owner_of_game.write(game_state, user_id)
    latest_game_generation.write(game_state, generation)
    game_created.emit(
        owner_id=user_id,
        game_id=game_state
    )
    return ()
end

func verify_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game : felt
    ):
    let (cells_len, cells) = unpack_game(
        game=game
    )
    with_attr error_message(
        "Game {game} is not a valid game"
    ):
        assert cells_len = DIM * DIM
    end
    return ()
end
