import { selector } from 'starknet'
import { oldAbi } from "./const";

const { getSelectorFromName } = selector;

type Field = { name: string, type: string };
type StructsDefinition = Record<string, Field[]>;
const structs = oldAbi.filter(entry => entry.type === "struct").reduce<StructsDefinition>((acc, entry) => {
    acc[entry.name] = entry.members!;
    return acc;
}, {});

type EventDefinition = { name: string, fields: Field[] }
type Hash = string;
const events = oldAbi.filter(entry => entry.type === "event").reduce<Record<Hash, EventDefinition>>((acc, entry) => {
    acc[getSelectorFromName(entry.name)] = {name: entry.name, fields: entry.data!};
    return acc;
}, {});


type DeserializedEvent = {
    name: string;
    value: Record<string, any>;
}

const uint256Shift = BigInt("0x100000000000000000000000000000000");

// Mutates values!
const deserializeValue = (type: string, values: string[]): bigint | Record<string, any> => {
    if (type === "felt") {
        const [value] = values.splice(0, 1);
        return BigInt(value);
    }

    if (type === "Uint256") {
        const [low, high] = values.splice(0, 2);
        return BigInt(low) + BigInt(high) * uint256Shift;
    }

    const structFields = structs[type];
    return deserializeStruct(structFields, values);
}

// Mutates values!
const deserializeStruct = (fields: Field[], values: string[]): Record<string, any> =>
    fields.reduce<Record<string, any>>((acc, field) => {
        acc[field.name] = deserializeValue(field.type, values);
        return acc;
    }, {})

export const deserializeOldEvent = (key: string, data: string[]): DeserializedEvent => {
    const eventDefinition = events[key];
    const value = deserializeStruct(eventDefinition.fields, [...data]);
    return {name: eventDefinition.name, value}
}