import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { CsdnService } from './csdn.service'
import {
  CsdnArticleDto,
  CsdnOverviewDto,
  CsdnSnapshotDto,
  CsdnSyncResultDto,
} from './csdn.dto'

@ApiTags('CSDN 博客')
@Controller('csdn')
export class CsdnController {
  constructor(private readonly csdnService: CsdnService) {}

  @Get('overview')
  @ApiOperation({ summary: 'CSDN 概览（最新快照 + 增量）' })
  @ApiOkResponse({ type: CsdnOverviewDto })
  getOverview() {
    return this.csdnService.getOverview()
  }

  @Get('trend')
  @ApiOperation({ summary: 'CSDN 统计趋势（最近 N 天）' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  @ApiOkResponse({ type: [CsdnSnapshotDto] })
  getTrend(@Query('days') days?: string) {
    return this.csdnService.getTrend(days ? Number(days) : 30)
  }

  @Get('articles')
  @ApiOperation({ summary: 'CSDN 文章列表（含阅读/点赞/评论数）' })
  @ApiOkResponse({ type: [CsdnArticleDto] })
  getArticles() {
    return this.csdnService.getArticles()
  }

  @Post('sync')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @ApiOperation({ summary: '手动触发一次同步（限流：每分钟 3 次）' })
  @ApiOkResponse({ type: CsdnSyncResultDto })
  sync() {
    return this.csdnService.syncAll()
  }
}
