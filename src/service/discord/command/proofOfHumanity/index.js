import {COMMANDS_NAME} from '../index.js'
import logger from '../../../core/winston/index.js'
import {isPoHEnabled} from '../../util/helper.js';
import Moment from 'moment';

/**
 * Register the user running this command in the list of candidates
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const register = async (interaction, guildUuid, db, mutex) => {
  try {
    const command = interaction?.options?.data
      ?.find(d => d?.name === COMMANDS_NAME.POH.REGISTER.name)
    if (!command) return false

    logger.debug('Register candidate in POH list...')

    const profileUrl = command.options?.find(o => o?.name === COMMANDS_NAME.POH.REGISTER.PROFILE_URL.name)?.value

    if(!profileUrl) {
      logger.debug('The url to the PoH profile is missing')
      await interaction
        ?.reply({content: `Specify the url to your PoH profile with the "${COMMANDS_NAME.POH.REGISTER.PROFILE_URL.name}" option`, ephemeral: true})
        ?.catch(() => logger.error('Reply interaction failed.'))
      return true
    }

    await mutex.runExclusive(async () => {
      await db.read()
      if(!db.data[guildUuid].pohCandidates) {
        db.data[guildUuid].pohCandidates = {}
      }
      db.data[guildUuid].pohCandidates[interaction.member.id] = {waiting: true, profileUrl}
      await db.write()
    })
    logger.debug('Register candidate in POH list done.')

    await interaction
      ?.reply({content: 'Done !', ephemeral: true})
      ?.catch(() => logger.error('Reply interaction failed.'))
    return true
  } catch (e) {
    logger.error(e)
    return true
  }
}

/**
 * Unregister the user running this command from the list of candidates
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const unregister = async (interaction, guildUuid, db, mutex) => {
  try {
    if (!interaction?.options?.data
      ?.find(d => d?.name === COMMANDS_NAME.POH.UNREGISTER.name)) return false

    logger.debug('Unregister candidate in POH list...')

    await mutex.runExclusive(async () => {
      await db.read()
      delete db.data[guildUuid].pohCandidates[interaction.member.id]
      await db.write()
    })

    logger.debug('Unregister candidate in POH list done.')

    await interaction
      ?.reply({content: 'Done !', ephemeral: true})
      ?.catch(() => logger.error('Reply interaction failed.'))
    return true
  } catch (e) {
    logger.error(e)
    return true
  }
}

/**
 * Print the list of candidates
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const listCandidates = async (interaction, guildUuid, db, mutex) => {
  try {
    if (!interaction?.options?.data
      ?.find(d => d?.name === COMMANDS_NAME.POH.LIST.name)) return false

    logger.debug('Print the list of candidates in POH...')

    await mutex.runExclusive(async () => {
      await db.read()
      if(!Object.keys(db.data[guildUuid].pohCandidates).length) {
        await interaction
          ?.reply({content: 'There are no candidates at the moment', ephemeral: true})
          ?.catch(() => logger.error('Reply interaction failed.'))
      } else {
        await interaction
          ?.reply({content: Object.keys(db.data[guildUuid].pohCandidates)
          .map(printPOHCandidate(db, guildUuid))
          .join('\n'), ephemeral: true})
      }
    })

    logger.debug('Print the list of candidates in POH done.')

    return true
  } catch (e) {
    logger.error(e)
    return true
  }
}

/**
 * Print the list of already vouched candidates
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const listVouchedCandidates = async (interaction, guildUuid, db, mutex) => {
  try {
    if (!interaction?.options?.data
      ?.find(d => d?.name === COMMANDS_NAME.POH.LIST_VOUCHED.name)) return false

    logger.debug('Print the list of already vouched candidates in POH...')

    await mutex.runExclusive(async () => {
      await db.read()
      if(!Object.keys(db.data[guildUuid].pohVouchedCandidates).length) {
        await interaction
          ?.reply({content: 'There are no vouched candidates yet', ephemeral: true})
          ?.catch(() => logger.error('Reply interaction failed.'))
      } else {
        await interaction
          ?.reply({content: Object.keys(db.data[guildUuid].pohCandidates)
              .map(printPOHVouchedCandidate())
              .join('\n'), ephemeral: true})
      }
    })

    logger.debug('Print the list of already vouched candidates in POH done.')

    return true
  } catch (e) {
    logger.error(e)
    return true
  }
}

/**
 * Vouch a candidate
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const vouch = async (interaction, guildUuid, db, mutex) => {
  try {
    const command = interaction?.options?.data
      ?.find(d => d?.name === COMMANDS_NAME.POH.VOUCH.name)
    if (!command) return false

    logger.debug('Vouch a candidate from POH list...')
    const userToVouch = command.options?.find(o => o?.name === COMMANDS_NAME.POH.VOUCH.USER.name)?.value

    if(!userToVouch) {
      logger.debug('User to vouch option is missing')
      await interaction
        ?.reply({content: `Specify a user to vouch with the "${COMMANDS_NAME.POH.VOUCH.USER.name}" option`, ephemeral: true})
        ?.catch(() => logger.error('Reply interaction failed.'))
      return true
    }

    if(!db.data[guildUuid].pohCandidates[userToVouch]) {
      logger.debug('User to vouch is not registered')
      await interaction
        ?.reply({content: 'This user is not registered, verify you spelled his pseudo correctly', ephemeral: true})
        ?.catch(() => logger.error('Reply interaction failed.'))
      return true
    }

    if(userToVouch === interaction.member.id) {
      logger.debug('User tries to vouch itself')
      await interaction
        ?.reply({content: 'Nice try, but you cannot vouch yourself!', ephemeral: true})
        ?.catch(() => logger.error('Reply interaction failed.'))
      return true
    }

    if(userToVouch) {
      await mutex.runExclusive(async () => {
        await db.read()
        if(db.data[guildUuid].pohCandidates[userToVouch].voucher) {
          await interaction
            ?.reply({content: `Member is already being vouched by <@!${db.data[guildUuid].pohCandidates[userToVouch]?.voucher}> !`, ephemeral: true})
            ?.catch(() => logger.error('Reply interaction failed.'))
          return true
        } else {
          db.data[guildUuid].pohCandidates[userToVouch] = {voucher: interaction.member.id, date: Moment().toISOString()}
          await db.write()
        }
      })
    }

    logger.debug('Vouch a candidate from POH list done.')

    await interaction
      ?.reply({content: 'Done ! Be aware, if the user you just vouched does not thank you within the 24h, he will be considered as "waiting for a vouch" again.', ephemeral: true})
      ?.catch(() => logger.error('Reply interaction failed.'))
    return true
  } catch (e) {
    logger.error(e)
    return true
  }
}

/**
 * Unregister the user running this command from the list of candidates and thank his voucher
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const thankVoucher = async (interaction, guildUuid, db, mutex) => {
  try {
    if (!interaction?.options?.data
      ?.find(d => d?.name === COMMANDS_NAME.POH.THANK_VOUCHER.name)) return false

    logger.debug('Thank voucher...')

    await mutex.runExclusive(async () => {
      await db.read()

      let guildDb = db.data[guildUuid];
      if(!guildDb.pohVouchedCandidates) {
        guildDb.pohVouchedCandidates = []
        await db.write()
      }

      const candidate = interaction.member.id;
      const voucher = guildDb.pohCandidates[candidate]?.voucher

      if(!voucher) {
        logger.debug('No voucher found.')
        await interaction
          ?.reply({content: 'You have no voucher to thank', ephemeral: true})
          ?.catch(() => logger.error('Reply interaction failed.'))
        return true
      }

      const reward = guildDb.config.pohVouchersReward
      guildDb.rounds[guildDb.rounds.length - 1]
        .mints[candidate] ||= {}
      guildDb.rounds[guildDb.rounds.length - 1]
        .mints[candidate][voucher] ||= 0
      guildDb.rounds[guildDb.rounds.length - 1]
        .mints[candidate][voucher] += reward

      guildDb.pohVouchedCandidates.push({candidate, voucher, date: Moment().toISOString()})
      delete guildDb.pohCandidates[candidate]
      await db.write()

      logger.debug('Thank voucher done.')

      await interaction
        ?.reply({content: `Done ! <@!${voucher}> has been thanked with ${reward} reputations !`, ephemeral: true})
        ?.catch(() => logger.error('Reply interaction failed.'))
      return true
    })
  } catch (e) {
    logger.error(e)
    return true
  }
}

/**
 *
 * @param interaction - Discord interaction
 * @param guildUuid - Guild unique identifier
 * @param db - in-memory database
 * @param mutex - mutex to access database safely
 * @returns {Promise<boolean>}
 */
export const processProofOfHumanity = async (interaction, guildUuid, db, mutex) => {
  try {
    if (interaction?.commandName !== COMMANDS_NAME.POH.name) return false

    if (!guildUuid) return true

    if(!isPoHEnabled(db.data[guildUuid])) {
      await interaction
        ?.reply({content: 'PoH is not enabled !', ephemeral: true})
        ?.catch(() => logger.error('Reply interaction failed.'))
      return true
    }

    if(await register(interaction, guildUuid, db, mutex)) return true
    if(await unregister(interaction, guildUuid, db, mutex)) return true
    if(await listCandidates(interaction, guildUuid, db, mutex)) return true
    if(await listVouchedCandidates(interaction, guildUuid, db, mutex)) return true
    if(await vouch(interaction, guildUuid, db, mutex)) return true
    if(await thankVoucher(interaction, guildUuid, db, mutex)) return true

    await interaction
      ?.reply({content: 'Done !', ephemeral: true})
      ?.catch(() => logger.error('Reply interaction failed.'))
    return true
  } catch (e) {
    logger.error(e)
    await interaction
      ?.reply({content: 'Something went wrong...', ephemeral: true})
      ?.catch(() => logger.error('Reply interaction failed.'))
    return true
  }
}

function printPOHCandidate(db, guildUuid) {
  return (key, i) => `${i + 1} - <@!${key}> => ${db.data[guildUuid].pohCandidates[key].waiting ? `${db.data[guildUuid].pohCandidates[key].profileUrl}` : `Being vouched by <@!${db.data[guildUuid].pohCandidates[key].voucher}>`}`;
}

function printPOHVouchedCandidate() {
  return (vouchedCandidate, i) => `${i + 1} - <@!${vouchedCandidate.candidate}> => vouched by <@!${vouchedCandidate.voucher}> the ${vouchedCandidate.date}`;
}
