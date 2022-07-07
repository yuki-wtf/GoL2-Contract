%lang starknet

from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)

from contracts.gol import (initializer, create, evolve,
        get_current_generation, view_game, give_life_to_cell)
from contracts.utils.constants import INFINITE_GAME_GENESIS

const PROXY_ADMIN = 12345
const TOKEN_NAME = 'goltoken'
const TOKEN_SYMBOL = 'GLT'
const TOKEN_DECIMALS = 0

@external
func test_create_create_happy_case{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    const game_state = 1
    const user_id = 123
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{
        expect_events({"name": "game_created", "data": [ids.user_id, ids.game_state, ids.game_state]})
        expect_events({"name": "Transfer", "data": [ids.user_id, 0, 10, 0]})
    %}

    %{ stop_prank_callable = start_prank(ids.user_id) %}
    # add credits by progressing 10 games
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)

    # create new game
    create(game_state=game_state)

    %{ stop_prank_callable() %}

    # check the game is properly stored
    let (saved_game) = view_game(game_id=game_state, generation=0)
    assert saved_game = game_state

    return ()

end

@external
func test_create_no_credits{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    %{ start_prank(123) %}
    %{ expect_revert(error_message="ERC20: burn amount exceeds balance") %}
    create(game_state=2)

    return ()
end

@external
func test_create_fully_packed{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    const game_state = 53919893334301279589334030174039261347274288845081144962207220498431
    const user_id = 123
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{
        expect_events({"name": "game_created", "data": [ids.user_id, ids.game_state, ids.game_state]})
        expect_events({"name": "Transfer", "data": [ids.user_id, 0, 10, 0]})
    %}
    %{ start_prank(ids.user_id) %}
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)

    create(game_state=game_state)

    let (saved_game) = view_game(game_id=game_state, generation=0)
    assert saved_game = game_state

    return ()
end

@external
func test_create_invalid_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{ start_prank(123) %}
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)

    %{ expect_revert(error_message="Game 53919893334301279589334030174039261347274288845081144962207220498432 is not a valid game") %}
    create(game_state=53919893334301279589334030174039261347274288845081144962207220498432)

    return ()
end

@external
func test_create_game_already_exists{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{ start_prank(123) %}
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)

    %{ expect_revert(error_message="Game with genesis state 39132555273291485155644251043342963441664 already exists") %}
    create(game_state=INFINITE_GAME_GENESIS)

    return ()
end

@external
func test_evolve_infinite{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    const progressed_game = 356828257301254829749648773481885105184047104
    const user_id = 123
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )

    %{
        expect_events({"name": "game_evolved", "data": [ids.user_id, ids.INFINITE_GAME_GENESIS, 1, ids.progressed_game]})
        expect_events({"name": "Transfer", "data": [0, ids.user_id, 1, 0]})
    %}
    let (generation) = get_current_generation(game_id=INFINITE_GAME_GENESIS)
    assert generation = 0

    %{ stop_prank_callable = start_prank(ids.user_id) %}

    evolve(game_id=INFINITE_GAME_GENESIS)

    %{ stop_prank_callable() %}

    let (new_generation) = get_current_generation(game_id=INFINITE_GAME_GENESIS)
    assert new_generation = 1

    let (saved_game) = view_game(game_id=INFINITE_GAME_GENESIS, generation=new_generation)
    assert saved_game = progressed_game

    return ()
end

@external
func test_evolve_creator{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    const original_game = 719908243828027643442799017368840845929946941214691190215016448
    const progressed_game = 6740192361134426834808703906738516760430075363720702762222855651328
    const creator_user_id = 123
    const evolver_user_id = 123
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )

    %{
        expect_events({"name": "game_evolved", "data": [ids.evolver_user_id, ids.original_game, 1, ids.progressed_game]})
        expect_events({"name": "Transfer", "data": [0, ids.evolver_user_id, 1, 0]})
    %}

    %{ stop_prank_callable = start_prank(ids.creator_user_id) %}
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)
    evolve(game_id=INFINITE_GAME_GENESIS)

    create(game_state=original_game)

    %{ stop_prank_callable() %}

    let (generation) = get_current_generation(game_id=original_game)
    assert generation = 0

    let (saved_game) = view_game(game_id=original_game, generation=generation)
    assert saved_game = original_game

    %{ stop_prank_callable = start_prank(ids.evolver_user_id) %}

    evolve(game_id=original_game)

    %{ stop_prank_callable() %}

    let (new_generation) = get_current_generation(game_id=original_game)
    assert new_generation = 1

    let (saved_game) = view_game(game_id=original_game, generation=0)
    assert saved_game = original_game

    let (saved_game) = view_game(game_id=original_game, generation=1)
    assert saved_game = progressed_game

    return ()
end

@external
func test_give_life_to_cell_happy_case{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    const user_id = 123
    const evolved_game = 356828257301254829749648773481885105184047105
    const cell_index = 0
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{
        expect_events({"name": "cell_revived", "data": [ids.user_id, 1, ids.cell_index, ids.evolved_game]})
        expect_events({"name": "Transfer", "data": [ids.user_id, 0, 1, 0]})
    %}

    %{ stop_prank_callable = start_prank(ids.user_id) %}
    evolve(game_id=INFINITE_GAME_GENESIS)
    give_life_to_cell(cell_index)
    %{ stop_prank_callable() %}

    let (generation) = get_current_generation(game_id=INFINITE_GAME_GENESIS)
    assert generation = 1

    let (saved_game) = view_game(game_id=INFINITE_GAME_GENESIS, generation=generation)
    assert saved_game = evolved_game

    return ()
end

@external
func test_give_life_to_cell_no_credits{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{ stop_prank_callable = start_prank(123) %}
    evolve(game_id=INFINITE_GAME_GENESIS)
    give_life_to_cell(1)

    %{ expect_revert(error_message="ERC20: burn amount exceeds balance") %}
    give_life_to_cell(2)
    %{ stop_prank_callable() %}
    return ()
end

@external
func test_give_life_to_cell_out_of_range{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{ start_prank(123) %}
    evolve(game_id=INFINITE_GAME_GENESIS)
    %{ expect_revert(error_message="Cell index 255 out of range") %}
    give_life_to_cell(255)
    return ()
end

@external
func test_give_life_to_cell_not_changed{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{ start_prank(123) %}
    evolve(game_id=INFINITE_GAME_GENESIS)
    %{ expect_revert(error_message="No changes made to the game") %}
    give_life_to_cell(113)
    return ()
end
