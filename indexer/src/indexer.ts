import { AppDataSource } from "./utils/db";
import { Block } from "./entity/block";
import { requiredEnv, toBool } from "./utils/envs";
import { GetBlockResponse, Provider } from "starknet";
import { Event } from "./entity/event";
import { Transaction } from "./entity/transaction";
import { deserializeEvent } from "./utils/events";
import { logger } from "./utils/logger";
import { getLastSavedBlock } from "./utils/db";

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
    transaction_receipts: TransactionReceipt[];
    parent_block_hash: string;
}

type ReturnedTransactionStatus = {
    tx_status: string,
    block_hash: string,
    tx_failure_reason: string[],
}

const processSince = parseInt(requiredEnv("PROCESS_SINCE"));
const contractAddress = BigInt(requiredEnv("CONTRACT_ADDRESS"));
const useMainnet = toBool(requiredEnv("USE_MAINNET"));
const starknet = new Provider({network: useMainnet ? "mainnet-alpha" : "goerli-alpha" });

const mapBlock = (block: ReturnedBlock): Block => {
    const newBlock = new Block();
    newBlock.hash = block.block_hash;
    newBlock.blockIndex = block.block_number;
    newBlock.parentBlock = block.parent_block_hash;
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
    const processed = deserializeEvent(e.keys[0], e.data);
    event.name = processed.name;
    event.content = processed.value;
    return event;
})


const processNextBlock = async () => {
    const lastBlock = await getLastSavedBlock();
    const nextIndex = lastBlock ? lastBlock.blockIndex + 1 : processSince;
    let blockRecord: Block;
    let receipts: TransactionReceipt[];

    if (lastBlock && lastBlock.status == "PENDING") {
        const block = await starknet.getBlock(lastBlock.blockIndex) as any as ReturnedBlock;
        if (block.block_hash == undefined) {
            logger.info("Re-fetching pending block for new updates.");
            const pendingBlock = await starknet.getBlock('pending') as any as ReturnedBlock;
            pendingBlock.block_hash ??= 'PENDING';
            pendingBlock.block_number ??= lastBlock.blockIndex;
            blockRecord = mapBlock(pendingBlock);
            receipts = pendingBlock.transaction_receipts;
        }
        else {
            logger.info("Pending block got accepted.");
            await AppDataSource.manager.remove(lastBlock);
            blockRecord = mapBlock(block);
            receipts = block.transaction_receipts;
            return;

        }

    }
    else {
        logger.info({nextIndex}, "Requesting new block.");
        const block = await starknet.getBlock(nextIndex) as any as ReturnedBlock;

        if (lastBlock && block.block_hash == undefined) {
            logger.info({
                previouslySavedHash: lastBlock.hash,
            }, "Waiting for the next block.");
            
            const pendingBlock = await starknet.getBlock('pending') as any as ReturnedBlock;
            if (pendingBlock.block_number == lastBlock.blockIndex) {
                logger.info({
                    previouslySavedHash: lastBlock.hash,
                    previouslySavedIndex: lastBlock.blockIndex,
                }, "No new block found.");
                return;
            }
            pendingBlock.block_hash ??= 'PENDING';
            pendingBlock.block_number ??= nextIndex;
            blockRecord = mapBlock(pendingBlock);
            receipts = pendingBlock.transaction_receipts;
        } else if (lastBlock && block.parent_block_hash !== lastBlock.hash) {
            logger.warn({
                savedHash: lastBlock.hash,
                expectedHash: block.parent_block_hash,
                newBlockHash: block.block_hash,
            }, "Deleting mismatched block.");
            await AppDataSource.manager.remove(lastBlock);
            // Now next processNextBlock will indexer previous block
            return;
        }
        else {
            logger.info({blockHash: Number(block.block_hash)
            }, "Got a new block.");
            blockRecord = mapBlock(block);
            receipts = block.transaction_receipts;
        }
    }

    const eventRecords = receipts.flatMap(receipt => mapEvents(blockRecord, receipt));

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

const updateTransactions = async () => {
    const transactionsToUpdate = await AppDataSource.manager.find(
        Transaction,
        {
            where: [
            { status: "NOT_RECEIVED" },
            { status: "RECEIVED" },
            { status: "PENDING" },
            { status: "ACCEPTED_ON_L2" },
            ]
        }
        )
    for (let transaction in transactionsToUpdate) {
        const tx = await starknet.getTransactionStatus(transactionsToUpdate[transaction].hash) as any as ReturnedTransactionStatus;
        transactionsToUpdate[transaction].blockHash = tx.block_hash;
        transactionsToUpdate[transaction].status = tx.tx_status;
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