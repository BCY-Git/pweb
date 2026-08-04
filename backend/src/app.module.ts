import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { AppController } from './app.controller'
import { configValidationSchema } from './config/configuration'
import { PrismaModule } from './prisma/prisma.module'
import { ProfileModule } from './modules/profile/profile.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { SkillsModule } from './modules/skills/skills.module'
import { MessagesModule } from './modules/messages/messages.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    // 全局限流：防留言接口被刷。默认每分钟 100 次。
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: 100 },
    ]),
    PrismaModule,
    ProfileModule,
    ProjectsModule,
    SkillsModule,
    MessagesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
