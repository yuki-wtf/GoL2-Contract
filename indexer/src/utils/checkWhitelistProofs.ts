import { AppDataSource } from "./db"
import { saveWhitelistProofsFromFileToDB } from "./saveWhitelistProofsFromFileToDB"

export const checkWhitelistProofs = async () => {
    const res = await AppDataSource.query(`SELECT EXISTS(SELECT 1 FROM whitelist LIMIT 1) AS isNotEmpty;`)
    console.log('resres', res)
    const isNotEmpty = res[0]?.isnotempty
    if(isNotEmpty) {
        console.log('Whitelist proofs already exist. Skipping...')
        return
    }

    try {
        await saveWhitelistProofsFromFileToDB()
    }catch(err) {
        console.error('Error saving whitelist proofs to DB', err)
    }   
}