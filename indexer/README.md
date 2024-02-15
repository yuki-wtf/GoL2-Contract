# Game of Life indexer

## Overview

The game of life indexer is responsible for retrieving and parsing events emmited by the contract.

To apply migrations run:
```bash
$ yarn migration:run
```

Build:
```bash
$ yarn build
```

Start:
```bash
$ yarn start
```

### Env variables
- `DB_HOST` - DB host url
- `DB_PORT` - DB port number
- `DB_USER` - DB username
- `DB_PASS` - DB password
- `DB_NAME` - DB table name
- `PROCESS_SINCE` - Number of block to start indexing from
- `CONTRACT_ADDRESS` - Address of contract to index
- `USE_MAINNET` - Boolean indicating mainnet usage
- `APP_TYPE` - Application type, one of indexer | whitelist
- `RPC_NODE_URL` - Infure API url
- `OLD_CONTRACT_BLOCK_END` - The last block containing pre-migration events (before NFT) 

## DB schema
### Materialized views

Parsed events are accessible via materialized views. 
Materialized views have to be refreshed periodically to reflect newest events.

#### Creator
```
transactionHash: string
transactionType: string
transactionOwner: string
gameId: number
gameGeneration: number
gameState: number
createdAt: string
gameOver: boolean
```
#### Infinite
```
transactionHash: string
transactionType: string
transactionOwner: string
revivedCellIndex: number
gameGeneration: number
gameState: number
createdAt: string
gameExtinct: boolean
```

#### Balance
```
  userId: string
  balance: number
  updatedAt: number
  createdAt: number
```

## Local development

### Local db set up
- Create a db locally
- Update DB_NAME accordingly in .env
- Run migrations
```bash
$ yarn migration:run
```

> Any time you make changes to DB entity, run migration commands below. 
```bash
$ yarn migration:generate
$ yarn migration:run
```

### Run indexer locally
```
$ yarn dev:indexer
```

### Saving whitelist proofs to db
- Unzip whitelist.zip into indexer
- Run command below
```
$ yarn dev:whitelist
```


