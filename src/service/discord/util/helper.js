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
 * Return TWITTER_OAUTH2_CLIENT_ID env variable for a given guild
 * @param guildUuid - Guild unique identifier
 * @returns {string}
 */
export const getTwitterOauth2ClientIdFor = (guildUuid) => {
  return process.env['TWITTER_OAUTH2_CLIENT_ID_' + guildUuid]
}

/**
 * Return TWITTER_OAUTH2_CLIENT_SECRET env variable for a given guild
 * @param guildUuid - Guild unique identifier
 * @returns {string}
 */
export const getTwitterOauth2ClientSecretFor = (guildUuid) => {
  return process.env['TWITTER_OAUTH2_CLIENT_SECRET_' + guildUuid]
}

/**
 * Return post content based on a given array of tweets
 * @param tweets - The Array of tweets
 * @returns {string}
 */
export const formatTweetsForProposal = (tweets) => {
  let formatted = ''
  for (const tweetIndex in tweets) {
    formatted += `\n\n`
    if(tweetIndex === '0') {
      formatted += `[Begin]\n`
    } else {
      formatted +=  `[Reply n°${tweetIndex}]\n`
    }
    formatted += tweets[tweetIndex]
  }
  formatted += `\n[End]`
  return formatted
}