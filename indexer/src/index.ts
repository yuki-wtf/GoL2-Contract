import { AppDataSource } from "./utils/db"
import { logger } from "./utils/logger";
import { appType } from "./utils/envs";
import { indexer } from "./indexer";
import { viewRefresher } from "./viewRefresher";
import { indexerApp, viewRefresherApp } from "./utils/const";

logger.info("Starting.");

AppDataSource.initialize().then(async () => {
    logger.info("DB connection established.");

    try {
        if (appType === indexerApp) {
            await indexer()
        } else if (appType === viewRefresherApp) {
            await viewRefresher()
        }
    } catch (e) {
        logger.error(e, "App failed.");
    }
}).catch(error => logger.error(error, "DB connection failed."));
