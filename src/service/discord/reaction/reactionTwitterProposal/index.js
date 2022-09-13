import logger from '../../../core/winston/index.js'
import {fetchReaction} from '../../util/helperDiscord.js'
import {findUserUuidByDiscordId} from '../../user/index.js'
import {postOnTwitter} from "../../../core/twitter/index.js";

/**
 * Add/remove vote for a Twitter post proposal, check if there is enough reputation to post on Twitter
 * @param messageReaction - Discord message reaction
 * @param user - Discord user author of this reaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
const voteOnProposal = async (messageReaction, user, guildUuid, db, mutex) => {
    try {
        if (messageReaction?.emoji?.name !== '✅' && messageReaction?.emoji?.name !== '❌') return false

        await mutex.runExclusive(async () => {
            await db.read()

            logger.debug('Check if this message is a vote for Twitter post proposal...')
            const twitterProposals = db?.data[guildUuid]?.twitterProposals
            if (!twitterProposals) return false
            const proposal = twitterProposals[messageReaction?.message?.id]
            if (!proposal) return false
            logger.debug('Check if this message is a start proposal done.')

            logger.debug('Fetch all reaction from this message...')
            const reactions = await fetchReaction(messageReaction?.message, {})
            logger.debug('Fetch all reaction from this message done.')

            logger.debug('Sum all reputation in favor and against...')
            let sumFor = 0
            let nbInFavorMembers = 0
            let sumAgainst = 0
            let sumForCount = 0
            let sumAgainstCount = 0
            const guild = messageReaction.message.guild
            const twitterMemberRole = db?.data[guildUuid]?.config.twitterMemberRole
            for (const reaction of reactions) {
                const userUuid = findUserUuidByDiscordId(reaction.senderDiscordId, db?.data[guildUuid]?.users)
                const user = userUuid
                    ? db?.data[guildUuid]?.users[userUuid]
                    : {
                        reputations: [
                            db?.data[guildUuid]?.rounds[db?.data[guildUuid]?.rounds?.length - 1]?.config?.defaultReputation
                        ]
                    }
                const multiple = reactions?.filter(r => r.senderDiscordId === reaction.senderDiscordId)?.length
                if (reaction.emoji === '✅') {
                    sumFor += user?.reputations[user?.reputations.length - 1] / multiple
                    sumForCount += 1 / multiple
                    const member = guild.members.cache.find(member => member.user.id === user.discordId);
                    if (member?.roles.cache.has(twitterMemberRole))
                        nbInFavorMembers++
                }
                if (reaction.emoji === '❌') {
                    sumAgainst += user?.reputations[user?.reputations.length - 1] / multiple
                    sumAgainstCount += 1 / multiple
                }
            }
            logger.debug('Sum all reputation in favor and against done.')
            const tokens = messageReaction?.message?.content.split('\n\n')
            if (sumAgainst >= db?.data[guildUuid]?.config?.twitterMinRepProposal) {
                await messageReaction?.message
                    ?.edit(tokens[0]
                        + '\n\n'
                        + tokens[2]
                        + `\n\n**More than ${new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(sumAgainst)} reputations voted against the proposal.** The content will not be posted on Twitter.`)
                    ?.catch(() => logger.error('Failed to update proposal message.'))
                delete db.data[guildUuid].twitterProposals[messageReaction?.message?.id]
                await db.write()
                return true
            }

            if (sumFor < db?.data[guildUuid]?.config?.twitterMinRepProposal) return true

            if (nbInFavorMembers < db?.data[guildUuid]?.config?.twitterMinInFavorMembers) return true

            logger.debug('Update proposal message and post on Twitter...')

            const postLink = await postOnTwitter(proposal.postContent, messageReaction, guildUuid, db)

            await messageReaction?.message
                ?.edit(tokens[0]
                    + '\n\n'
                    + tokens[2]
                    + `\n\n✅ ${sumForCount} users(${new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(sumFor)} reputations - ${nbInFavorMembers} members)`
                    + `\n❌ ${sumAgainstCount} users(${new Intl.NumberFormat('en-US', {maximumFractionDigits: 2}).format(sumAgainst)} reputations)`
                    + `\n**The proposal is accepted!** The content has been posted on Twitter :`
                    + `\n${postLink}`
                )
                ?.catch(() => logger.error('Failed to update proposal message.'))
            delete db.data[guildUuid].twitterProposals[messageReaction?.message?.id]
            await db.write()

            logger.debug('Update proposal message and post on Twitter done.')
        })

        return true
    } catch (e) {
        logger.error(e)
        return true
    }
}

/**
 *
 * @param messageReaction - Discord message reaction
 * @param user - Discord user author of this reaction
 * @param isRemove - True if the author remove his reaction, false if the author react
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const processTwitterProposal = async (messageReaction, user, isRemove, guildUuid, db, mutex) => {
    try {

        if (await voteOnProposal(messageReaction, user, guildUuid, db, mutex)) return true

        return false
    } catch (e) {
        logger.error(e)
        await messageReaction.message.channel.send('Something went wrong...')
        return true
    }
}
