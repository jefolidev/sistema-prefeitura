import z from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  URL_REDIS: z.string(),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string(),
  URL_BACKEND: z.string().default('http://localhost:4444'),
  JWT_SECRET: z.string().default('mysecret'),
  JWT_REFRESH_SECRET: z.string().default('myanothersecret'),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
})

export type Env = z.infer<typeof envSchema>

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Variáveis de ambiente inválidas:', _env.error.format())
  throw new Error('Configuração de ambiente inválida.')
}

export const env = _env.data
