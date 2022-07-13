import { AppDataSource, getLastRefresh, getLastSavedBlock, getAllViews } from "./utils/db";
import { logger } from "./utils/logger";

export const viewRefresher = async () => {
    const [refresh, block] = await Promise.all([
        getLastRefresh(),
        getLastSavedBlock(),
    ]);

    if (refresh?.hash === block?.hash) {
        logger.info({
            refreshHash: refresh?.hash,
            blockHash: block?.hash
        }, "Views don't need to be refreshed.");
        return;
    }

    const views = getAllViews();
    for (const view of views) {
        logger.info({view}, 'Refreshing view.')
        await AppDataSource.query(`refresh materialized view concurrently ${view};`);
    }

    logger.info({viewsCount: views.length}, "Refreshed all views.")
}
