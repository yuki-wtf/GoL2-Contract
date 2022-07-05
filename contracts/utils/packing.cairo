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
        index : felt,
        power : felt,
        packed_cells : felt
    ) -> (
        packed_cells : felt
    ):

    if index == cells_len:
        return (packed_cells)
    end
    
    let value = cells[index] * power + packed_cells
    let new_power = power * 2
    
    return pack_cells(
            cells_len=cells_len,
            cells=cells,
            index=index + 1,
            power=new_power,
            packed_cells=value
        )
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
        value=low,
        n=128,
        base=2,
        bound=2,
        output=cells)

    split_int(
        value=high,
        n=97,
        base=2,
        bound=2,
        output=cells + 128)

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

    let (low) = pack_cells(
        cells_len=128,
        cells=cells,
        index=0,
        power=1,
        packed_cells=0
    )
    let (high) = pack_cells(
        cells_len=97,
        cells=cells + 128,
        index=0,
        power=1,
        packed_cells=0
    )

    const SHIFT = 2**128
    let packed_game = high * SHIFT + low

    return(packed_game)
end
