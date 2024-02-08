import fs from "fs";
import { AppDataSource } from "./db";

export const generateWhitelistMintGenerations = async () => {
  const infinite = await AppDataSource.query(`
    SELECT "transactionOwner", "gameGeneration", "gameState", "createdAt"
    FROM "public"."infinite"
    WHERE "transactionType" = 'game_evolved'
    ORDER BY "gameGeneration" ASC
`);

  // @ts-ignore
  const processedData = infinite.reduce((acc, row) => {
    acc[row.gameGeneration] = {
      user_id: row.transactionOwner,
      game_state: row.gameState,
      timestamp: Math.floor(row.createdAt.getTime() / 1000), // Convert to Unix seconds
    };
    return acc;
  }, {});

  // Convert to JSON string with pretty formatting
  const jsonData = JSON.stringify(processedData, null, 2);

  // Write to a file
  fs.writeFile("gol2-whitelist.json", jsonData, (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("Successfully wrote to gol2-whitelist.json");
  });
};
