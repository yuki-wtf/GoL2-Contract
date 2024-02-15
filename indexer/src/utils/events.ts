
import { GetTransactionReceiptResponse, ParsedEvent } from "starknet";
import {
    OLD_CONTRACT_BLOCK_END,
    contract,
    oldContract,
    provider,
  } from "./contract";
import assert from "assert";

type EVENTS_CHUNK = Awaited<ReturnType<typeof provider.getEvents>>;
type EMITTED_EVENT = EVENTS_CHUNK["events"][number];

export const parseEvent = (emittedEvent: EMITTED_EVENT): ParsedEvent => {
  let parsedEvent: ParsedEvent | undefined = undefined;
  const shouldUseNewContract = emittedEvent.block_number == null || emittedEvent.block_number > OLD_CONTRACT_BLOCK_END;

  try {
    const parsingContract = shouldUseNewContract ? contract : oldContract;
    parsedEvent = parsingContract
      .parseEvents({
        events: [emittedEvent],
      } as GetTransactionReceiptResponse)
      .at(0);
  } catch (e) {
    console.error("Error parsing event with default parser", e);
  }
  
  if (parsedEvent == undefined) {
    console.debug("Parsing with fallback parser");
    const parsingContract = shouldUseNewContract ? oldContract : contract;
    try {
      parsedEvent = parsingContract
        .parseEvents({
          events: [emittedEvent],
        } as GetTransactionReceiptResponse)
        .at(0);
    } catch (e) {
      console.error("Error parsing event with fallback parser", e);
    }
  }

  assert(parsedEvent != null, "Parsed event is null.");

  const [eventName] = Object.keys(parsedEvent);
  const eventContent = parsedEvent[eventName];

  for (const [key, value] of Object.entries(eventContent)) {
    if (typeof value === "object" && "low" in value && "high" in value) {
      eventContent[key] = (value.low as bigint) + (value.high as bigint) * BigInt("0x100000000000000000000000000000000");
    }
  }

  if ("from" in eventContent) {
    eventContent.from_ = eventContent.from;
    delete eventContent.from;
  }

  return parsedEvent;
}