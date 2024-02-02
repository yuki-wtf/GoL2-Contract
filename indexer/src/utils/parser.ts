const uint256Shift = BigInt("0x100000000000000000000000000000000");

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
  
