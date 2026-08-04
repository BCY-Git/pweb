import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

/**
 * 全局 Prisma 客户端。
 *
 * 继承 PrismaClient，实现 OnModuleDestroy 在应用关闭时优雅断开连接。
 * 通过 PrismaModule 的 @Global() 全局可用，业务模块直接注入即可。
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    })
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('断开 Prisma 数据库连接')
    await this.$disconnect()
  }
}
