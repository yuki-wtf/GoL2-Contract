%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from openzeppelin.upgrades.library import Proxy

from contracts.gol import (initializer, upgrade)
from contracts.utils.constants import INFINITE_GAME_GENESIS
from contracts.ERC20 import name, symbol, decimals, totalSupply

const PROXY_ADMIN = 12345
const TOKEN_NAME = 'goltoken'
const TOKEN_SYMBOL = 'GLT'
const TOKEN_DECIMALS = 0
const UPGRADE_HASH = 'hash'

@external
func test_initializer{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    alloc_locals
    %{
        expect_events({"name": "game_created", "data": [ids.PROXY_ADMIN, ids.INFINITE_GAME_GENESIS, ids.INFINITE_GAME_GENESIS]})
        expect_events({"name": "AdminChanged", "data": [0, ids.PROXY_ADMIN]})
    %}
    %{ start_prank(ids.PROXY_ADMIN) %}
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    let (saved_token_name) = name()
    assert saved_token_name = TOKEN_NAME
    let (saved_token_symbol) = symbol()
    assert saved_token_symbol = TOKEN_SYMBOL
    let (saved_token_decimals) = decimals()
    assert saved_token_decimals = TOKEN_DECIMALS
    let (saved_token_supply) = totalSupply()
    assert saved_token_supply.low = 0
    assert saved_token_supply.high = 0

    return ()
end

@external
func test_initializer_fail_ran_twice{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    %{ start_prank(ids.PROXY_ADMIN) %}
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{ expect_revert(error_message="Proxy: contract already initialized") %}
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    return ()
end

@external
func test_upgrade{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    %{ start_prank(ids.PROXY_ADMIN) %}
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )

    upgrade(UPGRADE_HASH)

    let (new_implementation_hash) = Proxy.get_implementation_hash()
    assert new_implementation_hash = UPGRADE_HASH

    return ()
end

@external
func test_upgrade_fail_not_admin{
        syscall_ptr : felt*,
        pedersen_ptr : HashBuiltin*,
        range_check_ptr
    }():
    %{ stop_prank_callable = start_prank(ids.PROXY_ADMIN) %}
    initializer(
        proxy_admin=PROXY_ADMIN,
        token_name=TOKEN_NAME,
        token_symbol=TOKEN_SYMBOL,
        token_decimals=TOKEN_DECIMALS
    )
    %{ stop_prank_callable() %}
    %{ expect_revert(error_message="Proxy: caller is not admin") %}

    upgrade(UPGRADE_HASH)

    return ()
end
