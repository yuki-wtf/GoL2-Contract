// Uncomment below in local development
// import 'dotenv/config'
import { DataSource } from "typeorm";
import { PostgresDriver } from "typeorm/driver/postgres/PostgresDriver";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { Event } from "../entity/event";
import { Transaction } from "../entity/transaction";
import { Balance } from "../view/balance";
import { Creator } from '../view/creator';
import { Infinite } from '../view/infinite';
import { Mints } from "../entity/mints";
import { Whitelist } from "../entity/whitelist";
import { logger } from "./logger";

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
    entities: [Event, Transaction, Balance, Creator, Infinite, Mints, Whitelist],
    migrations: ["dist/migrations/*.js"],
    subscribers: [],
});

export const getAllViews = () => AppDataSource.entityMetadatas.filter(e => e.tableMetadataArgs.type === "view").map(e => e.tablePath);

export async function refreshMaterializedViews() {
    logger.info("Refreshing all materialized views.");
    
    const allViews = getAllViews();
    for (const view of allViews) {
      logger.info("Refreshing materialized view.", { view });
      await AppDataSource.query(`refresh materialized view concurrently ${view};`);
    }
  }

