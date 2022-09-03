/**
 * Return true if PoH is enabled
 * @param guildDb - In-memory database
 * @returns {Boolean}
 */
export const isPoHEnabled = (guildDb) => {
  return guildDb.config.pohVouchersReward && guildDb.config.pohVouchersReward >= 0
}

/**
 * Return true if Twitter is enabled
 * @param guildDb - In-memory database
 * @returns {Boolean}
 */
export const isTwitterEnabled = (guildDb) => {
  return guildDb.config.twitterRole !== undefined && guildDb.config.twitterRole !== null;
}
