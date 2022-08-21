import logger from '../../core/winston/index.js'
import {processReplyGrant} from './replyGrant/index.js'
import {processMute} from './mute/index.js'
import {checkIgnored} from './ignore/index.js';
import {processAntiSpam} from "./anti-spam/index.js";

/**
 *
 * @param message - Discord message
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const processMessage = async (message, db, mutex) => {
    try {
        const guildUuid = Object.keys(db?.data)
            ?.find(uuid => db?.data[uuid]?.guildDiscordId === message?.guildId)
        if (!guildUuid) return true

        if (await processMute(message, guildUuid, db, mutex)) return true

        if (await processAntiSpam(message, guildUuid, db)) return true

        if(message.type !== 'REPLY') return true

        const messageOrig = await message?.channel?.messages
          ?.fetch(message?.reference?.messageId)
          ?.catch(() => null)
        if (await checkIgnored(messageOrig, guildUuid, db, mutex)) return true

        await processReplyGrant(message, guildUuid, db, mutex)
        return true
    } catch (e) {
        logger.error(e)
        await message.channel.send('Something went wrong...')
        return true
    }
}
