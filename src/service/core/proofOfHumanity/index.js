import logger from '../winston/index.js';
import Moment from 'moment';
import {isPoHEnabled} from '../../discord/util/helper.js';

/**
 * Check if some PoH vouches have expired
 * @param db - In-memory database
 * @param mutex - Mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const checkPoHVouches = async (db, mutex) => {
  try {
    await mutex.runExclusive(async () => {
      await db.read()

      logger.debug('Check for all guild if some PoH vouches have expired...')
      for(const guildUuid in db?.data) {
        if(!isPoHEnabled(db.data[guildUuid]))
          continue
        const candidates = db?.data[guildUuid]?.pohCandidates

        if (!candidates || !Object.keys(candidates).length) {
          logger.debug(`Guild ${guildUuid} doesn't have any candidate!`)
          continue
        }

        for (const candidateId in candidates) {
          const candidate = candidates[candidateId]
          const endDate = Moment(candidate.date)
            .add(1, 'days')
          if (endDate.isAfter(Moment())) continue

          logger.info(`Guild ${guildUuid} - vouch of ${candidateId} has expired`)
          delete db.data[guildUuid].pohCandidates[candidateId].voucher
          delete db.data[guildUuid].pohCandidates[candidateId].date
          db.data[guildUuid].pohCandidates[candidateId].waiting = true
        }
      }
      await db.write()
    })
    logger.debug('Check for all guild if some PoH vouches have expired done.')
    return true
  } catch (e) {
    logger.error(e)
    return false
  }
}
