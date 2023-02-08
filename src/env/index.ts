import 'dotenv/config'
import { z as Zod } from 'zod'

const envSchema = Zod.object({
  DATABASE_URL: Zod.string(),
  NODE_ENV: Zod.enum(['development', 'test', 'production']).default(
    'production',
  ),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid enrionment variables', _env.error.format())

  throw new Error('Invalid enrionment variables')
}

export const env = _env.data
