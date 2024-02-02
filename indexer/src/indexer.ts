import { AppDataSource } from "./utils/db";
import { Block } from "./entity/block";
import { requiredEnv} from "./utils/envs";
import { BlockIdentifier, GetBlockResponse} from "starknet";
import { Event } from "./entity/event";
import { Transaction } from "./entity/transaction";
import { logger } from "./utils/logger";
import { getLastSavedBlock } from "./utils/db";
import { viewRefresher } from "./viewRefresher";
import { Mints } from "./entity/mints";
import { provider } from "./utils/contract";
import { deserializeContent, getParsedEvent } from "./utils/parser";

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
const contractAddress = requiredEnv("CONTRACT_ADDRESS");

const mapBlock = (block: ReturnedBlock): Block => {
    const newBlock = new Block();
    newBlock.hash = block.block_hash;
    newBlock.blockIndex = block.block_number;
    newBlock.parentBlock = block.parent_hash;
    newBlock.timestamp = new Date(Number(block.timestamp) * 1000);
    newBlock.status = block.status;
    return newBlock;
}


const eventNames: Record<string, string> = {
    'GameEvolved': 'game_evolved',
    'GameCreated': 'game_created',
    'CellRevived': 'cell_revived',
}

const mapBlockEvents = async (events: any[], block: Block): Promise<Event[]> => {
    const values: any[] = [];
    let blockHash: string | null = null;
    let txHash: string | null = null;
    let txIndex = 0;
    let eventIndex = 0;
  
    for (const emittedEvent of events.values()) {
      if (emittedEvent.block_hash !== blockHash) {
        blockHash = emittedEvent.block_hash;
        txHash = emittedEvent.transaction_hash;
        txIndex = 0;
        eventIndex = 0;
      } else {
        if (emittedEvent.transaction_hash !== txHash) {
          txHash = emittedEvent.transaction_hash;
          txIndex++;
        } else {
          eventIndex++;
        }
      }
  
      console.debug("Parsing event.", {
        blockNumber: emittedEvent.block_number,
        transactionHash: emittedEvent.transaction_hash,
      });
  
      const parsedEvent = await getParsedEvent(emittedEvent)
      if (!parsedEvent) {
        continue;
      }
  
      const [eventName] = Object.keys(parsedEvent);
      const eventContent = deserializeContent(parsedEvent[eventName]);

      if('from' in eventContent){
          eventContent.from_ = eventContent.from
          delete eventContent.from
      }
  
      const event = new Event();
      event.txHash = emittedEvent.transaction_hash;
      event.eventIndex = eventIndex;
      event.txIndex = txIndex;
      event.block = block;
      event.blockIndex = emittedEvent.block_number;
      event.name = eventNames[eventName] || eventName;

      event.content = eventContent;
  
      values.push(event);
    }
  
    return values;
  };
  
const getBlock = async <T>(blockIdentifier?: BlockIdentifier | undefined): Promise<T | undefined> => {
    try {
        const block = await provider.getBlockWithTxHashes(blockIdentifier);
        return block as unknown as T
    } catch (e) {
        console.log("Block not found", blockIdentifier)
        return undefined;
    }
}
const processNextBlock = async () => {
    // const lastBlock = null as any;
    // const nextIndex = lastBlock ? lastBlock.blockIndex + 1 : 942969;
    const lastBlock = await getLastSavedBlock();
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
        // blockRecord.blockIndex ??= lastSavedIndexNumber;
        // const eventRecordsOld = mapBlockEvents(receipts, blockRecord) || [];
        const eventRecords = await mapBlockEvents(receipts, blockRecord) || [];
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
    const eventsRes: any = await provider.getEvents({
      address: contractAddress,
      chunk_size: 10,
      // from_block: { block_number: block.blockIndex },
      // to_block: block.hash === 'PENDING' ? 'pending': { block_number: block.blockIndex },
      from_block: { block_number: block.blockIndex },
      to_block: {block_number: block.blockIndex},
    //   from_block: { block_number: block.blockIndex },
    //   to_block: {block_number: block.blockIndex},
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
        const tx = (await provider.getTransactionStatus(
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

const updatePendingMints = async () => {
    const pendingMints = await AppDataSource.manager.find(
        Mints
    )
    if(pendingMints.length === 0){
        console.log("No pending mints found")
        return;
    }else {
        console.log("Found pending mints", pendingMints.length)
    }

    for (let mint in pendingMints) {
        const mintDetail = pendingMints[mint];
        const tx = (await provider.getTransactionStatus(
            pendingMints[mint].txHash
        ));
        // @ts-ignore
        if(tx.execution_status === "REJECTED" || tx.execution_status === "REVERTED"){
            logger.info(
                {
                    transactionHash: mintDetail.txHash,
                    status: tx.execution_status,
                },
                "Removing failed mint"
            )
            AppDataSource.manager.remove(mintDetail);
        } else if(mintDetail.status !== tx.finality_status) {
            logger.info(
                {
                    txHash: mintDetail.txHash,
                    execution_status: tx.execution_status,
                    finality_status: tx.finality_status,
                },
                "Updating mint status"
            )
            mintDetail.status = tx.finality_status;
            await AppDataSource.manager.save(mintDetail);
        }
    }

}

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const indexer = async () => {
    try {
        while (true) {
            await processNextBlock();
            await viewRefresher();
            await updateTransactions();
            await updatePendingMints();
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