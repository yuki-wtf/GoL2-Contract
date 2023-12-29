export const HASH_LENGTH = 65;

export const indexerApp = "indexer";
export const viewRefresherApp = "viewRefresher";
export const apps = [indexerApp, viewRefresherApp];

export const abi = [
  {
    type: "impl",
    name: "UpgradeableImpl",
    interface_name: "openzeppelin::upgrades::interface::IUpgradeable",
  },
  {
    type: "interface",
    name: "openzeppelin::upgrades::interface::IUpgradeable",
    items: [
      {
        type: "function",
        name: "upgrade",
        inputs: [
          {
            name: "new_class_hash",
            type: "core::starknet::class_hash::ClassHash",
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
    interface_name: "openzeppelin::token::erc20::interface::IERC20Metadata",
  },
  {
    type: "interface",
    name: "openzeppelin::token::erc20::interface::IERC20Metadata",
    items: [
      {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [
          {
            type: "core::felt252",
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
            type: "core::felt252",
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
            type: "core::integer::u8",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "impl",
    name: "GoL2Impl",
    interface_name: "gol2::contracts::gol::IGoL2",
  },
  {
    type: "struct",
    name: "gol2::contracts::gol::GoL2::Snapshot",
    members: [
      {
        name: "user_id",
        type: "core::starknet::contract_address::ContractAddress",
      },
      {
        name: "game_state",
        type: "core::felt252",
      },
      {
        name: "timestamp",
        type: "core::integer::u64",
      },
    ],
  },
  {
    type: "interface",
    name: "gol2::contracts::gol::IGoL2",
    items: [
      {
        type: "function",
        name: "view_game",
        inputs: [
          {
            name: "game_id",
            type: "core::felt252",
          },
          {
            name: "generation",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
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
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
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
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "gol2::contracts::gol::GoL2::Snapshot",
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
            type: "core::felt252",
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
            type: "core::felt252",
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
            type: "core::felt252",
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
            type: "core::felt252",
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
            type: "core::integer::u32",
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
            type: "core::starknet::class_hash::ClassHash",
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
    interface_name: "openzeppelin::access::ownable::interface::IOwnable",
  },
  {
    type: "interface",
    name: "openzeppelin::access::ownable::interface::IOwnable",
    items: [
      {
        type: "function",
        name: "owner",
        inputs: [],
        outputs: [
          {
            type: "core::starknet::contract_address::ContractAddress",
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
            type: "core::starknet::contract_address::ContractAddress",
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
    interface_name: "openzeppelin::token::erc20::interface::IERC20",
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      {
        name: "low",
        type: "core::integer::u128",
      },
      {
        name: "high",
        type: "core::integer::u128",
      },
    ],
  },
  {
    type: "enum",
    name: "core::bool",
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
    name: "openzeppelin::token::erc20::interface::IERC20",
    items: [
      {
        type: "function",
        name: "total_supply",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256",
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
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
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
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
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
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
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
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
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
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "impl",
    name: "SafeAllowanceImpl",
    interface_name: "openzeppelin::token::erc20::interface::ISafeAllowance",
  },
  {
    type: "interface",
    name: "openzeppelin::token::erc20::interface::ISafeAllowance",
    items: [
      {
        type: "function",
        name: "increase_allowance",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "added_value",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
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
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "subtracted_value",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
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
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    type: "event",
    name: "gol2::contracts::gol::GoL2::GameCreated",
    kind: "struct",
    members: [
      {
        name: "user_id",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "game_id",
        type: "core::felt252",
        kind: "data",
      },
      {
        name: "state",
        type: "core::felt252",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "gol2::contracts::gol::GoL2::GameEvolved",
    kind: "struct",
    members: [
      {
        name: "user_id",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "game_id",
        type: "core::felt252",
        kind: "key",
      },
      {
        name: "generation",
        type: "core::felt252",
        kind: "data",
      },
      {
        name: "state",
        type: "core::felt252",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "gol2::contracts::gol::GoL2::CellRevived",
    kind: "struct",
    members: [
      {
        name: "user_id",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "generation",
        type: "core::felt252",
        kind: "data",
      },
      {
        name: "cell_index",
        type: "core::integer::u32",
        kind: "data",
      },
      {
        name: "state",
        type: "core::felt252",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferred",
    kind: "struct",
    members: [
      {
        name: "previous_owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      {
        name: "new_owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::access::ownable::ownable::OwnableComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "OwnershipTransferred",
        type: "openzeppelin::access::ownable::ownable::OwnableComponent::OwnershipTransferred",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded",
    kind: "struct",
    members: [
      {
        name: "class_hash",
        type: "core::starknet::class_hash::ClassHash",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "Upgraded",
        type: "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Upgraded",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Transfer",
    kind: "struct",
    members: [
      {
        name: "from",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "to",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "value",
        type: "core::integer::u256",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Approval",
    kind: "struct",
    members: [
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "value",
        type: "core::integer::u256",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Event",
    kind: "enum",
    variants: [
      {
        name: "Transfer",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Transfer",
        kind: "nested",
      },
      {
        name: "Approval",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Approval",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "gol2::contracts::gol::GoL2::Event",
    kind: "enum",
    variants: [
      {
        name: "GameCreated",
        type: "gol2::contracts::gol::GoL2::GameCreated",
        kind: "nested",
      },
      {
        name: "GameEvolved",
        type: "gol2::contracts::gol::GoL2::GameEvolved",
        kind: "nested",
      },
      {
        name: "CellRevived",
        type: "gol2::contracts::gol::GoL2::CellRevived",
        kind: "nested",
      },
      {
        name: "OwnableEvent",
        type: "openzeppelin::access::ownable::ownable::OwnableComponent::Event",
        kind: "flat",
      },
      {
        name: "UpgradeableEvent",
        type: "openzeppelin::upgrades::upgradeable::UpgradeableComponent::Event",
        kind: "flat",
      },
      {
        name: "ERC20Event",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Event",
        kind: "flat",
      },
    ],
  },
];
