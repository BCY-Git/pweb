import { Module } from '@nestjs/common'
import { CsdnController } from './csdn.controller'
import { CsdnCrawler } from './csdn.crawler'
import { CsdnService } from './csdn.service'

@Module({
  controllers: [CsdnController],
  providers: [CsdnService, CsdnCrawler],
})
export class CsdnModule {}
