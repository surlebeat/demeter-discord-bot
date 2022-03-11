import 'dotenv/config'
import {Mutex} from 'async-mutex'
import { persistDb, makeStorageClient} from './service/core/ipfs/index.js'
import createDb from './service/core/lowdb/index.js'

(async () => {
  if(!process.env.DISCORD_TOKEN){
    console.error('No DISCORD_TOKEN environment variable set ; Standard ways is to write it in a .env file')
    return
  }
  if(!process.env.WEB3_TOKEN){
    console.error('No WEB3_TOKEN environment variable set ; Standard ways is to write it in a .env file')
    return
  }

  process.env.SALT = {}
  // Mutex will be used to prevent concurrent modification on aleph,
  // it's slow inefficient BUT good enough for this use-case
  const mutex = new Mutex()

  // web3.storage client
  const clientWeb3 = await makeStorageClient()

  const db = await createDb()
  db.data.initiated=true

  await persistDb(clientWeb3, db, mutex)

  process.exit(0)

})()
