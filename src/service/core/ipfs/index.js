import logger from '../winston/index.js'
import {File, Web3Storage} from 'web3.storage'
import axios from "axios";

export const makeStorageClient = (token = process.env.WEB3_TOKEN) => new Web3Storage({token})


/**
 * Persist lowDB in-memory to ipfs
 * @param clientWeb3 - Web3.storage client
 * @param db - LowDB in-memory database
 * @param mutex - Mutex to prevent concurrent modification
 * @returns {Promise<boolean>}
 */
export const persistDb = async (clientWeb3, db, mutex) => {
    try {
        await db.read()

        logger.debug('Create files with all guild...')
        const files = Object.keys(db.data).map(k => new File(
            [Buffer.from(JSON.stringify(db.data[k]))],
            `${k}.json`
        ))
        logger.debug('Create files with all guild done.')

        logger.debug('Upload new backup to IPFS...')
        const cid = await clientWeb3
            ?.put(files)
            ?.catch((e) => logger.error(e));
        if (!cid) logger.error('Upload new backup to IPFS failed')
        else logger.info('Upload new backup to IPFS done.')

        return true
    } catch (e) {
        logger.error(e)
        return false
    }
}

/**
 * Retrieve last persisted database to lowDB in-memory from ipfs
 * @param clientWeb3 - Web3.storage client
 * @param db - LowDB in-memory database
 * @param mutex - Mutex to prevent concurrent modification
 * @param lastUploadIsCorrupted - True if the last upload is corrupted (e.g.: due to Heroku cycling events)
 * @returns {Promise<null|Low>}
 */
export const loadDb = async (clientWeb3, db, mutex, lastUploadIsCorrupted) => {
    try {
        await mutex.runExclusive(async () => {
            const lastUploadCid = await retrieveLastUploadCid(lastUploadIsCorrupted)
            logger.debug('Fetch all guild files...')
            if (lastUploadIsCorrupted) {
                logger.warn(`Last upload is corrupted. We will then use penultimate upload ${lastUploadCid} !`)
            }
            let res = await clientWeb3?.get(lastUploadCid)?.catch((e) => {
                logger.error(e);
                return {ok: false};
            });
            if (!res || !res?.ok) throw Error('Failed to fetch guild files.')
            logger.debug('Fetch all guild files done.')

            logger.debug('Process all guild files...')
            const files = await res.files()
            if (!files) throw Error('Failed to load files.')
            for (const file of files) {
                db.data[file.name.replace('.json', '')] = JSON.parse(await file.text())
            }
            db.write()
            logger.debug('Process all guild files done.')
        })

        return db
    } catch (e) {
        logger.error(e)
        if (e.message?.includes('Unexpected end of data')) {
            await loadDb(clientWeb3, db, mutex, true)
        } else {
            await new Promise((resolve) => setTimeout(resolve, 5000))
            await loadDb(clientWeb3, db, mutex, false)
        }
        return null
    }
}

/**
 * Retrieve the cid of the last persisted database from IPFS
 * @param lastUploadIsCorrupted - True if the last upload is corrupted (e.g.: due to Heroku cycling events)
 * @returns {Promise<null|Low>}
 */
export const retrieveLastUploadCid = async (lastUploadIsCorrupted) => {
    logger.debug('Fetch last directory...')
    let lastUpload = null
    const size = lastUploadIsCorrupted ? 2 : 1
    try {
        const headers = {
            'Authorization': `Bearer ${process.env.WEB3_TOKEN}`
        }
        const res = await axios(`https://api.web3.storage/user/uploads?size=${size}`, {headers})
        lastUpload = res.data
    } catch (e) {
        logger.debug('Fetch last directory failed.')
    }
    if (!lastUpload || lastUpload.length < size) throw Error('Fetch last directory failed.')
    logger.debug('Fetch last directory done.')
    return lastUpload[size - 1].cid;
}
