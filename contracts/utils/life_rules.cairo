from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.math import unsigned_div_rem
from starkware.cairo.common.math_cmp import is_nn, is_le, is_in_range
from starkware.cairo.common.cairo_builtins import (HashBuiltin,
    BitwiseBuiltin)
from contracts.utils.constants import (DIM, FIRST_ROW_INDEX, 
FIRST_COL_INDEX, LAST_COLUMN_INDEX, LAST_ROW_INDEX)

# Executes rounds and returns an array with final state.
func evaluate_rounds{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        rounds : felt,
        cell_states : felt*
    ) -> (
        cell_states : felt*
    ):
    alloc_locals
    if rounds == 0:
        return(cell_states=cell_states)
    end

    let (cell_states) = evaluate_rounds(rounds=rounds-1, cell_states=cell_states)

    let (local pending_states : felt*) = alloc()
    # Fill up pending_states based on cell_states and GoL rules
    apply_rules(cell=DIM*DIM, cell_states=cell_states,
        pending_states=pending_states)

    # Return the pending states as canonical.
    return (cell_states=pending_states)
end

# Steps through every cell, checking neighbour states.
func apply_rules{
        syscall_ptr : felt*,
        bitwise_ptr : BitwiseBuiltin*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }(
        cell : felt,
        cell_states : felt*,
        pending_states : felt*
    ):
    alloc_locals
    if cell == 0:
        return ()
    end

    apply_rules(cell=cell-1, cell_states=cell_states,
        pending_states=pending_states)

    # (Note, on first entry, cell=1 so cell-1 gets the index).
    local cell_idx = cell - 1

    local bitwise_ptr : BitwiseBuiltin* = bitwise_ptr
    local pedersen_ptr : HashBuiltin* = pedersen_ptr

    # Get indices of neighbours.
    let (L, R, U, D, LU, RU, LD, RD) = get_adjecent(cell_idx)

    local range_check_ptr = range_check_ptr
    # Sum of 8 surrounding cells.
    let score = cell_states[L] + cell_states[R] +
        cell_states[D] + cell_states[U] +
        cell_states[LU] + cell_states[RU] +
        cell_states[LD] + cell_states[RD]

    # Final outcome
    # If alive
    if cell_states[cell_idx] == 1:
        # With good neighbours
        if (score - 2) * (score - 3) == 0:
            # Live
            assert pending_states[cell_idx] = 1
        else:
            assert pending_states[cell_idx] = 0
        end
    else:
        if score == 3:
            assert pending_states[cell_idx] = 1
        else:
            assert pending_states[cell_idx] = 0
        end

    end

    return ()
end

func get_adjecent{
        range_check_ptr
    }(
        cell_idx : felt
    ) -> (
        L : felt,
        R : felt,
        U : felt,
        D : felt,
        LU : felt,
        RU : felt,
        LD : felt,
        RD : felt
    ):
    alloc_locals
    # cell_states and pending_states structure:
    #         Row 0               Row 1              Row 2
    #  <-------DIM-------> <-------DIM-------> <-------DIM------->
    # [0,0,0,0,1,...,1,0,1,0,1,1,0,...,1,0,0,1,1,1,0,1...,0,0,1,0...]
    #  ^col_0     col_DIM^ ^col_0     col_DIM^ ^col_0
    let (row, col) = unsigned_div_rem(cell_idx, DIM)

    # LU U RU
    # L  .  R
    # LD D RD
    # Wrap around: If cell is on edge, the neighbour is on the other side
    # of the board/grid.

    ###
    # 1. First take L or R position
    # 2. Apply U or D operation.
    ###

    # For a neighbour moving left and wrapping around:
    # 1. Move left by one (cell_idx - 1).
    # 2. Move to range [0, DIM] (- row_start).
    # 3. Add DIM to make positive (+ DIM).
    # 4. Take modulo DIM to keep in range [0, DIM] (% DIM).
    # 5. Add row for index of wrapped neighbour (+ row_start).
    local L
    local R
    local U
    local D
    local LU
    local RU
    local LD
    local RD

    if col == FIRST_COL_INDEX:
        # Cell is on left, and needs to wrap.
        assert L = cell_idx + LAST_COLUMN_INDEX
    else:
        assert L = cell_idx - 1
    end

    if col == LAST_COLUMN_INDEX:
        # Cell is on right, and needs to wrap.
        assert R = cell_idx - LAST_COLUMN_INDEX
    else:
        assert R = cell_idx + 1
    end


    # Bottom neighbours: D, LD, RD
    if row == LAST_COLUMN_INDEX:
        # Lower neighbour cells are on top, and need to wrap.
        assert D = cell_idx - LAST_ROW_INDEX
        assert LD = L - LAST_ROW_INDEX
        assert RD = R - LAST_ROW_INDEX
    else:
        # Lower neighbour cells are not top row, don't wrap.
        assert D = cell_idx + DIM
        assert LD = L + DIM
        assert RD = R + DIM
    end

    # Top neighbours: U, LU, RU
    if row == FIRST_ROW_INDEX:
        # Upper neighbour cells are on top, and need to wrap.
        assert U = cell_idx + LAST_ROW_INDEX
        assert LU = L + LAST_ROW_INDEX
        assert RU = R + LAST_ROW_INDEX
    else:
        # Upper neighbour cells are not top row, don't wrap.
        assert U = cell_idx - DIM
        assert LU = L - DIM
        assert RU = R - DIM
    end

    return (L=L, R=R, U=U, D=D, LU=LU, RU=RU, LD=LD,
        RD=RD)
end

