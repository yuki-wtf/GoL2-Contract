%lang starknet

from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from starkware.cairo.common.uint256 import Uint256

from contracts.utils.helpers import (pay, reward_user, ensure_user,
        evolve_game, save_game, save_generation_id, assert_game_exists,
        assert_game_does_not_exist, get_game, get_generation, 
        assert_valid_new_game, create_new_game, get_last_state,
        assert_valid_cell_index, activate_cell)
from contracts.ERC20 import balanceOf
from contracts.utils.constants import INFINITE_GAME_GENESIS

const USER_ID = 123

@external
func test_pay{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    reward_user(USER_ID)
    %{
        expect_events({"name": "Transfer", "data": [ids.USER_ID, 0, 1, 0]})
    %}
    pay(user=USER_ID, credit_requirement=1)
    let (balance) = balanceOf(USER_ID)
    assert balance = Uint256(0, 0)

    return()
end

@external
func test_pay_not_enough_credits{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    reward_user(USER_ID)
    %{ expect_revert(error_message="ERC20: burn amount exceeds balance") %}
    pay(user=USER_ID, credit_requirement=2)
    return()
end

@external
func test_reward_user{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    reward_user(USER_ID)
    %{
        expect_events({"name": "Transfer", "data": [0, ids.USER_ID, 1, 0]})
    %}
    return()
end

@external
func test_ensure_user_authenticated{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    %{ start_prank(ids.USER_ID) %}
    let (user) = ensure_user()
    assert user = USER_ID
    return()
end

@external
func test_ensure_user_not_authenticated{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    %{ expect_revert(error_message="User not authenticated") %}
    ensure_user()
    return()
end

@external
func test_evolve_game_does_not_exist{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    %{ start_prank(ids.USER_ID) %}
    %{ expect_revert(error_message="Game 1 does not exist at generation 0") %}
    evolve_game(game_id=1, user=USER_ID)
    return()
end

@external
func test_evolve_zero_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    %{ start_prank(ids.USER_ID) %}
    %{ expect_revert(error_message="Game 0 does not exist at generation 0") %}
    evolve_game(game_id=0, user=USER_ID)
    return()
end

@external
func test_get_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    create_new_game(
        game_state=INFINITE_GAME_GENESIS,
        user_id=USER_ID
    )
    let (game_state) = get_game(
        game_id=INFINITE_GAME_GENESIS,
        generation=1
    )
    assert game_state = INFINITE_GAME_GENESIS
    return()
end

@external
func test_get_game_does_not_exist{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    %{ expect_revert(error_message="Game 39132555273291485155644251043342963441664 does not exist at generation 50") %}
    get_game(
        game_id=INFINITE_GAME_GENESIS,
        generation=50
    )
    return()
end

@external
func test_get_game_does_not_exist_generation{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    create_new_game(
        game_state=INFINITE_GAME_GENESIS,
        user_id=USER_ID
    )
    %{ expect_revert(error_message="Game 39132555273291485155644251043342963441664 does not exist at generation 50") %}
    get_game(
        game_id=INFINITE_GAME_GENESIS,
        generation=50
    )
    return()
end

@external
func test_assert_valid_new_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    assert_valid_new_game(16)
    return()
end

@external
func test_assert_invalid_new_game_already_exists{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    create_new_game(
        game_state=16,
        user_id=USER_ID
    )
    %{ expect_revert(error_message="Game with genesis state 16 already exists") %}
    assert_valid_new_game(16)
    return()
end

@external
func test_assert_invalid_new_game_too_many_cells{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    %{ expect_revert(error_message="Game 53919893334301279589334030174039261347274288845081144962207220498432 is not a valid game") %}
    assert_valid_new_game(53919893334301279589334030174039261347274288845081144962207220498432)
    return()
end

@external
func test_create_new_game{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    %{
        expect_events({"name": "game_created", "data": [ids.USER_ID, ids.INFINITE_GAME_GENESIS, ids.INFINITE_GAME_GENESIS]})
    %}
    create_new_game(
        game_state=INFINITE_GAME_GENESIS,
        user_id=USER_ID
    )

    let (current_gen) = get_generation(game_id=INFINITE_GAME_GENESIS)
    assert current_gen = 1

    let (game_state) = get_game(
        game_id=INFINITE_GAME_GENESIS,
        generation=1
    )
    assert game_state = INFINITE_GAME_GENESIS

    return()
end

@external
func test_get_last_state{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    create_new_game(
        game_state=INFINITE_GAME_GENESIS,
        user_id=USER_ID
    )
    let (generation, game_state) = get_last_state()
    assert game_state = INFINITE_GAME_GENESIS
    assert generation = 1
    return()
end

@external
func test_activate_cell{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    create_new_game(
        game_state=INFINITE_GAME_GENESIS,
        user_id=USER_ID
    )
    %{
        expect_events({"name": "cell_revived", "data": [ids.USER_ID, 1, 0, ids.INFINITE_GAME_GENESIS + 1]})
    %}
    activate_cell(
        generation=1,
        caller=USER_ID,
        cell_index=0,
        current_state=INFINITE_GAME_GENESIS
    )

    return()
end

@external
func test_activate_cell_invalid_cell_index{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    create_new_game(
        game_state=INFINITE_GAME_GENESIS,
        user_id=USER_ID
    )
    %{ expect_revert(error_message="Cell index 226 out of range") %}
    activate_cell(
        generation=1,
        caller=USER_ID,
        cell_index=226,
        current_state=INFINITE_GAME_GENESIS
    )
    return()
end

@external
func test_activate_cell_nothing_changed{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        bitwise_ptr : BitwiseBuiltin*,
        range_check_ptr
    }():
    create_new_game(
        game_state=INFINITE_GAME_GENESIS,
        user_id=USER_ID
    )
    %{ expect_revert(error_message="No changes made to the game") %}
    activate_cell(
        generation=1,
        caller=USER_ID,
        cell_index=99,
        current_state=INFINITE_GAME_GENESIS
    )
    return()
end
