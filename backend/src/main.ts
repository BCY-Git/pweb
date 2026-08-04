import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

/**
 * 应用启动入口。
 *
 * 全局装配：
 * - /api/v1 前缀
 * - helmet 安全响应头
 * - CORS（来源来自配置）
 * - 全局 ValidationPipe（防批量赋值、自动类型转换）
 * - 全局异常过滤器（统一错误响应）
 * - 全局响应转换拦截器（统一成功响应）
 * - Swagger 文档 /api-docs
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  // 全局前缀
  app.setGlobalPrefix('api/v1')

  // 安全响应头
  app.use(helmet())

  // CORS
  const corsOrigins = config.get<string[]>('corsOrigins') ?? []
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  })

  // 全局管道：白名单校验 + 拒绝多余字段 + 自动类型转换
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // 全局异常过滤 / 响应转换
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  // Swagger 文档
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Martin Portfolio API')
    .setDescription('个人简历站后端接口文档')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('api-docs', app, document)

  const port = config.get<number>('port') ?? 3000
  await app.listen(port)
  logger.log(`服务已启动: http://localhost:${port}`)
  logger.log(`Swagger 文档: http://localhost:${port}/api-docs`)
  logger.log(`健康检查: http://localhost:${port}/api/v1/health`)
}

bootstrap().catch((err) => {
  console.error('启动失败', err)
  process.exit(1)
})
