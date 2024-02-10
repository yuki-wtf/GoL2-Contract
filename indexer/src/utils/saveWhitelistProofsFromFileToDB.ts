import fs from 'fs/promises'
import { Whitelist } from "../entity/whitelist";
import { AppDataSource } from './db';
import { exit } from 'process';

export const saveWhitelistProofsFromFileToDB = async (filename:string) => {
  console.log(`Retrieving whitelist proofs from "${filename}" file.`);
  const dataRaw = await fs.readFile(filename, "utf8");
  const data = JSON.parse(dataRaw);
 
  const whitelist = [];
  try {
    // @ts-ignore
    for (const generation in data) {
      const proofs = data[generation];
      if(!proofs.length) continue;
      const proofText = proofs.join(",");
      const whitelistRow = new Whitelist();
      whitelistRow.generation = Number(generation);
      whitelistRow.proof = proofText;
      whitelist.push(whitelistRow);
    }
    await AppDataSource.manager.save(whitelist);
    console.log("Data inserted successfully.");
  } catch (err) {
    console.error("Error inserting data", err);
    exit(1);
  }
};
