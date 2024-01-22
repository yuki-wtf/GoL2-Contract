import { DataSource, IsNull, Not } from "typeorm";
import { PostgresDriver } from "typeorm/driver/postgres/PostgresDriver";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { Refresh } from "../entity/refresh";
import { Block } from "../entity/block";
import { Event } from "../entity/event";
import { Transaction } from "../entity/transaction";
import { Balance } from "../view/balance";
import { Creator } from '../view/creator';
import { Infinite } from '../view/infinite';

// Uncomment below in local development
// import 'dotenv/config'

// We need to store bigints in jsonb column, typeorm doesn't support that.
// Transformers in typeorm run _before_ typeorm's JSON.stringify run, so it is problematic
// to use them this way.
const original = PostgresDriver.prototype.preparePersistentValue;
PostgresDriver.prototype.preparePersistentValue = function (value: any, column: ColumnMetadata) {
    if (column.type === "jsonb") {
        const result = JSON.stringify(
            value,
            (_, v) => typeof v === "bigint" ? `<<${v}>>` : v
        );
        // We want to remove quotes from resulting string
        if(result === undefined) return result;
        return result.replace(/("<<)|(>>")/gm, "");
    }

    return original.bind(this)(value, column);
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? ""),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [Block, Event, Transaction, Refresh, Balance, Creator, Infinite],
    migrations: ["dist/migrations/*.js"],
    subscribers: [],
});

export const getLastSavedBlock = async (): Promise<Block | null> =>
    AppDataSource.manager.findOne(
        Block,
        {
            where: [{hash: Not(IsNull())}],
            order: {blockIndex: "desc"},
        }
    )

export const getBlockWithLatestIndexNumber = async (): Promise<Block | null> =>
    AppDataSource.manager.findOne(
        Block,
        {
            where: [{hash: Not(IsNull()), blockIndex: Not(IsNull())}],
            order: {blockIndex: "desc"},
        }
    )

export const getLastRefresh = async (): Promise<Refresh | null> =>
    AppDataSource.manager.findOne(
        Refresh,
        {
            where: [{hash: Not(IsNull())}],
            order: {blockIndex: "desc"},
        }
    )

export const getAllViews = () => AppDataSource.entityMetadatas.filter(e => e.tableMetadataArgs.type === "view").map(e => e.tablePath);
