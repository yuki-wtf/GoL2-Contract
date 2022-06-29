from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.pow import pow
from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from starkware.cairo.common.math import split_int, split_felt
from contracts.utils.constants import DIM


# Cells are packed according to their index
# Starting from last cell of given array
func pack_cells{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        cells_len : felt, 
        cells : felt*, 
        packed_cells : felt
    ) -> (
        packed_cells : felt
    ):
    
    alloc_locals
    
    if cells_len == 0:
        return (packed_cells)
    end

    let (local packed_cells) = pack_cells(
        cells_len=cells_len - 1, 
        cells=cells, 
        packed_cells=packed_cells
    )
    
    let (local bit) = pow(2, (cells_len - 1))
    local cell_binary = cells[cells_len - 1] * bit

    return (cell_binary + packed_cells)
end

func unpack_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        game : felt
    ) -> (
        cells_len: felt,
        cells : felt*
    ):
    alloc_locals
    let (high, low) = split_felt(game)
    let (local cells : felt*) = alloc()

    split_int(
        value=high,
        n=112,
        base=2,
        bound=2,
        output=cells)

    split_int(
        value=low,
        n=113,
        base=2,
        bound=2,
        output=cells + 112)

    return (DIM*DIM, cells)

end

func pack_game{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        cells_len : felt,
        cells : felt*
    ) -> (
        packed_game
    ):
    alloc_locals

    let (high) = pack_cells(
        cells_len=112,
        cells=cells,
        packed_cells=0
    )
    let (low) = pack_cells(
        cells_len=113,
        cells=cells + 112,
        packed_cells=0
    )

    const SHIFT = 2**128
    local packed_game = high * SHIFT + low

    return(packed_game)
end
