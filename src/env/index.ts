import { config } from 'dotenv'
import { z as Zod } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

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
