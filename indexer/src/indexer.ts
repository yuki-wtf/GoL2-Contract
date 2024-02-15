import { AppDataSource, refreshMaterializedViews } from "./utils/db";
import { requiredEnv } from "./utils/envs";
import { Event } from "./entity/event";
import { Transaction } from "./entity/transaction";
import { logger } from "./utils/logger";
import { Mints } from "./entity/mints";
import { OLD_CONTRACT_BLOCK_END, provider } from "./utils/contract";
import { IsNull, Not } from "typeorm";
import assert from "assert";
import { eventNameMap } from "./utils/const";
import { parseEvent } from "./utils/events";

const processSince = parseInt(requiredEnv("PROCESS_SINCE"));
const contractAddress = requiredEnv("CONTRACT_ADDRESS");

const pullEvents = async () => {
  const lastEvent = await AppDataSource.manager.findOne(Event, {
    where: [{ blockIndex: Not(IsNull()) }],
    order: { blockIndex: "desc" },
  });

  const latestAcceptedBlock = await provider.getBlockLatestAccepted();
  const blockNumber = Math.min(
    latestAcceptedBlock.block_number,
    lastEvent?.blockIndex != null ? lastEvent.blockIndex : processSince
  );
  let eventsChunk: Awaited<ReturnType<typeof provider.getEvents>> | undefined;
  let eventsPulled = 0;

  do {
    logger.info("Pulling events chunk.", {
      chunk_size: 1000,
      address: contractAddress,
      from_block: {
        block_number: blockNumber,
      },
      to_block: "pending",
      continuation_token: eventsChunk?.continuation_token,
    });

    eventsChunk = await provider.getEvents({
      chunk_size: 1000,
      address: contractAddress,
      from_block: {
        block_number: blockNumber,
      },
      to_block: "pending",
      continuation_token: eventsChunk?.continuation_token,
    });

    assert(eventsChunk != null, "Events chunk is null.");
    assert(typeof eventsChunk === "object", "Events chunk is not an object.");
    assert(Array.isArray(eventsChunk.events), "Events chunk is not an array.");

    logger.debug("Events chunk.", {
      eventsChunk,
    });

    eventsPulled += eventsChunk.events.length;

    logger.info("Pulled events chunk.", {
      blockNumber,
      eventsPulled,
      eventsChunkLength: eventsChunk.events.length,
      continuationToken: eventsChunk.continuation_token,
    });

    if (eventsChunk.events.length > 0) {
      const values: Event[] = [];

      let blockHash: string | null = null;
      let txHash: string | null = null;
      let txIndex = -1;
      let eventIndex = -1;

      for (const emittedEvent of eventsChunk.events.values()) {
        if (emittedEvent.block_hash !== blockHash) {
          blockHash = emittedEvent.block_hash;
          txHash = emittedEvent.transaction_hash;
          txIndex = 0;
          eventIndex = 0;
        } else {
          if (emittedEvent.transaction_hash !== txHash) {
            txHash = emittedEvent.transaction_hash;
            txIndex++;
            eventIndex = 0;
          } else {
            eventIndex++;
          }
        }

        logger.debug("Parsing event.", {
          blockNumber: emittedEvent.block_number,
          transactionHash: emittedEvent.transaction_hash,
          OLD_CONTRACT_BLOCK_END,
        });

        const parsedEvent = parseEvent(emittedEvent);

        const [eventName] = Object.keys(parsedEvent);

        const eventContent = parsedEvent[eventName];

        const event = new Event();

        event.txHash = emittedEvent.transaction_hash;
        event.eventIndex = eventIndex;
        event.txIndex = txIndex;
        event.blockIndex = emittedEvent.block_number;
        event.blockHash = emittedEvent.block_hash;
        event.name = eventNameMap[eventName] ?? eventName;
        event.content = eventContent;
        values.push(event);
      }

      await AppDataSource.manager.save(values);

      logger.info("Inserted events chunk.");

      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } while (eventsChunk.continuation_token);

  if (eventsPulled > 0) {
    await refreshMaterializedViews();
  }
}



const updateTransactions = async () => {
  const deletedTransactions = await AppDataSource.manager.query(`
    DELETE
    FROM TRANSACTION t
    WHERE
        (SELECT 'txHash'
          FROM event e
          WHERE e."txHash" = t.hash 
          limit 1
          ) IS NOT NULL
        OR
        t."createdAt" < (now() - interval '15 minutes')
    returning hash;
  `)

  if(deletedTransactions?.[0]?.length > 0){
    logger.info(
      deletedTransactions[0].map((t: any) => t.hash),
      "Deleting transaction."
    );
  }
  
  const transactionsToUpdate = await AppDataSource.manager.find(Transaction);

  for (let transaction in transactionsToUpdate) {
    const tx = (await provider.getTransactionStatus(
      transactionsToUpdate[transaction].hash
    ));

    transactionsToUpdate[transaction].status = tx.finality_status;
    if(tx.execution_status === 'REVERTED'){
      transactionsToUpdate[transaction].status = 'REJECTED';
    }
    transactionsToUpdate[transaction].updatedAt = new Date();
    logger.info(
      {
        transactionHash: Number(transactionsToUpdate[transaction].hash),
        transactionStatus: transactionsToUpdate[transaction].status,
      },
      "Updating transaction."
    );
    await AppDataSource.manager.save(transactionsToUpdate[transaction]);
  }
};

const updatePendingMints = async () => {
  const pendingMints = await AppDataSource.manager.find(Mints);
  if (pendingMints.length === 0) {
    console.log("No pending mints found");
    return;
  } else {
    console.log("Found pending mints", pendingMints.length);
  }

  for (let mint in pendingMints) {
    const mintDetail = pendingMints[mint];
    const tx = await provider.getTransactionStatus(pendingMints[mint].txHash);

    if (tx.execution_status === "REVERTED") {
      logger.info(
        {
          transactionHash: mintDetail.txHash,
          status: tx.execution_status,
        },
        "Removing failed mint"
      );
      AppDataSource.manager.remove(mintDetail);
    } else if (mintDetail.status !== tx.finality_status) {
      logger.info(
        {
          txHash: mintDetail.txHash,
          execution_status: tx.execution_status,
          finality_status: tx.finality_status,
        },
        "Updating mint status"
      );
      mintDetail.status = tx.finality_status;
      await AppDataSource.manager.save(mintDetail);
    }
  }
};

// const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const indexer = async () => {

  try {
    while (true) {
      await pullEvents();
      await updateTransactions();
      await updatePendingMints();
    }
  } catch (e) {
    if (e instanceof Error && e.message.includes("BLOCK_NOT_FOUND")) {
      const match = e.message.match(/Block number (\d*) was not found/);
      const block = match && match[1] && parseInt(match[1]);
      logger.info(
        {
          blockIndex: block,
        },
        "Block does not exist yet."
      );
    } else {
      throw e;
    }
  }
};
