/**
 * Return true if PoH is enabled
 * @param guildDb - In-memory database
 * @returns {Boolean}
 */
export const isPoHEnabled = (guildDb) => {
  const pohVouchersReward = guildDb.config.pohVouchersReward
  return pohVouchersReward !== undefined && pohVouchersReward >= 0
}

/**
 * Return true if Twitter is enabled
 * @param guildDb - In-memory database
 * @returns {Boolean}
 */
export const isTwitterEnabled = (guildDb) => {
  const twitterMinRepProposal = guildDb.config.twitterMinRepProposal
  return twitterMinRepProposal !== undefined && twitterMinRepProposal > 0
}
