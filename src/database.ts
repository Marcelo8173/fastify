import { knex as stupKnext, Knex } from 'knex'
import 'dotenv/config'

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: process.env.DATABASE_URL || '',
  },
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
  useNullAsDefault: true,
}

export const knex = stupKnext(config)
