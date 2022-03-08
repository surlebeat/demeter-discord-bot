import logger from '../../../core/winston/index.js'

/**
 * Remove a discord role from all users
 * @param users - List of user in DB
 * @param roleToRemove - Role to remove
 * @param guildDiscordId - Guild Discord Id
 * @param client - Client Discord
 * @returns {Promise<{}|boolean>}
 */
export const removeReputationRoleFromAll = async (users, roleToRemove, guildDiscordId, {client}) => {
    try {
        logger.debug('Fetch guild...')
        const guild = await client?.guilds
          ?.fetch(guildDiscordId)
          ?.catch(() => null)
        if(!guild) return {}
        logger.debug('Fetch guild done.')

        logger.debug('Remove role base on reputation for all users...')
        for (const user of Object.values(users)){
            const member = await guild?.members
              ?.fetch(user?.discordId)
              ?.catch(() => null)
            if (!member)continue
            if (!member?.roles?.cache?.has(roleToRemove)) continue
            await member?.roles
              ?.remove(roleToRemove)
              ?.catch(() => logger.error(`Failed to remove role ${roleToRemove} to ${member?.id}`))
        }
        logger.debug('Remove role base on reputation for all users done.')
        return true
    } catch (e) {
        logger.error(e)
        return false
    }
}

/**
 * Update discord roles for all users based on their reputation
 * @param users - List of user in DB
 * @param reputationRoles - Roles
 * @param guildDiscordId - Guild Discord Id
 * @param client - Client Discord
 * @returns {Promise<{}|boolean>}
 */
export const updateReputationRole = async (users, reputationRoles, guildDiscordId, {client}) => {
    try {
        logger.debug('Fetch guild...')
        const guild = await client?.guilds
          ?.fetch(guildDiscordId)
          ?.catch(() => null)
        if(!guild) return {}
        logger.debug('Fetch guild done.')

        for(const role of Object.keys(reputationRoles)) {
            const requiredReputation = reputationRoles[role]

            logger.debug(`Update role ${role} base on reputation for all users...`)
            for (const user of Object.values(users)){
                const member = await guild?.members
                  ?.fetch(user?.discordId)
                  ?.catch(() => null)
                if (!member)continue
                const userReputation = user?.reputations[user?.reputations?.length - 1]
                if(!member?.roles?.cache.has(role) && userReputation >= requiredReputation) {
                    await member?.roles
                      ?.add(role)
                      ?.catch(() => logger.error(`Failed to add role ${role} to ${member?.id}`))
                } else if(member?.roles?.cache.has(role) && userReputation < requiredReputation) {
                    await member?.roles
                      ?.remove(role)
                      ?.catch(() => logger.error(`Failed to remove role ${role} to ${member?.id}`))
                }
            }
        }

        logger.debug('Add role base on reputation for all users done.')
        return true
    } catch (e) {
        logger.error(e)
        return false
    }
}
