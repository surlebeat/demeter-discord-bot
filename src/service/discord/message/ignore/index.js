import logger from '../../../core/winston/index.js'
import {fetchReaction} from '../../util/helperDiscord.js';
import {findUserUuidByDiscordId} from '../../user/index.js';

/**
 * Check if message should be ignored
 * @param message - Discord message
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const checkIgnored = async (message, guildUuid, db, mutex) => {
  try {

    if (!guildUuid || !db?.data[guildUuid].config.minReputationIgnore)
      return false

    logger.debug('Check if ignored...')

    let ignored = false

    logger.debug('Fetch all reaction from this message...')
    const reactions = await fetchReaction(message, {})
    logger.debug('Fetch all reaction from this message done.')

    const ignoreReactions = reactions.filter(r => r.emoji === '🙈')
    if (ignoreReactions.length) {
      if (ignoreReactions.find(r => r.senderDiscordId === r.receiverDiscordId)) {
        ignored = true
      } else {
        let sum = 0
        for (const reaction of ignoreReactions) {
          const userUuid = findUserUuidByDiscordId(reaction.senderDiscordId, db?.data[guildUuid]?.users)
          const user = userUuid
            ? db?.data[guildUuid]?.users[userUuid]
            : {
              reputations: [
                db?.data[guildUuid]?.rounds[db?.data[guildUuid]?.rounds?.length - 1]?.config?.defaultReputation
              ]
            }
          sum += user?.reputations[user?.reputations.length - 1]
          if (sum >= db.guild.config.minReputationIgnore) {
            ignored = true
            break
          }
        }
      }
    }

    logger.debug(`Check if ignored done (ignored = ${ignored}).`)

    return ignored
  } catch (e) {
    logger.error(e)
    await message.channel.send('Something went wrong...')
    return true
  }
}
