export const HASH_LENGTH = 65;

export const indexerApp = "indexer";
export const viewRefresherApp = "viewRefresher";
export const apps = [indexerApp, viewRefresherApp];

export const abi = [
    {
        "members": [
            {
                "name": "low",
                "offset": 0,
                "type": "felt"
            },
            {
                "name": "high",
                "offset": 1,
                "type": "felt"
            }
        ],
        "name": "Uint256",
        "size": 2,
        "type": "struct"
    },
    {
        "data": [
            {
                "name": "user_id",
                "type": "felt"
            },
            {
                "name": "game_id",
                "type": "felt"
            },
            {
                "name": "state",
                "type": "felt"
            }
        ],
        "keys": [],
        "name": "game_created",
        "type": "event"
    },
    {
        "data": [
            {
                "name": "user_id",
                "type": "felt"
            },
            {
                "name": "game_id",
                "type": "felt"
            },
            {
                "name": "generation",
                "type": "felt"
            },
            {
                "name": "state",
                "type": "felt"
            }
        ],
        "keys": [],
        "name": "game_evolved",
        "type": "event"
    },
    {
        "data": [
            {
                "name": "user_id",
                "type": "felt"
            },
            {
                "name": "generation",
                "type": "felt"
            },
            {
                "name": "cell_index",
                "type": "felt"
            },
            {
                "name": "state",
                "type": "felt"
            }
        ],
        "keys": [],
        "name": "cell_revived",
        "type": "event"
    },
    {
        "data": [
            {
                "name": "from_",
                "type": "felt"
            },
            {
                "name": "to",
                "type": "felt"
            },
            {
                "name": "value",
                "type": "Uint256"
            }
        ],
        "keys": [],
        "name": "Transfer",
        "type": "event"
    },
    {
        "data": [
            {
                "name": "owner",
                "type": "felt"
            },
            {
                "name": "spender",
                "type": "felt"
            },
            {
                "name": "value",
                "type": "Uint256"
            }
        ],
        "keys": [],
        "name": "Approval",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "name": "name",
                "type": "felt"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "name": "symbol",
                "type": "felt"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "name": "totalSupply",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "name": "decimals",
                "type": "felt"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "account",
                "type": "felt"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "owner",
                "type": "felt"
            },
            {
                "name": "spender",
                "type": "felt"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "remaining",
                "type": "Uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "recipient",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "sender",
                "type": "felt"
            },
            {
                "name": "recipient",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "spender",
                "type": "felt"
            },
            {
                "name": "amount",
                "type": "Uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "spender",
                "type": "felt"
            },
            {
                "name": "added_value",
                "type": "Uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "spender",
                "type": "felt"
            },
            {
                "name": "subtracted_value",
                "type": "Uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "name": "success",
                "type": "felt"
            }
        ],
        "type": "function"
    },
    {
        "data": [
            {
                "name": "implementation",
                "type": "felt"
            }
        ],
        "keys": [],
        "name": "Upgraded",
        "type": "event"
    },
    {
        "data": [
            {
                "name": "previousAdmin",
                "type": "felt"
            },
            {
                "name": "newAdmin",
                "type": "felt"
            }
        ],
        "keys": [],
        "name": "AdminChanged",
        "type": "event"
    },
    {
        "inputs": [
            {
                "name": "proxy_admin",
                "type": "felt"
            },
            {
                "name": "token_name",
                "type": "felt"
            },
            {
                "name": "token_symbol",
                "type": "felt"
            },
            {
                "name": "token_decimals",
                "type": "felt"
            }
        ],
        "name": "initializer",
        "outputs": [],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "implementation_hash",
                "type": "felt"
            }
        ],
        "name": "upgrade",
        "outputs": [],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "game_state",
                "type": "felt"
            }
        ],
        "name": "create",
        "outputs": [],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "game_id",
                "type": "felt"
            }
        ],
        "name": "evolve",
        "outputs": [],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "cell_index",
                "type": "felt"
            }
        ],
        "name": "give_life_to_cell",
        "outputs": [],
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "game_id",
                "type": "felt"
            },
            {
                "name": "generation",
                "type": "felt"
            }
        ],
        "name": "view_game",
        "outputs": [
            {
                "name": "game_state",
                "type": "felt"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "name": "game_id",
                "type": "felt"
            }
        ],
        "name": "get_current_generation",
        "outputs": [
            {
                "name": "generation",
                "type": "felt"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]
