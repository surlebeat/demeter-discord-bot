import {COMMANDS_NAME} from '../index.js';
import logger from '../../../core/winston/index.js';
import Moment from 'moment';
import {isTwitterEnabled} from '../../util/helper.js';
import {makeDiscord} from "../../data";

/**
 *
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const processTwitter = async (interaction, guildUuid, db, mutex) => {
  try {
    if (!guildUuid) return true

    //TODO isTwitterEnabled doit renvoyer true si la clé d'API Twitter est définie
    if (!isTwitterEnabled(db.data[guildUuid])) {
      await interaction
        ?.reply({content: 'Twitter is not enabled !', ephemeral: true})
        ?.catch(() => logger.error('Reply interaction failed.'))
      return true
    }

    //TODO Vérifier que le rôle Twitter Admin est bien défini
    if (await proposeTwitterPost(interaction, guildUuid, db, mutex)) return true

    return false;
  } catch (e) {
    logger.error(e)
    await interaction
      ?.reply({content: 'Something went wrong...', ephemeral: true})
      ?.catch(() => logger.error('Reply interaction failed.'))
    return true
  }
}

/**
 * Post a message on Twitter
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const proposeTwitterPost = async (interaction, guildUuid, db, mutex) => {
  try {
    if (interaction?.commandName !== COMMANDS_NAME.TWITTER_POST.name) return false

    logger.debug('Proposing a Twitter post...')
    const postContent = interaction.data.resolved.messages.content
    const startDate = Moment()
    const endDate = Moment(startDate).add(proposal?.duration, 'days')
    logger.debug('Create proposal...')
    let proposalDescription = `<@!${interaction.member.id}> suggests posting the following content on Twitter.`
      + `\nDo you agree?`
      + `\n\nYou have until ${endDate?.format('dddd, MMMM Do YYYY, h:mm a')} to vote.`
      + `\n\n${postContent}}`

    const proposalMessage = await channel
      ?.send(proposalDescription)
      ?.catch(() => null)
    if (!proposalMessage) {
      logger.error('Failed to post proposal.')
      return true
    }
    await proposalMessage
      ?.react('✅')
      ?.catch(() => logger.error('Failed to react start proposal.'))
    await proposalMessage
      ?.react('❌')
      ?.catch(() => logger.error('Failed to react start proposal.'))

    db.data[guildUuid].discordProposals[proposalId].startDate = startDate.toISOString()
    db.data[guildUuid].discordProposals[proposalId].proposalMessageId = proposalMessage.id

    db.data[guildUuid].twitterProposals[proposalMessage.id] = makeDiscord.makeTwitterPostProposal(
      startDate,
      endDate,
      interaction.member.id,
      duration,
      postContent
    )

    await db.write()

    logger.debug('Create proposal done.')
    console.log(message)
    logger.debug('Proposing a Twitter post done.')
    return true
  } catch
    (e) {
    logger.error(e)
    return true
  }
}
