export const HASH_LENGTH = 65;

export const indexerApp = "indexer";
export const viewRefresherApp = "viewRefresher";
export const generator = "generator";
export const apps = [indexerApp, viewRefresherApp, generator];

export const abi = [
  {
    type: "impl",
    name: "UpgradeableImpl",
    interface_name: "IUpgradeable",
  },
  {
    type: "interface",
    name: "IUpgradeable",
    items: [
      {
        type: "function",
        name: "upgrade",
        inputs: [
          {
            name: "new_class_hash",
            type: "ClassHash",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "impl",
    name: "ERC20MetadataImpl",
    interface_name: "IERC20Metadata",
  },
  {
    type: "interface",
    name: "IERC20Metadata",
    items: [
      {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [
          {
            type: "felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "symbol",
        inputs: [],
        outputs: [
          {
            type: "felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [
          {
            type: "u8",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "impl",
    name: "GoL2Impl",
    interface_name: "IGoL2",
  },
  {
    type: "struct",
    name: "Snapshot",
    members: [
      {
        name: "user_id",
        type: "ContractAddress",
      },
      {
        name: "game_state",
        type: "felt252",
      },
      {
        name: "timestamp",
        type: "u64",
      },
    ],
  },
  {
    type: "interface",
    name: "IGoL2",
    items: [
      {
        type: "function",
        name: "view_game",
        inputs: [
          {
            name: "game_id",
            type: "felt252",
          },
          {
            name: "generation",
            type: "felt252",
          },
        ],
        outputs: [
          {
            type: "felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_current_generation",
        inputs: [
          {
            name: "game_id",
            type: "felt252",
          },
        ],
        outputs: [
          {
            type: "felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "view_snapshot",
        inputs: [
          {
            name: "generation",
            type: "felt252",
          },
        ],
        outputs: [
          {
            type: "Snapshot",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "pre_migration_generations",
        inputs: [],
        outputs: [
          {
            type: "felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "create",
        inputs: [
          {
            name: "game_state",
            type: "felt252",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "evolve",
        inputs: [
          {
            name: "game_id",
            type: "felt252",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "evolve_with_storage",
        inputs: [
          {
            name: "game_id",
            type: "felt252",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "give_life_to_cell",
        inputs: [
          {
            name: "cell_index",
            type: "u32",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "migrate",
        inputs: [
          {
            name: "new_class_hash",
            type: "ClassHash",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "initializer",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "impl",
    name: "OwnableImpl",
    interface_name: "IOwnable",
  },
  {
    type: "interface",
    name: "IOwnable",
    items: [
      {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [
          {
            type: "ContractAddress",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "transfer_ownership",
        inputs: [
          {
            name: "new_owner",
            type: "ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "renounce_ownership",
        inputs: [],
        outputs: [],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "impl",
    name: "ERC20Impl",
    interface_name: "IERC20",
  },
  {
    type: "struct",
    name: "u256",
    members: [
      {
        name: "low",
        type: "u128",
      },
      {
        name: "high",
        type: "u128",
      },
    ],
  },
  {
    type: "enum",
    name: "bool",
    variants: [
      {
        name: "False",
        type: "()",
      },
      {
        name: "True",
        type: "()",
      },
    ],
  },
  {
    type: "interface",
    name: "IERC20",
    items: [
      {
        type: "function",
        name: "total_supply",
        inputs: [],
        outputs: [
          {
            type: "u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "balance_of",
        inputs: [
          {
            name: "account",
            type: "ContractAddress",
          },
        ],
        outputs: [
          {
            type: "u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "allowance",
        inputs: [
          {
            name: "owner",
            type: "ContractAddress",
          },
          {
            name: "spender",
            type: "ContractAddress",
          },
        ],
        outputs: [
          {
            type: "u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "transfer",
        inputs: [
          {
            name: "recipient",
            type: "ContractAddress",
          },
          {
            name: "amount",
            type: "u256",
          },
        ],
        outputs: [
          {
            type: "bool",
          },
        ],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "transfer_from",
        inputs: [
          {
            name: "sender",
            type: "ContractAddress",
          },
          {
            name: "recipient",
            type: "ContractAddress",
          },
          {
            name: "amount",
            type: "u256",
          },
        ],
        outputs: [
          {
            type: "bool",
          },
        ],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "approve",
        inputs: [
          {
            name: "spender",
            type: "ContractAddress",
          },
          {
            name: "amount",
            type: "u256",
          },
        ],
        outputs: [
          {
            type: "bool",
          },
        ],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "impl",
    name: "SafeAllowanceImpl",
    interface_name: "ISafeAllowance",
  },
  {
    type: "interface",
    name: "ISafeAllowance",
    items: [
      {
        type: "function",
        name: "increase_allowance",
        inputs: [
          {
            name: "spender",
            type: "ContractAddress",
          },
          {
            name: "added_value",
            type: "u256",
          },
        ],
        outputs: [
          {
            type: "bool",
          },
        ],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "decrease_allowance",
        inputs: [
          {
            name: "spender",
            type: "ContractAddress",
          },
          {
            name: "subtracted_value",
            type: "u256",
          },
        ],
        outputs: [
          {
            type: "bool",
          },
        ],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "owner",
        type: "ContractAddress",
      },
    ],
  },
  {
    type: "event",
    name: "GameCreated",
    kind: "struct",
    members: [
      {
        name: "user_id",
        type: "ContractAddress",
        kind: "key",
      },
      {
        name: "game_id",
        type: "felt252",
        kind: "data",
      },
      {
        name: "state",
        type: "felt252",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "GameEvolved",
    kind: "struct",
    members: [
      {
        name: "user_id",
        type: "ContractAddress",
        kind: "key",
      },
      {
        name: "game_id",
        type: "felt252",
        kind: "key",
      },
      {
        name: "generation",
        type: "felt252",
        kind: "data",
      },
      {
        name: "state",
        type: "felt252",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "CellRevived",
    kind: "struct",
    members: [
      {
        name: "user_id",
        type: "ContractAddress",
        kind: "key",
      },
      {
        name: "generation",
        type: "felt252",
        kind: "data",
      },
      {
        name: "cell_index",
        type: "u32",
        kind: "data",
      },
      {
        name: "state",
        type: "felt252",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "OwnershipTransferred",
    kind: "struct",
    members: [
      {
        name: "previous_owner",
        type: "ContractAddress",
        kind: "data",
      },
      {
        name: "new_owner",
        type: "ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "Event",
    kind: "enum",
    variants: [
      {
        name: "OwnershipTransferred",
        type: "OwnershipTransferred",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "Upgraded",
    kind: "struct",
    members: [
      {
        name: "class_hash",
        type: "ClassHash",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "Event",
    kind: "enum",
    variants: [
      {
        name: "Upgraded",
        type: "Upgraded",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    kind: "struct",
    members: [
      {
        name: "from",
        type: "ContractAddress",
        kind: "key",
      },
      {
        name: "to",
        type: "ContractAddress",
        kind: "key",
      },
      {
        name: "value",
        type: "u256",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "Approval",
    kind: "struct",
    members: [
      {
        name: "owner",
        type: "ContractAddress",
        kind: "key",
      },
      {
        name: "spender",
        type: "ContractAddress",
        kind: "key",
      },
      {
        name: "value",
        type: "u256",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "Event",
    kind: "enum",
    variants: [
      {
        name: "Transfer",
        type: "Transfer",
        kind: "nested",
      },
      {
        name: "Approval",
        type: "Approval",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "Event",
    kind: "enum",
    variants: [
      {
        name: "GameCreated",
        type: "GameCreated",
        kind: "nested",
      },
      {
        name: "GameEvolved",
        type: "GameEvolved",
        kind: "nested",
      },
      {
        name: "CellRevived",
        type: "CellRevived",
        kind: "nested",
      },
      {
        name: "OwnableEvent",
        type: "Event",
        kind: "flat",
      },
      {
        name: "UpgradeableEvent",
        type: "Event",
        kind: "flat",
      },
      {
        name: "ERC20Event",
        type: "Event",
        kind: "flat",
      },
    ],
  },
];

export const oldAbi = [
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
