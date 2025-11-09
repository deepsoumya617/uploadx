import dotenv from 'dotenv'
import z from 'zod'

dotenv.config()

// zod schema for validation
const envSchema = z.object({
  PORT: z.string().default('8080'),
})

// validate
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', z.treeifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data
