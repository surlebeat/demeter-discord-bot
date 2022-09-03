import {COMMANDS_NAME} from '../index.js';
import logger from '../../../core/winston/index.js';
import Moment from 'moment';
import {isTwitterEnabled} from '../../util/helper.js';

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
    if(!isTwitterEnabled(db.data[guildUuid])) {
      await interaction
        ?.reply({content: 'Twitter is not enabled !', ephemeral: true})
        ?.catch(() => logger.error('Reply interaction failed.'))
      return true
    }

    //TODO Vérifier que le rôle Twitter Admin est bien défini
    if(await postOnTwitter(interaction, guildUuid, db, mutex)) return true

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
export const postOnTwitter = async (interaction, guildUuid, db, mutex) => {
  try {
    if (interaction?.commandName !== COMMANDS_NAME.TWITTER_POST.name) return false

    logger.debug('Posting a message on Twitter...')
    const message = interaction.data.resolved.messages.content
    console.log(message)
    logger.debug('Posting a message on Twitter done.')
    return true
  } catch (e) {
    logger.error(e)
    return true
  }
}
