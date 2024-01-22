import { AppDataSource, getBlockWithLatestIndexNumber } from "./utils/db";
import { Block } from "./entity/block";
import { requiredEnv} from "./utils/envs";
import { BlockIdentifier, GetBlockResponse, RpcProvider } from "starknet";
import { Event } from "./entity/event";
import { Transaction } from "./entity/transaction";
import { deserializeEvent } from "./utils/events";
import { logger } from "./utils/logger";
import { getLastSavedBlock } from "./utils/db";
import { viewRefresher } from "./viewRefresher";

type TransactionEvent = {
    from_address: string,
    keys: [string],
    data: string[],
}
type TransactionReceipt = {
    transaction_index: number,
    transaction_hash: string,
    events: TransactionEvent[],
}
// Fix starknet.js types
type ReturnedBlock = Omit<GetBlockResponse, "previous_block_hash"> & {
  parent_hash: string;
}

type ReturnedTransactionStatus = {
    tx_status: string,
    block_hash: string,
    tx_failure_reason: string[],
}

const processSince = parseInt(requiredEnv("PROCESS_SINCE"));
const contractAddressString = requiredEnv("CONTRACT_ADDRESS");
const contractAddress = BigInt(requiredEnv("CONTRACT_ADDRESS"));
// const useMainnet = toBool(requiredEnv("USE_MAINNET"));
const starknet = new RpcProvider({
  nodeUrl: process.env.RPC_NODE_URL,
//   nodeUrl: "https://free-rpc.nethermind.io/goerli-juno",
});

const mapBlock = (block: ReturnedBlock): Block => {
    const newBlock = new Block();
    newBlock.hash = block.block_hash;
    newBlock.blockIndex = block.block_number;
    newBlock.parentBlock = block.parent_hash;
    newBlock.timestamp = new Date(Number(block.timestamp) * 1000);
    newBlock.status = block.status;
    return newBlock;
}

const mapEvents = (block: Block, tx: TransactionReceipt): Event[] =>
tx.events.filter(e => BigInt(e.from_address) === contractAddress).map((e, eventIndex) => {
    const event = new Event();
    event.txHash = tx.transaction_hash;
    event.eventIndex = eventIndex;
    event.txIndex = tx.transaction_index;
    event.block = block;
    event.blockIndex = block.blockIndex;
    const [functName, ...initialData] = e.keys
    const processed = deserializeEvent(functName, [...initialData, ...e.data]);
    event.name = processed.name;
    event.content = processed.value;
    return event;
})

const eventNames: Record<string, string> = {
    'GameEvolved': 'game_evolved',
    'GameCreated': 'game_created',
    'CellRevived': 'cell_revived',
}
const mapBlockEvents = (events: any[], block: Block): Event[] =>
  events
    .map((e, eventIndex) => {
      const event = new Event();
      event.txHash = e.transaction_hash;
      event.eventIndex = eventIndex;
      event.txIndex = eventIndex;
      event.block = block;
      event.blockIndex = e.block_number;

      const [functName, ...initialData] = e.keys
      const processed = deserializeEvent(functName, [...initialData, ...e.data]);
      if(processed){
          event.name = eventNames[processed.name] || processed.name;
          event.content = processed.value;
      }

      return event;
});

const getBlock = async <T>(blockIdentifier?: BlockIdentifier | undefined): Promise<T | undefined> => {
    try {
        const block = await starknet.getBlockWithTxHashes(blockIdentifier);
        return block as unknown as T
    } catch (e) {
        console.log("Block not found", blockIdentifier)
        return undefined;
    }
}
const processNextBlock = async () => {
    const lastBlock = await getLastSavedBlock();
    const lastBlockWithIndex = await getBlockWithLatestIndexNumber();
    const lastSavedIndexNumber = lastBlockWithIndex? lastBlockWithIndex.blockIndex + 1 : processSince;
    const nextIndex = lastBlock ? lastBlock.blockIndex + 1 : processSince;
    let blockRecord: Block | undefined = undefined;
    let receipts: TransactionReceipt[] = [];

    if (lastBlock && lastBlock.status == "PENDING") {
        const block = await getBlock<ReturnedBlock>(lastBlock.blockIndex);
        if (block?.block_hash == undefined) {
            logger.info("Re-fetching pending block for new updates.");
            const pendingBlock = await getBlock<ReturnedBlock>("pending");
            if(pendingBlock){
                pendingBlock.block_hash ??= 'PENDING';
                pendingBlock.block_number ??= lastBlock.blockIndex;
                blockRecord = mapBlock(pendingBlock);
                receipts = await getBlockEvents(blockRecord);
            }
        }
        else {
            logger.info("Pending block got accepted.");
            await AppDataSource.manager.remove(lastBlock);
            blockRecord = mapBlock(block);
            receipts = await getBlockEvents(blockRecord);
            return;

        }

    }
    else {
        logger.info({nextIndex}, "Requesting new block.");
        const block = (await getBlock<ReturnedBlock>(
          nextIndex
        ));
        if (lastBlock && block?.block_hash == undefined) {
            logger.info({
                previouslySavedHash: lastBlock.hash,
            }, "Waiting for the next block.");
            
            const pendingBlock = await getBlock<ReturnedBlock>('pending');
            if (pendingBlock?.block_number == lastBlock.blockIndex) {
                logger.info({
                    previouslySavedHash: lastBlock.hash,
                    previouslySavedIndex: lastBlock.blockIndex,
                }, "No new block found.");
                return;
            }
            if(pendingBlock){
                pendingBlock.block_hash ??= 'PENDING';
                pendingBlock.block_number ??= nextIndex;
                blockRecord = mapBlock(pendingBlock);
                receipts = await getBlockEvents(blockRecord);
            }
        } else if (lastBlock && block?.parent_hash !== lastBlock.hash) {
            logger.warn({
                savedHash: lastBlock.hash,
                expectedHash: block?.parent_hash,
                newBlockHash: block?.block_hash,
            }, "Deleting mismatched block.");
            await AppDataSource.manager.remove(lastBlock);
            // Now next processNextBlock will indexer previous block
            return;
        }
        else {
            logger.info({blockHash: Number(block?.block_hash)
            }, "Got a new block.");
            if(block){
                blockRecord = mapBlock(block);
                receipts = await getBlockEvents(blockRecord)
            }
        }
    }

    if(blockRecord){
        blockRecord.blockIndex ??= lastSavedIndexNumber;
        const eventRecords = mapBlockEvents(receipts, blockRecord) || [];
        logger.info({
            blockHash: Number(blockRecord.hash),
            blockIndex: Number(blockRecord.blockIndex),
            eventsCount: Number(eventRecords.length),
        }, "Saving block.");
        await AppDataSource.manager.save([
            blockRecord,
            ...eventRecords,
            ]);
    }

}

const getBlockEvents = async (block: Block) => {
  let continuationToken: string | undefined = 'initial';
  let allEvents: any[] = []
  while (continuationToken) {
    const eventsRes: any = await starknet.getEvents({
      address: contractAddressString,
      chunk_size: 10,
      from_block: { block_number: block.blockIndex },
      to_block: block.hash === 'PENDING' ? 'pending': { block_number: block.blockIndex },
    //   from_block: { block_number: 925922},
    //   to_block: { block_number: 925922 },
      continuation_token: continuationToken === 'initial' ? undefined : continuationToken,
    });
    continuationToken = eventsRes.continuation_token;
    allEvents = [...allEvents, ...eventsRes.events]
  }
  return allEvents
};

const updateTransactions = async () => {
    const transactionsToUpdate = await AppDataSource.manager.find(
        Transaction,
        {
            where: [
            { status: "NOT_RECEIVED" },
            { status: "RECEIVED" },
            { status: "PENDING" },
            // { status: "ACCEPTED_ON_L2" },
            ]
        }
        )
    for (let transaction in transactionsToUpdate) {
        const tx = (await starknet.getTransactionStatus(
          transactionsToUpdate[transaction].hash
        )) as any as ReturnedTransactionStatus;
        transactionsToUpdate[transaction].blockHash = tx.block_hash;
        // @ts-ignore
        transactionsToUpdate[transaction].status = tx.finality_status;
        transactionsToUpdate[transaction].updatedAt = new Date();
        transactionsToUpdate[transaction].errorContent = tx.tx_failure_reason;
        logger.info({
            transactionHash: Number(transactionsToUpdate[transaction].hash),
            transactionStatus: transactionsToUpdate[transaction].status,
        }, "Updating transaction.");
        await AppDataSource.manager.save(transactionsToUpdate[transaction]);
    }
}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const indexer = async () => {
    try {
        while (true) {
            await processNextBlock();
            await viewRefresher();
            await updateTransactions();
            await wait(3000);
        }
    } catch (e) {
        if (e instanceof Error && e.message.includes("BLOCK_NOT_FOUND")) {
            const match = e.message.match(/Block number (\d*) was not found/);
            const block = match && match[1] && parseInt(match[1]);
            logger.info({
                blockIndex: block,
            }, "Block does not exist yet.");
        } else {
            throw e;
        }
    }
}