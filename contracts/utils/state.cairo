%lang starknet
# Records game history on chain.
# Game id is to ensure game uniqueness.
@storage_var
func stored_game(
        game_id : felt,
        generation : felt,
    ) -> (
        state : felt
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
