import { contractOldAbiPromise, contractPromise } from "./contract";
import { requiredEnv } from "./envs";

const OLD_CONTRACT_BLOCK_END = requiredEnv("OLD_CONTRACT_BLOCK_END");

const isObject = (value: any): boolean => {
    return Object.prototype.toString.call(value) === '[object Object]'
}

export const deserializeContent = (parsedEvent: any): any => {
    const eventContent: { [key: string]: any } = {};
    for (const obj of Object.entries(parsedEvent)) {
      const [key, value] = obj as any;
      if (
        isObject(value) &&
        value?.hasOwnProperty("low") &&
        value?.hasOwnProperty("high")
      ) {
        // @ts-ignore
        eventContent[key] = BigInt(value.low) + BigInt(value.high) * uint256Shift;
      } else {
        eventContent[key] = value;
      }
    }
  
    return eventContent;
};

export const getParsedEvent = async (emittedEvent: any) => {
    const contractWithNewAbi = await contractPromise;
    const contractWithOldAbi = await contractOldAbiPromise;
    let parsedEvent: any = null;
    let failed = 0
    let parser = 'new'
    
    if(OLD_CONTRACT_BLOCK_END && emittedEvent.block_number <= OLD_CONTRACT_BLOCK_END){
      parser = 'old'
    }
  
    try {
      const contract = parser === 'new' ? contractWithNewAbi : contractWithOldAbi
      const [ParsedEvent] = contract.parseEvents({
        events: [emittedEvent],
      } as any);
      parsedEvent = ParsedEvent;
    } catch (e) {
      failed++;
      console.log(`Could not parse with ${parser} contract`, e);
    }
  
    if (!parsedEvent || parsedEvent?.length === 0) {
      const fallbackContract = parser === 'new' ? contractWithOldAbi : contractWithNewAbi
      try {
        const [ParsedEvent] = fallbackContract.parseEvents({
          events: [emittedEvent],
        } as any);
          parsedEvent = ParsedEvent;
      } catch (e) {
        failed++;
        console.log("Could not parse with fallback contract", e);
      }
    }
  
    if(failed === 2){
        console.error("Failed to parse event in both parsers", emittedEvent)
    }
  
    return parsedEvent
  }
  
