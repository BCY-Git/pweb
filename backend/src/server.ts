/**
 * 生产环境统一入口（前端静态托管 + NestJS API）。
 *
 * 方案：用 NestFactory.create<NestExpressApplication> 创建应用，
 * 然后通过 app.use() 在 NestJS 路由器之后注册一个兜底中间件：
 *   - express.static 处理 assets 等静态文件
 *   - 未命中的非 API GET 请求返回 index.html（SPA fallback）
 *
 * NestJS 11 + Express 5 不再支持裸 '*' 通配路由，
 * 因此不能用 @All('*') Controller 或 ServeStaticModule（path-to-regexp 报错）。
 * use() 注册的中间件不受此限制，能正常兜底。
 */
import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { json, static as expressStatic, urlencoded } from 'express'
import type { NextFunction, Request, Response } from 'express'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  })
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')
  const isProd = config.get<string>('nodeEnv') === 'production'

  // 全局前缀：业务 API 走 /api/v1，health 排除
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: 0 } as never],
  })

  // 安全响应头（生产放宽 CSP）
  app.use(isProd ? helmet({ contentSecurityPolicy: false }) : helmet())
  app.enableCors({
    origin: isProd
      ? true
      : (config.get<string[]>('corsOrigins') ?? []),
    credentials: true,
  })
  app.use(json({ limit: '1mb' }))
  app.use(urlencoded({ extended: true }))

  // 全局管道/过滤器/拦截器
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BCY 个人网站 API')
    .setDescription('个人简历站后端接口文档')
    .setVersion('1.0')
    .build()
  SwaggerModule.setup('api-docs', app, SwaggerModule.createDocument(app, swaggerConfig))

  // 静态文件 + SPA fallback（use 注册的中间件在 Nest 路由器之后执行，
  // 作为未匹配请求的兜底，正好符合 SPA 单页应用的需求）
  const staticDir = config.get<string>('staticDir')
  if (staticDir) {
    const absStaticDir = join(process.cwd(), staticDir)
    if (existsSync(absStaticDir)) {
      const indexFile = join(absStaticDir, 'index.html')
      // express.static：命中即返回，未命中调用 next()
      app.use(expressStatic(absStaticDir, { index: false }))
      // SPA fallback：剩余的非 API GET 请求返回 index.html
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.method !== 'GET' || req.path.startsWith('/api/')) {
          return next()
        }
        if (existsSync(indexFile)) {
          return res.type('html').send(readFileSync(indexFile, 'utf-8'))
        }
        return next()
      })
      logger.log(`静态文件托管: ${absStaticDir}`)
    }
  }

  const port = config.get<number>('port') ?? 3000
  await app.listen(port)
  logger.log(`服务已启动: http://localhost:${port}`)
  logger.log(`Swagger 文档: http://localhost:${port}/api-docs`)
  logger.log(`健康检查: http://localhost:${port}/health`)
}

bootstrap().catch((err) => {
  console.error('启动失败', err)
  process.exit(1)
})
