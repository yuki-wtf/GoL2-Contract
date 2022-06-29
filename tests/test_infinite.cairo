%lang starknet

from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)

from contracts.infinite import (evolve_and_claim_next_generation,
    give_life_to_cell, current_generation_id, user_credits_count,
    get_owner_of_generation, get_revival_history, view_game, initializer)
from tests.utils import view_binary_game

@external
func test_evolve_and_claim_next_generation{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    local user_id = 123
    initializer()
    %{
        expect_events({"name": "game_evolved", "data": [ids.user_id, 2]})
        expect_events({"name": "credit_earned", "data": [ids.user_id, 1]})
    %}

    %{ stop_prank_callable = start_prank(ids.user_id) %}
    evolve_and_claim_next_generation()
    %{ stop_prank_callable() %}

    let (generation) = current_generation_id()
    assert generation = 2

    let (credit) = user_credits_count(user_id)
    assert credit = 1

    let (gen_owner) = get_owner_of_generation(generation)
    assert gen_owner = user_id

    let (game_state) = view_game(generation=generation)
    assert game_state = 68722622574

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
    local user_id = 123
    local cell_index = 0
    initializer()
    %{
        expect_events({"name": "cell_revived", "data": [ids.user_id, 2, ids.cell_index]})
        expect_events({"name": "credit_reduced", "data": [ids.user_id, 0]})
    %}

    %{ stop_prank_callable = start_prank(ids.user_id) %}
    # get credit by progressing game
    evolve_and_claim_next_generation()
    give_life_to_cell(cell_index)
    %{ stop_prank_callable() %}

    let (generation) = current_generation_id()
    assert generation = 2

    let (credit) = user_credits_count(user_id)
    assert credit = 0

    let (revived_cell_index, revived_generation) = get_revival_history(user_id)
    assert revived_cell_index = cell_index
    assert revived_generation = generation

    let (game_state) = view_game(generation=generation)
    assert game_state = 340282366920938463463374607500490834030

    return ()
end

@external
func test_give_life_to_cell_no_credits{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    initializer()
    %{ stop_prank_callable = start_prank(123) %}
    evolve_and_claim_next_generation()
    give_life_to_cell(1)

    %{ expect_revert(error_message="User 123 has no credits, cannot give life") %}
    give_life_to_cell(2)
    %{ stop_prank_callable() %}
    return ()
end

@external
func test_give_life_to_cell_wrong_owner{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    initializer()
    %{ stop_prank_callable = start_prank(123) %}
    evolve_and_claim_next_generation()
    %{ stop_prank_callable() %}

    %{ start_prank(321) %}
    %{ expect_revert(error_message="User 321 is not the owner of current generation, cannot give life") %}
    give_life_to_cell(5)

    return ()
end

@external
func test_give_life_to_cell_out_of_range{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    initializer()
    %{ start_prank(123) %}
    evolve_and_claim_next_generation()
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
    initializer()
    %{ start_prank(123) %}
    evolve_and_claim_next_generation()
    %{ expect_revert(error_message="No changes made to the game") %}
    give_life_to_cell(113)
    return ()
end
