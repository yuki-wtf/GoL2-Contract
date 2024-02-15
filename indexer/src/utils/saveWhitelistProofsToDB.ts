import fs from "fs/promises";
import { Whitelist } from "../entity/whitelist";
import { AppDataSource } from "./db";

type DetailsObject = {
    [generation: string]: {
        user_id: string;
        game_state: string;
        timestamp: number;
    };
}

/* 
  This function will read the details.json file and all the .json files in the whitelist folder and save the proofs to the database.
  You will need to run this function after you have unzipped the whitelist proofs folder in 'indexer' directory.
  You might only use this function once, when you are setting up the indexer for the first time with empty fresh db.
  Optionally, you can import whitelist proofs csv file to the database manually in which case you don't need to run this function.
*/

export const saveWhitelistProofsToDB = async () => {
  try {
    const whitelistFiles = (await fs.readdir("whitelist")).filter((filename) => filename.endsWith(".json") && filename !== "details.json");
    const detailsString = await fs.readFile(`whitelist/details.json`, "utf-8")
    const details: DetailsObject = JSON.parse(detailsString);
    whitelistFiles.forEach(async (filename) => {
      console.log(`Saving ${filename} ...`);
      await saveWhitelistProofsFromFileToDB(`whitelist/${filename}`, details);
      console.log(`${filename} saved to DB.`);
    });
  } catch (err) {
    console.error("saveWhitelistProofsToDB", err);
  }

};



const saveWhitelistProofsFromFileToDB = async (filename: string, details: DetailsObject) => {
  console.log(`Retrieving whitelist proofs from "${filename}" file.`);
  try {
    const dataRaw = await fs.readFile(filename, "utf8");
    const data = JSON.parse(dataRaw);

    const whitelist = [];
    try {
      // @ts-ignore
      for (const generation in data) {
        const proofs = data[generation];
        if (!proofs.length) continue;
        const proofText = proofs.join(",");
        const whitelistRow = new Whitelist();
        whitelistRow.generation = Number(generation);
        whitelistRow.proof = proofText;
        if(!details[generation]) {
          console.error(`No details found for generation ${generation}`);
        }
        whitelistRow.timestamp = details[generation].timestamp;
        whitelistRow.gameState = details[generation].game_state;
        whitelist.push(whitelistRow);
      }
      await AppDataSource.manager.save(whitelist);
      console.log("Data inserted successfully.");
    } catch (err) {
      console.error("Error inserting data", err);
    }
  } catch (err) {
    console.error("Error reading file", err);
  }
};
