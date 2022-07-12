%lang starknet
%builtins pedersen range_check bitwise

from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from starkware.starknet.common.syscalls import get_caller_address

from contracts.utils.constants import (CREATE_CREDIT_REQUIREMENT,
    INFINITE_GAME_GENESIS, GIVE_LIFE_CREDIT_REQUIREMENT)
from contracts.utils.helpers import (pay, reward_user, ensure_user,
    assert_valid_new_game, get_last_state, assert_valid_cell_index,
    create_new_game, activate_cell, evolve_game, assert_game_exists,
    get_game, get_generation, save_game, save_generation)
from contracts.ERC20 import (name, symbol,
    totalSupply, decimals, balanceOf, allowance, transfer,
    transferFrom, approve, increaseAllowance, decreaseAllowance)

from openzeppelin.upgrades.library import Proxy
from openzeppelin.token.erc20.library import ERC20

##### Description #####
#
# Creator is a version of GoL where user may create their own
# starting point for the game. A player may participate only
# once they have contributed to other games to evolve them.
#
# Infinite is a version of GoL where user may contribute to 
# the game by evolving to next generation (and subsequently 
# giving life to chosen dead cell).
#
#######################

@external
func initializer{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        proxy_admin: felt,
        token_name: felt,
        token_symbol: felt,
        token_decimals: felt
    ):
    alloc_locals
    const generation = 0

    let (caller) = get_caller_address()

    create_new_game(
        game_state=INFINITE_GAME_GENESIS,
        user_id=caller
    )

    ERC20.initializer(token_name, token_symbol, token_decimals)
    Proxy.initializer(proxy_admin)
    return ()
end

# Create a new game (creator mode)
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
    let (caller) = ensure_user()
    assert_valid_new_game(game_state)
    pay(user=caller, credit_requirement=CREATE_CREDIT_REQUIREMENT)
    create_new_game(
        game_state=game_state,
        user_id=caller
    )    
    return ()
end

# Progresses the game by one generation
@external
func evolve{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt
    ):
    alloc_locals
    let (caller) = ensure_user()
    let (generation, game) = evolve_game(
        game_id=game_id,
        user=caller
    )
    save_game(
        game_id=game_id,
        generation=generation,
        packed_game=game
    )
    save_generation(
        game_id=game_id,
        generation=generation
    )
    reward_user(user=caller)

    return ()
end


# Give life to a specific cell (infinite game).
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
    let (caller) = ensure_user()
    let (generation, current_game_state) = get_last_state()
    assert_valid_cell_index(cell_index)
    pay(user=caller, credit_requirement=GIVE_LIFE_CREDIT_REQUIREMENT)
    activate_cell(
        generation=generation,
        caller=caller,
        cell_index=cell_index,
        current_state=current_game_state
    )

    return ()
end

##########

# Returns a felt of encoded cells for the specified game's generation.
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

    let (game_state) = get_game(
        game_id,
        generation
    )
    return (game_state)
end

# Returns the current generation of a given game.
@view
func get_current_generation{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game_id : felt
    ) -> (
        generation : felt
    ):
    let (generation) = get_generation(game_id)
    return (generation)
end
