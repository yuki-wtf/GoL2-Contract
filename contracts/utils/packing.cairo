from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.pow import pow
from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from starkware.cairo.common.math import split_int, split_felt
from starkware.cairo.common.math_cmp import is_le_felt
from starkware.cairo.common.bitwise import bitwise_or

from contracts.utils.constants import (DIM, SHIFT,
    LOW_ARRAY_LEN, HIGH_ARRAY_LEN)


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
        n=LOW_ARRAY_LEN,
        base=2,
        bound=2,
        output=cells)

    split_int(
        value=high,
        n=HIGH_ARRAY_LEN,
        base=2,
        bound=2,
        output=cells + LOW_ARRAY_LEN)

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
        cells_len=LOW_ARRAY_LEN,
        cells=cells,
        index=0,
        power=1,
        packed_cells=0
    )
    let (high) = pack_cells(
        cells_len=HIGH_ARRAY_LEN,
        cells=cells + LOW_ARRAY_LEN,
        index=0,
        power=1,
        packed_cells=0
    )
    let packed_game = high * SHIFT + low

    return(packed_game)
end

func revive_cell{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        cell_index : felt,
        current_state : felt
    ) -> (
        packed_game : felt
    ):
    alloc_locals

    let (high, low) = split_felt(current_state)
    # determines on which array ("part") the index is placed
    let (part) = is_le_felt(cell_index, LOW_ARRAY_LEN - 1)

    # Cell lies in the upper part of the board, which is encoded
    # in "low" part of the felt
    if part == 1:
        let (enabled_bit) = pow(2, cell_index)
        let (updated) = bitwise_or(enabled_bit, low)
        let packed_game = high * SHIFT + updated
        return (packed_game)
    # Else, cell lies in the lower part of the board, which is encoded
    # in "high" part of the felt
    else:
        let (enabled_bit) = pow(2, cell_index - LOW_ARRAY_LEN)
        let (updated) = bitwise_or(enabled_bit, high)
        let packed_game = updated * SHIFT + low
        return (packed_game)
    end
end
