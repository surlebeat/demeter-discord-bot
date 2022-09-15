import AES from 'crypto-js/aes.js'
import enc from 'crypto-js/enc-utf8.js'

export const encrypt = (message) => {
    return AES.encrypt(message, process.env.ENCRYPTION_KEY).toString()
}

export const decrypt = (encrypted) => {
    return AES.decrypt(encrypted, process.env.ENCRYPTION_KEY).toString(enc)
}