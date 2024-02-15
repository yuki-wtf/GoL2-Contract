import fs from "fs";
import { AppDataSource } from "./db";

/* This function was used to generate the gol2-whitelist.json file. 
   Cairo developer needed this file to generate the whitelist proofs for pre migration generations.
   This function is no longer used and is kept here for historical purposes.
*/

export const generateGameEvolvedDetails = async () => {
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
