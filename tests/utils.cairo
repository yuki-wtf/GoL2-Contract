from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from contracts.utils.packing import unpack_game

func view_binary_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game : felt
    ) -> (
        cells_len : felt, cells : felt*
    ):
    let (cells_len, cells) = unpack_game(
        game=game
    )
    return (cells_len, cells)
end
