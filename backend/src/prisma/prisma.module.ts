import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

/**
 * 全局 Prisma 模块。
 *
 * 标记 @Global 后，其他业务模块无需再 import PrismaModule 即可注入 PrismaService。
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
