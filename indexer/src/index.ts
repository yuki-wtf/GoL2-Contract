import dotenv from 'dotenv'
if(process.env.NODE_ENV !== "production") {
    dotenv.config();
}

import { AppDataSource } from "./utils/db"
import { logger } from "./utils/logger";
import { appType } from "./utils/envs";
import { indexer } from "./indexer";
import { indexerApp, whitelistApp } from "./utils/const";
import { saveWhitelistProofsToDB } from "./utils/saveWhitelistProofsToDB";
logger.info("Starting.");

AppDataSource.initialize().then(async () => {
    logger.info("DB connection established.");

    try {
        if (appType === indexerApp) {
            await indexer()
        } else if (appType === whitelistApp) {
            await saveWhitelistProofsToDB()
        }
    } catch (e) {
        logger.error(e, "App failed.");
    }
}).catch(error => logger.error(error, "DB connection failed."));
