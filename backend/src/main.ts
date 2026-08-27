import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { json, static as expressStatic, urlencoded } from 'express'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

/**
 * 应用启动入口。
 *
 * 全局装配：
 * - /api/v1 前缀
 * - helmet 安全响应头（生产放宽 CSP 以允许内联样式）
 * - CORS（来源来自配置）
 * - 全局 ValidationPipe（防批量赋值、自动类型转换）
 * - 全局异常过滤器（统一错误响应）
 * - 全局响应转换拦截器（统一成功响应）
 * - Swagger 文档 /api-docs
 * - 生产环境：SPA fallback，未匹配的非 API 请求回退到 index.html
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  })
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')
  const isProd = config.get<string>('nodeEnv') === 'production'

  // 全局前缀：所有业务 API 走 /api/v1
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  })

  // 静态文件托管 + SPA fallback 在 AppModule 中通过 ServeStaticModule 配置
  // 这里只负责其他全局装配

  // 安全响应头（生产环境需要允许内联样式，否则 React 应用样式会失效）
  if (isProd) {
    app.use(
      helmet({
        contentSecurityPolicy: false,
      }),
    )
  } else {
    app.use(helmet())
  }

  // CORS：生产同源部署，放宽来源
  const corsOrigins = config.get<string[]>('corsOrigins') ?? []
  app.enableCors({
    origin: isProd ? true : corsOrigins,
    credentials: true,
  })

  // body 解析（留言表单需要）
  app.use(json({ limit: '1mb' }))
  app.use(urlencoded({ extended: true }))

  // 全局管道：白名单校验 + 拒绝多余字段 + 自动类型转换
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // 静态文件托管 + SPA fallback（生产环境，同源部署）
  // 注意：Express 5 / path-to-regexp v8 不支持 '(.*)' 通配路由（运行时抛 PathError），
  // 且 Nest 11 在 listen() 时才注册路由，init 后挂载的兜底中间件实际排在 Nest 路由之前，
  // 会吞掉 /api-docs 等页面路由。因此采用：
  //   1. express.static 前置挂载（未命中 fallthrough，不影响 API 路由）
  //   2. SPA fallback 由全局异常过滤器兜底（404 + GET + 非 /api 时返回 index.html）
  const staticDir = config.get<string>('staticDir')
  const absStaticDir = staticDir ? join(process.cwd(), staticDir) : ''
  const spaIndexFile =
    absStaticDir && existsSync(join(absStaticDir, 'index.html'))
      ? join(absStaticDir, 'index.html')
      : ''
  if (spaIndexFile) {
    app.use(expressStatic(absStaticDir, { index: false }))
    logger.log(`静态文件托管: ${absStaticDir}`)
  }

  // 全局异常过滤 / 响应转换
  app.useGlobalFilters(new AllExceptionsFilter(spaIndexFile))
  app.useGlobalInterceptors(new TransformInterceptor())

  // Swagger 文档（生产也保留，方便查看）
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BCY 个人网站 API')
    .setDescription('个人简历站后端接口文档')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api-docs', app, document)

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
