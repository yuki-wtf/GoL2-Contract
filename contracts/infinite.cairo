%lang starknet
%builtins pedersen range_check bitwise

from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from starkware.cairo.common.math import (assert_not_zero, 
    assert_le_felt, assert_not_equal)
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.memcpy import memcpy
from starkware.cairo.common.alloc import alloc

from contracts.utils.packing import pack_game, unpack_game
from contracts.utils.life_rules import evaluate_rounds
from contracts.utils.constants import DIM


##### Storage #####

# Returns the generation of the current alive generation.
@storage_var
func current_generation() -> (generation : felt):
end

# Returns the user_id for a given generation.
@storage_var
func owner_of_generation(generation : felt) -> (user_id : felt):
end

# Returns the total number of credits owned by a user.
@storage_var
func credits(user_id : felt) -> (credits : felt):
end

# Stores cells revival history for user in (cell_index, generation) tuple
@storage_var
func revival_history(
    user_id: felt
    ) -> (
    info : (felt, felt)
):
end

# Records the history of the game on chain.
@storage_var
func historical_state(
        generation : felt
    ) -> (
        state : felt
    ):
end

##### Events #####
@event
func game_evolved(
    user_id : felt, 
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

@event
func cell_revived(
    user_id : felt,
    generation : felt,
    cell_index : felt
):
end

##################

@external
func initializer{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    historical_state.write(1, 215679573337205118357336120696157045389097155380324579848828889530384)
    current_generation.write(1)
    return ()
end

##### Public functions #####
# Sets the initial state.
# Progresses the game by a chosen number of generations
@external
func evolve_and_claim_next_generation{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals

    let (caller) = get_caller_address()
    with_attr error_message(
        "User not authenticated"
    ):
        assert_not_zero(caller)
    end

    # Limit to one generation per turn.
    let (local last_gen) = current_generation.read()
    local generations = 1
    local new_gen = last_gen + generations

    # Unpack the stored game
    let (game) = historical_state.read(last_gen)
    let (cells_len, cells) = unpack_game(
        game=game
    )

    # Run the game for the specified number of generations.
    let (local cell_states : felt*) = evaluate_rounds(
        generations, cells)

    # Pack the game for compact storage.
    let (packed_game) = pack_game(
        cells_len=DIM*DIM,
        cells=cell_states
    )

    historical_state.write(new_gen, packed_game)
    current_generation.write(new_gen)

    # Grant credits
    let (credits_count) = credits.read(caller)
    credits.write(caller, credits_count + 1)
    owner_of_generation.write(new_gen, caller)

    game_evolved.emit(
        user_id=caller,
        generation=new_gen
    )
    credit_earned.emit(
        user_id=caller,
        balance=credits_count + 1
    )
    return ()
end

# Give life to a specific cell.
@external
func give_life_to_cell{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        cell_index : felt
    ):
    # This does not trigger an evolution. Multiple give_life
    # operations may be called, building up a shape before
    # a turn triggers evolution.
    alloc_locals

    # Only the owner can revive
    let (caller) = get_caller_address()
    with_attr error_message(
        "User not authenticated"
    ):
        assert_not_zero(caller)
    end
    let (generation) = current_generation.read()
    let (local owner) = owner_of_generation.read(generation)
    with_attr error_message(
        "User {caller} is not the owner of current generation, cannot give life"
    ):
        assert owner = caller
    end

    let (local owned_credits) = credits.read(caller)
    with_attr error_message(
        "User {caller} has no credits, cannot give life"
    ):
        assert_le_felt(1, owned_credits)
    end

    activate_cell(cell_index)

    credits.write(
        user_id=caller,
        value=owned_credits - 1
    )

    revival_history.write(
        user_id=caller,
        value=(cell_index, generation)
    )

    credit_reduced.emit(
        user_id=caller,
        balance=owned_credits - 1
    )
    cell_revived.emit(
        user_id=caller,
        generation=generation,
        cell_index=cell_index
    )

    return ()
end


# Returns a the current generation id.
@view
func current_generation_id{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
    ) -> (
        generation : felt
    ):
    let (generation) = current_generation.read()
    return (generation)
end

# Returns user credits count
@view
func user_credits_count{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        user_id : felt
    ) -> (
        count : felt
    ):
    let (count) = credits.read(user_id)
    return(count)
end

# Returns the owner of the current generation
@view
func get_owner_of_generation{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        generation : felt
    ) -> (
        user_id : felt
    ):
    let (owner) = owner_of_generation.read(generation)
    return(owner)
end

# Returns revival history for user
@view
func get_revival_history{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        user_id: felt
    ) -> (
        cell_index : felt,
        generation : felt
    ):
    let (info) = revival_history.read(user_id)
    return (info[0], info[1])
end

# Returns a list of cells for the specified generation.
@view
func view_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        generation : felt
    ) -> (
        game_state : felt
    ):

    let (game_state) = historical_state.read(generation)
    return (game_state)
end

# User input may override state to make a cell alive.
func activate_cell{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        cell_index : felt
    ):
    alloc_locals
    let (local updated_cells : felt*) = alloc()

    with_attr error_message(
        "Cell index {cell_index} out of range"
    ):
        assert_le_felt(cell_index, DIM*DIM-1)
    end

    local upper_len = DIM*DIM - 1 - cell_index
    local offset = cell_index + 1

    let (local generation) = current_generation.read()
    let (local game) = historical_state.read(generation)
    let (cells_len, cells) = unpack_game(
        game=game
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
        assert_not_equal(game, updated)
    end
    historical_state.write(generation, updated)

    return ()
end
