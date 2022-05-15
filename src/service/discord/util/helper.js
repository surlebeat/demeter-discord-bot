/**
 * Return true is PoH is enabled
 * @param guildDb - In-memory database
 * @returns {Boolean}
 */
export const isPoHEnabled = (guildDb) => {
  return guildDb.config.pohVouchersReward && guildDb.config.pohVouchersReward >= 0
}
