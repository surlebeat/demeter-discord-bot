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
 * Return post content based on a given array of string containing the proposal paragraph
 * @param tokens - The Array of string containing the proposal paragraph
 * @returns {string}
 */
export const getPostContent = (tokens) => {
  let postContent = '';
  for(let i = 2; i < tokens.length; i++) {
    postContent += `\n\n${tokens[i]}`
  }
  return postContent;
}