import Moment from 'moment'
import logger from '../../../core/winston/index.js'
import {makeDiscord} from "../../data/index.js";

const antiSpamMap = new Map();

/**
 * Protect the guild from spams
 * @param message - Discord message
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @returns {Promise<boolean>}
 */
export const processAntiSpam = async (message, guildUuid, db) => {
    logger.debug('Process antispam...')
    try {
        if (!guildUuid || message?.author?.id === message?.client?.user?.id) return false

        clearOldMessages();
        const lastUserMessages = antiSpamMap.get(message?.author?.id) || new Map()
        const sameMessages = lastUserMessages.get(message.content) || {firstDate: Moment().toISOString(), occurrences: 0, messages: []}
        sameMessages.messages.push(message)
        sameMessages.occurrences++;
        if(sameMessages.occurrences === 3) {
            logger.debug(`${message.guild.id}: [${message.author.username}] has been automatically muted because of his spams "${message.content}"`)
            db.data[guildUuid].discordMutedUsers[message.author.id] = makeDiscord.makeDiscordMute(
                Moment().toISOString(),
                Number.MAX_VALUE
            )

            for (const spam of sameMessages.messages) {
                await spam
                    ?.delete()
                    ?.catch(() => logger.error('Failed to delete spam'));
            }

            let messageContent = message.content
            if(messageContent.length > 20)
                messageContent = messageContent.substring(0, 20) + '...'
            await message.channel
                ?.send(`${message.author} has been automatically muted because of his spams "${messageContent}". You might want to ban him.`)
                ?.catch(() => null)
            logger.debug('Process antispam done.')
            return true
        } else {
            lastUserMessages.set(message.content, sameMessages)
            antiSpamMap.set(message.author.id, lastUserMessages)
        }
        logger.debug('Process antispam done.')
        return false
    } catch (e) {
        logger.error(e)
        await message.channel.send('Something went wrong...')
        return true
    }
}

const clearOldMessages = () => {
    const antiSpamMapKeysToDelete = [];
    antiSpamMap.forEach((lastUserMessages, userId) => {
        const lastUserMessageKeysToDelete = [];
        lastUserMessages.forEach((message, messageContent) => {
            if (Moment(message.firstDate).add(1, 'minute').isBefore(Moment()))
                lastUserMessageKeysToDelete.push(messageContent)
        })
        lastUserMessageKeysToDelete.forEach(messageContent => lastUserMessages.delete(messageContent))
        if(lastUserMessages.size === 0)
            antiSpamMapKeysToDelete.push(userId)
    })
    antiSpamMapKeysToDelete.forEach(userId => antiSpamMap.delete(userId))
}