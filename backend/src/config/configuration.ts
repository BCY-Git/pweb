/**
 * 应用配置加载与校验。
 *
 * 通过 @nestjs/config 的 ConfigModule.forRoot 注入，
 * 全项目用强类型 ConfigService.get<T>() 读取，避免裸 process.env。
 */
import * as Joi from 'joi'

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().required(),
  CORS_ORIGINS: Joi.string().default('http://localhost:5173'),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  INIT_ADMIN_PASSWORD: Joi.string().allow('').default(''),
  STATIC_DIR: Joi.string().allow('').default(''),
  CSDN_USERNAME: Joi.string().default('m0_64547013'),
})

export interface AppConfig {
  nodeEnv: string
  port: number
  databaseUrl: string
  corsOrigins: string[]
  jwtSecret: string
  jwtExpiresIn: string
  initAdminPassword: string
  staticDir: string
  csdnUsername: string
}

export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  initAdminPassword: process.env.INIT_ADMIN_PASSWORD ?? '',
  staticDir: process.env.STATIC_DIR ?? '',
  csdnUsername: process.env.CSDN_USERNAME ?? 'm0_64547013',
})
