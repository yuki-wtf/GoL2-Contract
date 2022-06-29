%lang starknet

from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)

from contracts.creator import (create, contribute, generation_of_game, view_game)
from tests.utils import view_binary_game

@external
func test_create_happy_case{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    const root_game = 215679573337205118357336120696157045389097155380324579848828889530384
    const game_state = 1
    %{
        expect_events({"name": "game_created", "data": [123, ids.game_state]})
        expect_events({"name": "credit_reduced", "data": [123, 0]})
    %}

    %{ stop_prank_callable = start_prank(123) %}
    # add credits by progressing 10 games
    contribute(game_id=root_game)
    contribute(game_id=root_game)
    contribute(game_id=root_game)
    contribute(game_id=root_game)
    contribute(game_id=root_game)
    contribute(game_id=root_game)
    contribute(game_id=root_game)
    contribute(game_id=root_game)
    contribute(game_id=root_game)
    contribute(game_id=root_game)

    # create new game
    create(game_state=game_state)

    %{ stop_prank_callable() %}

    # check the game is properly stored
    let (saved_game_state) = view_game(game_id=game_state, generation=0)
    assert saved_game_state = game_state

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
    %{ expect_revert(error_message="Not enough credits to create new game: user 123 has 0, needs at least 10") %}
    create(game_state=2)

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
    const acorn = 215679573337205118357336120696157045389097155380324579848828889530384
    %{ start_prank(123) %}
    contribute(game_id=acorn)
    contribute(game_id=acorn)
    contribute(game_id=acorn)
    contribute(game_id=acorn)
    contribute(game_id=acorn)
    contribute(game_id=acorn)
    contribute(game_id=acorn)
    contribute(game_id=acorn)
    contribute(game_id=acorn)
    contribute(game_id=acorn)

    %{ expect_revert(error_message="Game with genesis state 215679573337205118357336120696157045389097155380324579848828889530384 already exists") %}
    create(game_state=acorn)

    return ()
end

@external
func test_contribute{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    const acorn = 215679573337205118357336120696157045389097155380324579848828889530384

    %{
        expect_events({"name": "contribution_made", "data": [123, ids.acorn, 1]})
        expect_events({"name": "credit_earned", "data": [123, 1]})
    %}
    let (generation) = generation_of_game(game_id=acorn)
    assert generation = 0

    %{ stop_prank_callable = start_prank(123) %}

    contribute(game_id=acorn)

    %{ stop_prank_callable() %}

    let (new_generation) = generation_of_game(game_id=acorn)
    assert new_generation = 1

    let (saved_game_state) = view_game(game_id=acorn, generation=new_generation)
    assert saved_game_state = 68722622574

    return ()
end
