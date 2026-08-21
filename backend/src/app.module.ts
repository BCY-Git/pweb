import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { configValidationSchema } from './config/configuration'
import { PrismaModule } from './prisma/prisma.module'
import { ProfileModule } from './modules/profile/profile.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { SkillsModule } from './modules/skills/skills.module'
import { MessagesModule } from './modules/messages/messages.module'
import { CsdnModule } from './modules/csdn/csdn.module'

/**
 * 静态文件托管和 SPA fallback 由 main.ts 通过底层 Express 注册，
 * 避免 @nestjs/serve-static 与 Express 5 的 path-to-regexp 通配符兼容问题。
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    PrismaModule,
    ProfileModule,
    ProjectsModule,
    SkillsModule,
    MessagesModule,
    CsdnModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
