import fs from 'fs/promises'
import { saveWhitelistProofsFromFileToDB } from "./saveWhitelistProofsFromFileToDB"

export const checkWhitelistProofs = async () => {
    try {
        const whitelistFiles = await fs.readdir('whitelist')
        whitelistFiles.forEach(async (filename) => {
            console.log(`Saving ${filename} ...`)
            await saveWhitelistProofsFromFileToDB(`whitelist/${filename}`)
            console.log(`${filename} saved to DB.`)
        })
    }catch(err) {
        console.error('Error saving whitelist proofs to DB', err)
    }   
}